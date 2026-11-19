const $=s=>document.querySelector(s),c=$('#scene'),g=c.getContext('2d');let t=0,last=0,round=1,hp=20,boss=100,mode='ready',paused=false,sound=true,elapsed=0,x=180,y=148,shots=[],inv=0,food=3,calm=0,spawn=0,flash=0,drag=false,target=null;const keys=new Set();function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}function poly(pts,col){g.fillStyle=col;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
// Separate the planted feet, coat and skull so weight shifts through the pose.
const EVADE_DURATION=2.85;
function ease(v){v=Math.max(0,Math.min(1,v));return v*v*v*(v*(v*6-15)+10)}
function pulse(a,start,end){return Math.sin(Math.PI*ease((a-start)/(end-start)))}
const ink='#141828',bone='#eee9d8',shade='#b8b8b4',blue='#437baa';
function mask(rows,palette,x,y){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const color=palette[row[i]];if(color)rect(x+i*2,y+j*2,2,2,color)}})}
const skull=[
'      kkkkkkkkkk     ',
'    kkwwwwwwwwwwkk   ',
'   kwwWWWWwwwwwwssk  ',
'  kwwWWWwwwwwwwwsssk ',
'  kwwwwwwwwwwwwwwssk ',
'  kwkkkkwwwwkkkkkssk ',
'  kkkkkkkwwkkkkkkwsk ',
'  kwkkekkwwkkekkkswk ',
'  kkwwwwwkkswwwsswkk ',
'   kwwwwkkkkwwwwwsk  ',
'  kwskwwwwwwwwwkswsk ',
'   kwwkkkkkkkkkwwsk  ',
'    kwwkwkwkwkwwsk   ',
'     kswwwwwwwss k   ',
'      kksssssskk     ',
'        kkkkkk       '];
const coat=[
'      kkkkkkkkkk       ',
'    kkffsskkssffkk     ',
'   kbfwwsfwwfswwfbk    ',
'  kBbbffwsggswffbbBk   ',
' kBBbbbkfswwsfkbbbBBk  ',
' kBbbbbbkfwwfkbbbbBBk  ',
'kBBbbbkbbswwsbbkbbbBBk ',
'kBbbkkbbbswwsbbbkkbbBk ',
'kbbkBBkbbswwsbbkBBkbBk ',
' kbbbbbBbswwsbBbbbbbk  ',
'  kkbbBBbswwsbBBbbkk   ',
'    kbbbbsggsbbbbk     ',
'    kkkkkkkkkkkkkk     '];
const boot=['  kkkkkk  ','  kssssk  ',' kpppppsk ','kPPpppppsk','kssssssssk',' kkkkkkkk '];
const shorts=[' kkkkkkkkkkkkkkk ',' kgggGggkgggGggk ',' kgggGggkgggGggk ',' kgggGggkgggGggk ',' kgggggkkkgggggk ',' kkkkkkk kkkkkkk '];
const paint={k:ink,w:bone,W:'#fff9e8',s:shade,b:blue,B:'#7db2cb',f:'#d5d6cb',g:'#303b50',G:'#687588',p:'#bd8b99',P:'#efd1c7',e:'#f9f7e8'};
function sans(){
 const evade=mode==='strike',a=evade?EVADE_DURATION-flash:0,side=round%2?1:-1;
 const spring=pulse(a,0,.29),out=pulse(a,.22,.69),back=pulse(a,2.04,2.80);
 const offset=side*(65*ease((a-.19)/.52)*(1-ease((a-2.02)/.78))-3*spring);
 const cx=180+offset,lean=side*(3*out-2*back-spring),lift=5*out+3*back;
 const bob=(1-Math.cos(t*2.9))*.65,base=109-lift;
 rect(cx-20,109,40,2,'#485067');rect(cx-14,111,28,1,'#555d74');
 for(const foot of [-1,1]){const step=foot*side;mask(boot,paint,cx+foot*10-10+step*2*out,base-11-(step>0?3*out:2*back))}
 mask(shorts,paint,cx-16,base-20);
 const torso=base-41+bob+2*spring;mask(coat,paint,cx-22+lean,torso);
 const hx=cx-21+lean*1.5,hy=torso-25+bob*.45;
 mask(skull,{...paint,e:t%4.5<.14?ink:paint.e},hx,hy);
 if(mode==='dodge'||(evade&&a>.62&&a<2.15)){rect(hx+26,hy+14,3,2,'#44cdea');rect(hx+27,hy+14,1,1,'#deffff')}
 if(evade&&a>=.78)slash(a-.78);
}
// Draw the cut over time, then let its afterimage dissolve before the counterattack.
function slash(age){
  let u=Math.min(1,age/.72);u=u*u*(3-2*u);
  const fade=Math.min(1,Math.max(0,(1.45-age)/.65));g.save();g.globalAlpha=fade;
  for(let i=0;i<Math.ceil(52*u);i++){
    const f=i/51,xx=154+i,yy=98-40*f-5*Math.sin(f*Math.PI),w=1+Math.round(3*Math.sin(f*Math.PI));
    rect(xx,yy-w,2,w*2+1,'#cf765d');rect(xx,yy-w+1,2,w+1,'#ffdea0');rect(xx,yy,2,1,'#fffcea');
  }
  if(age>.32&&age<1.18){g.globalAlpha=ease((age-.32)/.12)*(1-ease((age-.98)/.2));g.font='7px p, monospace';g.textAlign='center';g.fillStyle='#fff3cd';g.fillText('MISS',180,59-Math.round(ease(age-.32)*4))}
  g.restore();}
// Each scanline has its own fracture point so the two pieces interlock.
let deathAge=0;
const soulRows=[' rr rr ','rrrrrrr','rrrrrrr',' rrrrr ','  rrr  ','   r   '], seam=[3,3,2,3,2,3];
// Cut each half into contiguous pieces. Their pixels start exactly where the
// cracked-heart pose left them; no second emitter or overlapping intact heart.
const fragments=[[1,0,-44,-28],[0,2,-28,-16],[2,3,-18,-10],
 [5,0,41,-29],[6,2,32,-18],[4,2,20,-25],[3,5,12,-12]].map(([i,j,vx,vy],n)=>({i,j,vx,vy,n,pixels:[]}));
soulRows.forEach((row,j)=>[...row].forEach((p,i)=>{
 if(p!=='r')return;const side=i>=seam[j];let nearest=null,d=Infinity;
 for(const f of fragments){if((f.i>=seam[f.j])!==side)continue;const dd=(i-f.i)**2+(j-f.j)**2;if(dd<d){nearest=f;d=dd}}
 nearest.pixels.push([i,j]);
}));
function shatter(age){
 g.save();g.beginPath();g.rect(98,121,164,50);g.clip();
 for(const f of fragments){const sign=Math.sign(f.vx),ox=180+(f.i-3)*2.5+sign*4,oy=145+(f.j-3)*2.5+(sign>0?2:0);
  const floor=166,gravity=54,hit=(-f.vy+Math.sqrt(f.vy*f.vy+2*gravity*(floor-oy)))/gravity;
  function at(q){const b=Math.max(0,q-hit);return [ox+f.vx*q/(1+.24*q),q<hit?oy+f.vy*q+.5*gravity*q*q:Math.min(floor,floor-(f.vy+gravity*hit)*.28*b+.5*gravity*b*b)]}
  const [px,py]=at(age),angle=sign*age*(2+.27*f.n),co=Math.cos(angle),si=Math.sin(angle),alpha=1-ease((age-1.23)/.63);
  // Sparse, stepped afterimages underneath the tumbling red faces.
  for(let k=3;k>0;k--){if(age<k*.042)continue;const [tx,ty]=at(age-k*.042);g.globalAlpha=alpha*(4-k)*.13;rect(tx,ty,2,1,'#ff6383')}
  g.globalAlpha=alpha;
  for(const [i,j] of f.pixels){const dx=(i-f.i)*2.5,dy=(j-f.j)*2.5;rect(px+dx*co-dy*si,py+dx*si+dy*co,3,3,i===seam[j]?'#ffc4ae':sign>0?'#ff626a':'#df475c')}
  // Pinpricks follow the torn edge, then burn out before the heavier chips land.
  for(let k=0;k<2;k++){const q=age-k*.09;if(q<=0||q>.86)continue;g.globalAlpha=1-ease(q/.86);const sx=ox+sign*(22+f.n*3+k*9)*q,sy=oy-(19+k*15)*q+13*q*q;rect(sx,sy,1,1,'#ffe3bd');if(k===0&&q<.2)rect(sx-1,sy,3,1,'#ffac94')}
 }g.restore();
}
function brokenSoul(){
 const a=deathAge, focus=ease(a/.38), split=ease((a-.78)/.46);
 if(a>=1.52){shatter(a-1.52);return}
 const cx=x+(180-x)*focus,cy=y+(145-y)*focus,scale=1+focus*(1.5+.55*pulse(a,.38,.76));
 g.save();
 soulRows.forEach((row,j)=>[...row].forEach((p,i)=>{
  if(p!=='r')return;
  const right=i>=seam[j],dir=right?1:-1;
  const crack=i===seam[j]&&j<=Math.floor((a-.38)*16)&&a<.84;
  rect(cx+(i-3)*scale+dir*(4*split),cy+(j-3)*scale+(right?2:0)*split,Math.ceil(scale),Math.ceil(scale),crack?'#fff1da':right?'#ff626a':'#df475c');
 }));g.restore();

}
function draw(){sky(t);g.clearRect(0,0,360,180);sans();rect(94,118,172,57,'#556766');rect(96,119,168,54,'#e5e8d6');rect(98,121,164,50,'#0c141a');for(let i=100;i<260;i+=8)for(let j=124;j<171;j+=8)rect(i,j,1,1,'#1b2b2d');for(let b of shots){rect(b.x,b.y,3,b.h,'#dedfce');rect(b.x-1,b.y,5,3,'#f4eed8');rect(b.x-1,b.y+b.h-3,5,3,'#f4eed8')}if(mode==='dying')brokenSoul();else if(hp>0&&(inv<=0||Math.floor(t*12)%2)){const heart=[' rr rr ','rrrrrrr','rrrrrrr',' rrrrr ','  rrr  ','   r   '];heart.forEach((r,j)=>[...r].forEach((p,i)=>{if(p==='r')rect(x+i-3,y+j-3,1,1,'#ff626a')}))}if(paused||mode==='end'){rect(101,134,158,22,'#142423');g.fillStyle='#ffe27d';g.font='8px p, monospace';g.textAlign='center';g.fillText(paused?'PAUSED':hp<=0?'SOUL LOST':'ENCOUNTER CLEAR',180,148)}}
let misses=0;
function say(line){msg('Sans: “'+line+'”')}
function msg(m){$('#message').textContent=m}function ui(){document.querySelectorAll('[data-a]').forEach(b=>b.disabled=mode==='dodge'||mode==='strike'||mode==='dying'||paused);for(let [id,v,max] of [['hp',hp,20],['boss',boss,100]]){if(id==='hp')$('#hpnum').textContent=v+' / '+max;$('#'+id+'bar').style.width=v/max*100+'%'}$('#turn').textContent=String(round).padStart(2,'0');$('#phase').textContent=mode==='dying'?'SOUL LOST':mode==='strike'?'STRIKE':mode==='dodge'?'DODGE':mode==='end'?'END':'READY'}let audio;function beep(f){if(!sound)return;try{audio??=new AudioContext();let o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.value=f;o.connect(v);v.connect(audio.destination);v.gain.setValueAtTime(.09,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.start();o.stop(audio.currentTime+.15)}catch{}}
function act(a){if(paused||mode==='dodge'||mode==='strike'||mode==='dying')return;if(mode==='end'){round=1;hp=20;boss=100;food=3;calm=0;deathAge=0;inv=0;mode='ready';x=180;y=148;shots=[];say('back already? kept your spot warm.');ui();return}if(a==='item'&&!food){msg('Your pockets are empty. Choose another action.');return}beep(330);if(a==='fight'){mode='strike';flash=EVADE_DURATION;msg('You swing.');ui();return}if(a==='act'){calm++;say(['heh. a joke? now we’re talking.', 'okay. that one got a real laugh.', 'call it a draw? mercy’s right there.'][Math.min(calm,3)-1])}if(a==='item'){food--;hp=Math.min(20,hp+8);msg(`You eat a pie slice. ${food} left. Stay moving!`)}if(a==='mercy')msg('Not yet. Maybe a few jokes would help.');if(!boss||(a==='mercy'&&calm>=3)){mode='end';msg('The corridor falls quiet. Select an action to replay.')}else{mode='dodge';elapsed=0;spawn=.1;shots=[]}ui()}
function update(dt){if(mode==='dying'){const prev=deathAge;deathAge+=dt;if(prev<.78&&deathAge>=.78)beep(85);if(prev<1.52&&deathAge>=1.52){beep(196);say('hey. take a breath, kid.')}if(deathAge>=3.43){mode='end';msg('Your soul shattered. Select an action to retry.');ui()}return}if(mode==='strike'){
 const prev=flash;flash=Math.max(0,flash-dt);
 if(prev>EVADE_DURATION-1.1&&flash<=EVADE_DURATION-1.1){beep(420);say(['nice swing. wrong address.', 'pretty sure the air learned its lesson.', 'i was standing there. past tense.'][misses++%3]);ui()}
 if(!flash){if(!boss){mode='end';msg('The corridor falls quiet. Select an action to replay.')}else{mode='dodge';elapsed=0;spawn=.55;shots=[];msg('Dodge the bones! Try ACT to win him over.')}ui()}return;
}inv-=dt;if(mode!=='dodge')return;elapsed+=dt;spawn-=dt;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));if(drag&&target){let vx=target[0]-x,vy=target[1]-y,l=Math.max(1,Math.hypot(vx,vy)/(90*dt));x+=vx/l;y+=vy/l}else{x+=dx*65*dt;y+=dy*65*dt}x=Math.max(102,Math.min(257,x));y=Math.max(125,Math.min(167,y));if(spawn<=0){spawn=.78;let h=13+Math.random()*14;let right=round%2;shots.push({x:right?257:99,y:Math.random()<.5?121:171-h,h,v:right?-52:52})}for(let b of shots){b.x+=b.v*dt;if(inv<=0&&x+2>b.x&&x-2<b.x+3&&y+2>b.y&&y-2<b.y+b.h){hp=Math.max(0,hp-3);inv=.85;beep(110);if(!hp){mode='dying';deathAge=0;shots=[];msg('Your soul begins to crack.');ui();return}ui()}}shots=shots.filter(b=>b.x>=99&&b.x<=258);if(elapsed>5.4&&mode==='dodge'){mode='ready';round++;shots=[];msg('Your move. Choose an action.');ui()}}
function frame(now){let dt=Math.min(.04,(now-last)/1000);last=now;if(!paused){t+=dt;update(dt)}draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{document.querySelector('.sel')?.classList.remove('sel');b.classList.add('sel');act(b.dataset.a)});$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').ariaLabel=paused?'Resume game':'Pause game';ui()};$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'♫':'♪';$('#sound').style.opacity=sound?1:.55;beep(440)};onkeydown=e=>{let k=e.key.toLowerCase();if(k.startsWith('arrow')||k===' ')e.preventDefault();keys.add(k);if(!e.repeat){if(k===' ')act('fight');if(k==='escape')$('#pause').click()}};onkeyup=e=>keys.delete(e.key.toLowerCase());onblur=()=>{keys.clear();drag=false;if(mode==='dodge'&&!paused)$('#pause').click()};function point(e){let r=c.getBoundingClientRect();target=[(e.clientX-r.left)*360/r.width,(e.clientY-r.top)*180/r.height]}c.onpointerdown=e=>{drag=true;c.setPointerCapture(e.pointerId);point(e)};c.onpointermove=e=>{if(drag)point(e)};c.onpointerup=c.onpointercancel=()=>drag=false;

document.querySelector("[data-a=fight]").classList.add("sel");const full=$("#full");if(!document.fullscreenEnabled)full.hidden=true;full.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
