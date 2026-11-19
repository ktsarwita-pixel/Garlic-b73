// Short one-shot instruments: waveform, onset, duration, starting/ending Hz, gain.
const cues={
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
function enableAudio(){if(!sound)return;try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();bus=audio.createGain();bus.connect(audio.destination)}if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}}
for(const event of ['pointerdown','keydown','click'])document.addEventListener(event,enableAudio,true);
function playNotes(notes,pitch=1){if(!sound||!bus||audio.state!=='running')return;const now=audio.currentTime;
 for(const [type,delay,length,hz,end,level] of notes){const o=audio.createOscillator(),v=audio.createGain(),at=now+delay;
 o.type=type;o.frequency.setValueAtTime(hz*pitch,at);o.frequency.exponentialRampToValueAtTime(end*pitch,at+length);
 v.gain.setValueAtTime(.0001,at);v.gain.exponentialRampToValueAtTime(level,at+.006);v.gain.exponentialRampToValueAtTime(.0001,at+length);
 o.connect(v);v.connect(bus);o.onended=()=>{o.disconnect();v.disconnect()};o.start(at);o.stop(at+length+.01)}}
function sfx(name,pitch){playNotes(cues[name],pitch)}
function beep(f){playNotes([['triangle',0,.14,f,f,.08]])}
