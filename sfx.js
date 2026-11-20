// Short one-shot instruments: waveform, onset, duration, starting/ending Hz, gain.
const cues={
 evade:[['triangle',0,.055,890,290,.045],['sine',.035,.12,380,820,.036]],
 heal:[['sine',0,.15,392,400,.065],['triangle',.085,.16,494,500,.05],['sine',.16,.26,659,675,.05]],
 impact:[['sine',0,.38,168,39,.14],['triangle',.032,.19,290,63,.068]],
 dust:[['sine',0,.45,456,419,.033],['sine',.12,.44,682,648,.024]],
 awaken:[['sine',0,.13,103,52,.1],['sine',.18,.22,90,42,.09],['triangle',.28,.37,223,201,.033]],
 drift:[['sine',0,.16,226,190,.035],['triangle',.08,.18,380,300,.014]],
 static:[['square',0,.025,970,160,.025],['square',.065,.04,540,90,.024]],
 stone:[['sawtooth',0,.36,108,41,.055],['triangle',.07,.42,144,58,.08]],
 passage:[['sine',0,.62,160,640,.09],['triangle',.13,.54,240,800,.035]],
 seal:[['triangle',0,.22,135,44,.12]],
 slash:[['sawtooth',0,.11,960,120,.048]],
 hurt:[['square',0,.12,194,62,.055]],
 crack:[['square',0,.033,1900,430,.05],['triangle',.018,.22,1080,350,.08]],
 reform:[['sine',0,.4,245,440,.09],['sine',.12,.48,330,660,.07]],
 shatter:[['square',0,.05,1800,310,.05],['triangle',.055,.2,930,260,.09],['triangle',.12,.3,740,120,.06],['sine',.17,.5,144,48,.09]]
};
let audio,bus;
function enableAudio(){if(!sound)return;try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();bus=audio.createGain();bus.connect(audio.destination);loadGameSamples()}if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}}
for(const event of ['pointerdown','keydown','click'])document.addEventListener(event,enableAudio,true);
function playNotes(notes,pitch=1){if(!sound||!bus||audio.state!=='running')return;const now=audio.currentTime;
 for(const [type,delay,length,hz,end,level] of notes){const o=audio.createOscillator(),v=audio.createGain(),at=now+delay;
 o.type=type;o.frequency.setValueAtTime(hz*pitch,at);o.frequency.exponentialRampToValueAtTime(end*pitch,at+length);
 v.gain.setValueAtTime(.0001,at);v.gain.exponentialRampToValueAtTime(level,at+.006);v.gain.exponentialRampToValueAtTime(.0001,at+length);
 o.connect(v);v.connect(bus);o.onended=()=>{o.disconnect();v.disconnect()};o.start(at);o.stop(at+length+.01)}}
// One reusable noise source; filters and envelopes give each transient its own texture.
const textures={stone:['lowpass',870,180,.43,.12],slash:['bandpass',4300,770,.13,.19],evade:['highpass',2500,820,.14,.065],impact:['lowpass',2800,240,.25,.22],dust:['highpass',1400,4700,.56,.08],shatter:['bandpass',4200,1350,.39,.16]};
let grain;
function sfx(name,pitch){playNotes(cues[name],pitch);if(!sound||!bus||audio.state!=='running'||!textures[name])return;
 if(!grain){grain=audio.createBuffer(1,audio.sampleRate,audio.sampleRate);const data=grain.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1}
 const [type,from,to,duration,amp]=textures[name],now=audio.currentTime,src=audio.createBufferSource(),filter=audio.createBiquadFilter(),v=audio.createGain();
 src.buffer=grain;filter.type=type;filter.frequency.setValueAtTime(from,now);filter.frequency.exponentialRampToValueAtTime(to,now+duration);
 v.gain.setValueAtTime(.0001,now);v.gain.exponentialRampToValueAtTime(amp,now+(name==='dust'?.1:.009));v.gain.exponentialRampToValueAtTime(.0001,now+duration);
 src.connect(filter);filter.connect(v);v.connect(bus);src.onended=()=>{src.disconnect();filter.disconnect();v.disconnect()};src.start(now,Math.random()*.25,duration)}
function beep(f){playNotes([['triangle',0,.14,f,f,.08]])}

// Predecode once after audio unlock. Never replay a late download over the next turn.
const gameSamples={'soul-split':[.19,170],'soul-scatter':[.20,230],murmur:[.105,105],'murmur-open':[.105,109],'murmur-round':[.105,98],seam:[.055,200],'seam-slip':[.055,175],'seam-freeze':[.055,155],'seal-open':[.19,120],'seal-close':[.19,90],rift:[.16,315],fatal:[.33,85],rattle:[.15,190],clear:[.13,784],empty:[.14,145],retry:[.12,485]};
for(const [form,total] of [['white',4],['violet',5]])for(let n=1;n<=total;n++)gameSamples[form+n]=[.15+n*.013,form==='white'?830:440];
const decoded=new Map();
function loadGameSamples(){for(const name of Object.keys(gameSamples)){
 fetch(`assets/sfx/${name}.wav`).then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer()})
 .then(raw=>audio.decodeAudioData(raw)).then(buffer=>decoded.set(name,buffer)).catch(()=>{});
}}
function sampleCue(name,rate=1,level=1){if(!sound||!bus||audio.state!=='running')return;
 const [gain,fallback]=gameSamples[name],buffer=decoded.get(name);if(!buffer){beep(fallback);return}
 const src=audio.createBufferSource(),v=audio.createGain();src.buffer=buffer;v.gain.value=gain*level;src.playbackRate.value=rate;
 if(name==='rattle')src.playbackRate.value=.96+Math.random()*.08;
 src.connect(v);v.connect(bus);src.onended=()=>{src.disconnect();v.disconnect()};src.start();}

// Drive the voice from game time so replaced lines and paused scenes stay quiet.
let speech=null;
function dialogBlips(line,faint){speech={line,faint,i:0,wait:0}}
function tickSpeech(dt){if(!speech)return;const v=speech;if((v.wait-=dt)>0)return;
 const ch=v.line[v.i++];if(!ch){speech=null;return}
 if(/[a-z0-9]/i.test(ch)){
  let pair=ch;if(/[a-z0-9]/i.test(v.line.charAt(v.i)))pair+=v.line[v.i++];
  const cue=/[ou]/i.test(pair)?'murmur-round':/[ae]/i.test(pair)?'murmur-open':'murmur';
  const first=v.i===pair.length||/\s/.test(v.line[v.i-pair.length-1]),end=/[.,!?]/.test(v.line.charAt(v.i))||v.i===v.line.length;
  const pitch=(v.faint?.82:1)*(end?.91:first?1.04:1);sampleCue(cue,pitch,v.faint?.58:first?1:.86);
  v.wait=(v.faint?.108:.072)+(end?.021:0);
 }else v.wait=/[.,!?]/.test(ch)?.14:.036}
