// Short one-shot instruments: waveform, onset, duration, starting/ending Hz, gain.
const cues={
 glitchDodgeOut:[['square',0,.022,720,396,.023],['triangle',.027,.035,482,247,.048],['sawtooth',.073,.064,227,56,.035]],
 glitchDodgeIn:[['triangle',0,.044,86,214,.047],['square',.051,.021,311,603,.022],['triangle',.081,.072,541,408,.043]],
 phaseOut:[['sine',0,.12,630,90,.055],['triangle',.026,.07,443,111,.028]],
 phaseIn:[['triangle',0,.11,112,450,.035],['sine',.07,.085,450,340,.027]],
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
const textures={glitchDodgeOut:['bandpass',2450,620,.124,.095],glitchDodgeIn:['bandpass',820,2670,.115,.072],stone:['lowpass',870,180,.43,.12],slash:['bandpass',4300,770,.13,.19],evade:['highpass',2500,820,.14,.065],impact:['lowpass',2800,240,.25,.22],dust:['highpass',1400,4700,.56,.08],shatter:['bandpass',4200,1350,.39,.16]};
let grain;
// Original low-rate instruments: a rising nasal intake and a pitched, raspy beam roar.
// Coarse vocal-tract shapes only. Excitation is generated from scratch, not sampled.
const intakeShapes=[[-0.977,-0.217,0.18,0.126,0.205,0.118,0.07,0.124,0.079,0.098],[-0.949,-0.34,-0.024,0.077,-0.056,0.062,-0.001,0.006,0.037,0.057],[-0.935,-0.088,-0.322,0.238,-0.115,0.116,0.022,0.155,0.022,0.009],[-0.914,0.563,-0.681,0.27,0.189,-0.095,0.08,0.087,-0.057,-0.013],[-0.967,0.678,-0.436,-0.134,0.299,0.187,-0.042,-0.042,0.043,0.05],[-0.911,0.787,-0.557,-0.11,0.312,0.176,-0.036,-0.002,0.114,0.087]];
const blasterSounds=new Map();
function playBlaster(name,length){if(!sound||!bus||audio.state!=='running')return;
 const fire=name==='beamFire',ring=name==='ringCharge',heavy=ring||length>.85,duration=fire?(heavy?2.4:1.9):length,key=[name,length].join(':');let buffer=blasterSounds.get(key);
 if(!buffer){const rate=16000;buffer=audio.createBuffer(1,Math.ceil(rate*duration),rate);const samples=buffer.getChannelData(0);// Broad loudness contours measured in tenths of the reference clips; no sampled audio.
 const contour=fire?(heavy?[1,.92,.79,.50,.33,.17,.125,.083,.042,.042]:[1,.92,.79,.67,.58,.50,.42,.33,.25,.042]):[.85,1,.85,1,.74,.52,.41,.26,.15,.037];
 // A separate resonant voice lets the upper scream rise without pitching up the jaw growl.
 const knots=[0,.08,.27,.48,.70,.86,1],resonance=fire?[1320,1000,690,690,680,860,520]:[92,100,120,950,2980,510,340];
 const memory=new Float64Array(11);let reedPhase=0;
 let formPhase=0,knot=0,phase=0,low=0,last=0,warm=0,seed=19,band=0,base=0;
 for(let i=0;i<samples.length;i++){const t=i/rate,u=t/duration,f0=(heavy?.78:1)*(fire?45+72*Math.min(1,t/.29)*Math.min(1,(1-u)/.24):95+62*u);phase+=f0/rate;phase-=Math.floor(phase);
 // Resonances sweep apart as the jaw opens; the blast has a noisy attack and a low tail.
 const vowel=Math.sin(phase*Math.PI*2*(fire?5-2*u:2.2+2*u))*Math.exp(-3.6*phase),buzz=(.82*Math.sin(phase*2*Math.PI)+.18*Math.sin(phase*4*Math.PI))*(.85+.15*Math.sin(2*Math.PI*t*(fire?34:18+12*u)));
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=(noise-low)*.28;const grit=low-last;last+=.12*grit;
 const pos=Math.max(0,Math.min(9,u*10-.5)),index=Math.floor(pos),shape=contour[index]+(contour[Math.min(index+1,9)]-contour[index])*(pos-index);
 const env=Math.min(1,t/(fire?.009:.011))*(ring?.8:shape)*Math.min(1,(duration-t)/(ring?.72:fire?.10:.055));
 const air=fire?(heavy?1.5:2.1-1.2*u):.2+1.2*u*u;const whistle=Math.sin(2*Math.PI*phase*4);// Sweep filtered breath down through the beam tail, up into the charge whistle.
 const hz=fire?(heavy?1360:640+1450*Math.exp(-4*u)):700+3200*u*u*u;
 const coeff=Math.min(1.2,2*Math.sin(Math.PI*hz/rate));base+=coeff*band;band+=coeff*(noise-base-.85*band);
 if(u>knots[knot+1]&&knot<knots.length-2)knot++;const blend=(u-knots[knot])/(knots[knot+1]-knots[knot]);
 const center=resonance[knot]*(resonance[knot+1]/resonance[knot])**(blend*blend*(3-2*blend));formPhase+=center/rate;formPhase-=Math.floor(formPhase);
 const cry=Math.sin(2*Math.PI*formPhase+.38*Math.sin(2*Math.PI*phase*2))*(.84+.16*Math.cos(t*84));
 // A continuous breath-driven reed replaces the percussive knock. Morph its
 // resonances with a stable all-pole lattice, then hand off to the charge wail.
 let intake=0,mix=0;if(!fire&&u<.50){const v=Math.min(5,Math.max(0,(u-.02)/.08)),n=Math.floor(v),f=v-n;
 const hz=(heavy?.88:1)*(102+26*u+.8*Math.sin(31*t));reedPhase=(reedPhase+hz/rate)%1;
 let w=.47*noise+.19*(Math.exp(-reedPhase*14)-1/14);for(let m=9;m>=0;m--){const k=intakeShapes[n][m]*(1-f)+intakeShapes[Math.min(5,n+1)][m]*f;w=w*Math.sqrt(1-k*k)-k*memory[m];memory[m+1]=k*w+memory[m]}memory[0]=w;intake=Math.tanh(1.65*w);mix=Math.min(1,(.5-u)/.12);mix=mix*mix*(3-2*mix)}
 const sing=fire?(heavy?.96:.025):.34+.68*Math.min(1,u/.4);
 const bite=fire&&!heavy?.69*Math.exp(-t/.072)*Math.sin(2*Math.PI*(124*t+9*(1-Math.exp(-t/.05)))):0;
 const tone=intake*mix+(1-mix)*Math.tanh(bite+.38*buzz+.44*vowel+.32*air*grit+(fire?.64:.15+.33*u)*band+(fire?.06:.13*u)*whistle+sing*cry);warm+=(fire?.48:.31)*(tone-warm);samples[i]=warm*env*(fire?.25:ring?.14:.12)}blasterSounds.set(key,buffer)}
 const src=audio.createBufferSource();src.buffer=buffer;src.connect(bus);src.onended=()=>src.disconnect();src.start()}
function sfx(name,pitch){if(name==='beamCharge'||name==='beamFire'||name==='ringCharge')return playBlaster(name,pitch);playNotes(cues[name],pitch);if(!sound||!bus||audio.state!=='running'||!textures[name])return;
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
