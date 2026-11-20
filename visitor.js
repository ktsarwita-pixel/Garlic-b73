// The same wounded visitor follows the soul from study to arena.
let revealClock=0,wallPull=null,slamCount=0;
function startSeven(first=1){encounter=7;resetBattle();keys.clear();round=first;swings=first-1;sevenWave()}
function sevenBox(){return round<4?{l:94,r:266,u:162,d:217}:{l:122,r:238,u:102,d:218}}
function sevenWave(){startWave(.55);wallPull=null;slamCount=0;const b=sevenBox();x=(b.l+b.r)/2;y=(b.u+b.d)/2;msg(['White: dodge. Blue: stop. Red: move.','Watch the fractured bones change near you.','Keep moving through red. Watch the fractures.','Look up. The ceiling is no longer safe.','The gates are closing faster.','Watch his hands. Get away from the marked wall.'][round-1]);ui()}
// Raster the linked sleeve, wrist and finger joints without antialiasing.
function jointLine(x0,y0,x1,y1,width,color){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)rect(Math.round(x0+(x1-x0)*i/n-width/2),Math.round(y0+(y1-y0)*i/n-width/2),width,width,color)}
function revenantArm(side,w){const a=w?w.age:0,lead=w&&(w.nx===side||!w.nx),reach=lead?1:.48;
 const gather=ease(a/.22)*(1-ease((a-.22)/.24)),snap=ease((a-.22)/.32)*(1-ease((a-.77)/.52)),cast=ease((a-1.44)/.32)*(1-ease((a-2.64)/.42));
 const vx=w?w.nx:0,vy=w?w.ny:0,force=(snap+cast*.72)*reach;
 const sx=180+side*16,sy=78,ex=sx+side*(5+3*gather)+vx*4*force,ey=sy+9-5*gather+vy*4*force;
 const px=180+side*(22-5*gather)+vx*(15*force-4*gather),py=92-13*gather+vy*(15*force-4*gather)-3*cast;
 jointLine(sx,sy,ex,ey,7,'#262631');jointLine(sx,sy,ex,ey,5,'#414657');jointLine(ex,ey,px,py,5,'#30313d');jointLine(ex,ey,px,py,3,'#666473');
 const angle=Math.atan2(1-force+vy*force,side*.16*(1-force)+vx*force),ux=Math.cos(angle),uy=Math.sin(angle),tx=-uy,ty=ux;
 function at(out,across){return [px+ux*out+tx*across,py+uy*out+ty*across]}
 jointLine(...at(0,0),...at(3,0),5,'#a29c9b');jointLine(...at(1,-1),...at(3,-1),3,'#d5cdc1');
 for(let i=-1;i<=1;i++){const spread=2+cast*1.4,base=at(3,i*2),knuckle=at(5-gather,i*spread),tip=at(7+force*2-Math.abs(i)-3*gather,i*spread+side*gather);jointLine(...base,...knuckle,2,'#aca2a0');jointLine(...knuckle,...tip,1,'#efe1d1')}
 jointLine(...at(1,side*2),...at(4,side*(4+cast)),2,'#beb5ae');}
const revenantPaint={...lastPaint,w:'#c3bfba',W:'#ddd8d0',s:'#918b91',b:'#48566c',B:'#778291',d:'#343342',R:'#763443',r:'#452733',e:ink};
function sevenFigure(glow=true){const p=revenantPaint;mask(boot,p,159,98);mask(boot,p,181,98);mask(shorts,p,164,89);mask(lastCoat,p,158,70);mask(lastFace,p,159,49);
 // A split brow, sunken left socket and loose jaw over the old fatal cut.
 for(const [dx,dy] of [[0,0],[1,1],[1,2],[2,3],[2,4],[1,5],[2,6]])rect(174+dx,51+dy,1,1,'#56505a');rect(166,62,8,4,'#181721');rect(168,66,5,1,'#79727b');rect(177,73,9,1,'#39333c');rect(183,74,3,1,'#655357');rect(172,88,2,5,'#46313b');
 const handCue=mode==='dodge'&&round===6?wallPull:null;revenantArm(-1,handCue);revenantArm(1,handCue);if(glow){rect(183,63,6,3,'#512d68');rect(184,63,4,2,'#b675ec');rect(185,63,2,2,'#f8ddff')}}
function drawVisitor(){const a=revealClock,px=180,py=372,focus=ease((a-.42)/2.42),zoom=1+1.85*focus;
 g.save();g.translate(HALL_WIDTH/2,HALL_HEIGHT/2);g.scale(zoom,zoom);g.translate(-180,-Math.min(HALL_HEIGHT-HALL_HEIGHT/(2*zoom),HALL_HEIGHT/2+(py-18-HALL_HEIGHT/2)*focus));chamber();
 // Residual dust climbs the seam; it stops as the eye takes focus.
 const drift=ease((a-.8)/.7)*(1-ease((a-2.65)/.5));g.save();g.globalAlpha=.55*drift;for(let i=0;i<7;i++){const h=(a*7+i*3)%18;rect(px-12+i*4+Math.round(Math.sin(i+h*.4)),py+4-h,1,1,'#aa9eaf')}g.restore();
 const alpha=ease((a-1.05)/.85);g.globalAlpha=alpha;rect(px-10,py+1,21,2,'#47434a');g.translate(px,py);g.scale(.58,.58);g.translate(-180,-110);sevenFigure(a>=2.65);if(a>=2.65){const bloom=1-ease((a-2.65)/.48);g.globalAlpha=.3*bloom;rect(176,63,20,1,'#e6aaff');rect(185,58,1,11,'#c58cf7')}g.restore();}
function blinkDodge(age){const side=round%2?1:-1,away=age>=.18&&age<1.06,dx=away?side*56:0;
 for(const start of [.18,1.06]){const f=(age-start)/.23;if(f<0||f>=1)continue;const departure=start===.18?0:side*56;
  // One frame of the old silhouette unthreads into offset scanlines.
  g.save();g.translate(departure,0);g.globalAlpha=.38*(1-f);g.beginPath();for(let k=0;k<15;k++)g.rect(149,46+k*4,62,Math.max(1,3-Math.floor(f*3)));g.clip();sevenFigure(false);g.restore();
  g.save();g.globalAlpha=(1-f)*.65;for(let k=0;k<9;k++)rect(165+departure+(k*13)%28+side*f*9,53+k*6,8-k%4,1,'#bf8ae0');g.restore()}
 g.save();g.translate(dx,0);sevenFigure();g.restore();}
function sevenBone(px,py,h,vx,vy,horiz,kind){shots.push({x:px,y:py,h,vx,vy,horiz,blue:kind==='blue',red:kind==='red',glitch:kind==='glitch'})}
// Each score entry sets the entrance, safe lane and material of a paired gate.
// Repeated lanes give the player time to obey blue/red before crossing again.
const gateScores=[
 ['L1w','L1b','R3r','R2w','L0w','R0b','L2r'],
 ['R2w','R0g','L0b','L2w','R3g','L1b','R1g'],
 ['L0r','R1g','L3w','L2r','R2g','R0w','L1g'],
 ['L1w','T2g','R2r','T0w','L0b','T3g','R1w','T1b'],
 ['T1w','L2g','T2b','R3r','L1w','T0g','R0b','T2r','L3g']
];
function nextGate(){const score=gateScores[round-1],entry=score[patternStep%score.length],b=sevenBox(),vertical=entry[0]==='T',span=vertical?b.r-b.l:b.d-b.u;
 const gap=[21,20,19,30,25][round-1],cut=6+Math.round((span-gap-12)*Number(entry[1])/3);return {b,vertical,reverse:entry[0]==='R',cut,gap,span,kind:{w:'white',b:'blue',r:'red',g:'glitch'}[entry[2]]}}
function sevenGate(){const {b,vertical,reverse,cut,gap,span,kind}=nextGate(),speed=61+round*6;
 for(const [offset,size] of [[0,cut],[cut+gap,span-cut-gap]]){if(vertical)sevenBone(b.l+offset,b.u,size,0,speed,true,kind);else sevenBone(reverse?b.r-3:b.l,b.u+offset,size,reverse?-speed:speed,0,false,kind)}patternStep++;spawn=[.82,.79,.74,.82,.65][round-1]}
function gateWarning(){if(round>=6||mode!=='dodge'||spawn>.32)return;const {b,vertical,reverse,cut,gap,span,kind}=nextGate(),edge=reverse?b.r-2:b.l,color={white:'#cebea6',blue:'#539ab4',red:'#b6686f',glitch:'#a385b9'}[kind];g.save();g.globalAlpha=.3+.55*ease(1-spawn/.32);
 for(const [start,end] of [[0,cut],[cut+gap,span]])for(let k=start;k<end;k+=4){if(vertical)rect(b.l+k,b.u,2,2,color);else rect(edge,b.u+k,2,2,color)}g.restore()}
function wallSequence(dt,b){if(!wallPull&&slamCount>=3)return false;if(!wallPull){slamCount++;const nearest=[[x-b.l,-1,0],[b.r-x,1,0],[y-b.u,0,-1],[b.d-y,0,1]].sort((a,b)=>a[0]-b[0])[0];wallPull={age:0,nx:nearest[1],ny:nearest[2],sx:x,sy:y,fired:false};shots=[];sampleCue('rattle')}
 const w=wallPull,prev=w.age;w.age+=dt;
 if(prev<.56&&w.age>=.56)sfx('impact',.82);if(prev<1.76&&w.age>=1.76)sfx('crack',.78);
 if(w.age<=.92){const p=Math.min(1,Math.max(0,(w.age-.22)/.34))**2;x=w.sx+((w.nx<0?b.l+5:w.nx>0?b.r-5:w.sx)-w.sx)*p;y=w.sy+((w.ny<0?b.u+5:w.ny>0?b.d-5:w.sy)-w.sy)*p;return true}
 // Root every spike on the marked wall. Only its exposed length changes.
 if(w.age>=1.76&&!w.fired){w.fired=true;for(let off=6;off<112;off+=10)sevenBone(w.nx?0:b.l+off,w.ny?0:b.u+off,4,0,0,!!w.nx,'glitch')}
 if(w.fired){const depth=Math.round(26*ease((w.age-1.76)/.17)*(1-ease((w.age-2.65)/.27)));for(const s of shots){s.h=Math.max(4,depth);if(w.nx)s.x=w.nx<0?b.l:b.r-s.h;else s.y=w.ny<0?b.u:b.d-s.h}if(w.age>=2.92)shots=[]}if(w.age>=3.55)wallPull=null;return false}
function sevenTick(dt){if(mode==='strike'){const before=1.45-flash;flash-=dt;const age=1.45-flash;if(swings<6){if(before<.18&&age>=.18)sfx('phaseOut');if(before<1.06&&age>=1.06)sfx('phaseIn')}else if(before<.52&&age>=.52)sfx('impact');if(flash<=0){if(swings===6){mode='sevenHold';msg('…');ui()}else{round++;sevenWave()}}return}if(mode!=='dodge')return;const b=sevenBox(),ox=x,oy=y;elapsed+=dt;inv-=dt;
 const held=round===6&&wallSequence(dt,b);if(!held){let dx=+ (keys.has('d')||keys.has('arrowright'))- +(keys.has('a')||keys.has('arrowleft')),dy=+(keys.has('s')||keys.has('arrowdown'))- +(keys.has('w')||keys.has('arrowup'));if(drag&&target){dx=target[0]-x;dy=target[1]-y}const q=Math.hypot(dx,dy)||1,step=drag&&target?Math.min(q,dt*95):dt*95;x=Math.max(b.l+5,Math.min(b.r-5,x+step*dx/q));y=Math.max(b.u+5,Math.min(b.d-5,y+step*dy/q))}if(round<6&&(spawn-=dt)<=0)sevenGate();const moving=Math.hypot(x-ox,y-oy)>.001;
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;const width=s.horiz?s.h:3,height=s.horiz?3:s.h,dist=Math.hypot(Math.max(s.x-x,0,x-s.x-width),Math.max(s.y-y,0,y-s.y-height));if(s.glitch&&dist<31){s.glitch=false;s.changed=t;s.blue=Math.random()<.5;s.red=!s.blue}if(!testGod&&inv<=0&&dist<3&&(!s.blue||moving)&&(!s.red||!moving)){hp=Math.max(0,hp-3);inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];wallPull=null;msg('Your soul begins to crack.')}ui();if(!hp)return}}
 shots=shots.filter(s=>s.x+(s.horiz?s.h:3)>=b.l&&s.x<=b.r&&s.y+(s.horiz?3:s.h)>=b.u&&s.y<=b.d);if(round===6?slamCount===3&&!wallPull:elapsed>6+round*.45){shots=[];wallPull=null;mode='ready';msg('An opening. FIGHT.');ui()}}
function sevenStage(b){
 // The study threshold survives the cut as a low-contrast, cracked arch.
 const y=b.u-4;rect(134,y-73,92,73,'#151417');rect(138,y-70,84,70,'#111013');
 for(const side of [-1,1]){const x=180+side*53;rect(x-3,y-76,7,76,'#211f24');rect(x-2,y-74,1,71,'#302c32');for(let k=0;k<4;k++)rect(x-3,y-k*18-2,7,2,'#161518');rect(x-5,y-2,11,2,'#353038')}
 rect(124,y-78,112,3,'#242127');rect(128,y-75,104,1,'#373039');for(let i=0;i<9;i++)rect(180+(i%4===2?1:0),y-72+i*8,1,8,'#282329');
 rect(163,y-1,34,2,'#252128');rect(169,y-1,22,1,'#302b33')}
function sevenDraw(){const b=sevenBox();sevenStage(b);g.save();g.translate(180,b.u-5);g.scale(round>=4?.94:1.12,round>=4?.94:1.12);g.translate(-180,-110);if(mode==='strike'&&swings<6)blinkDodge(1.45-flash);else sevenFigure();if(mode==='strike')slash(1.45-flash,swings<6);g.restore();rect(b.l-2,b.u-2,b.r-b.l+4,b.d-b.u+4,'#cbbfd2');rect(b.l,b.u,b.r-b.l,b.d-b.u,'#111015');for(const xx of [b.l,b.r-5])for(const yy of [b.u,b.d-1])rect(xx,yy,5,1,'#55495d');g.save();g.beginPath();g.rect(b.l,b.u,b.r-b.l,b.d-b.u);g.clip();gateWarning();slamEffects(b);for(const s of shots){g.save();g.translate(s.x,s.y);if(s.horiz)g.transform(0,1,1,0,0,0);boneSprite({...s,x:0,y:0});if(s.changed!==undefined&&t-s.changed<.14){rect(-2,1,7,1,'#eee1f5');rect(-2,s.h-2,7,1,'#eee1f5')}if(s.glitch){rect(-1,2,4,s.h-4,'#50395e');rect(1,2+Math.floor(t*20)%Math.max(1,s.h-5),4,2,'#cb91ec')}g.restore()}
 const w=wallPull;if(w&&w.age>=.56&&!w.fired){const xx=w.nx<0?b.l:w.nx>0?b.r-3:b.l,yy=w.ny<0?b.u:w.ny>0?b.d-3:b.u;rect(xx,yy,w.nx?3:b.r-b.l,w.ny?3:b.d-b.u,Math.floor(t*10)%2?'#c15cbc':'#82426e');g.fillStyle='#ffd4ee';g.font='bold 12px monospace';g.textAlign='center';g.fillText('!',w.nx?xx-w.nx*9:180,w.ny?yy-w.ny*12+3:(b.u+b.d)/2)}if(mode==='dying')brokenSoul();else if(hp&&(inv<=0||Math.floor(t*12)%2)){if(w&&w.age<=.92){soulRows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='r')rect(x+i-3,y+j-3,1,1,j===0||soulRows[j][i-1]!=='r'||soulRows[j][i+1]!=='r'?'#b99acb':'#09060d')}))}else tinySoul(x,y)}g.restore()}

// Effects are timed from the same impact clock as the hand and collision.
function slamEffects(b){const w=wallPull;if(!w)return;const px=w.nx<0?b.l:w.nx>0?b.r-1:w.sx,py=w.ny<0?b.u:w.ny>0?b.d-1:w.sy;
 if(w.age>.22&&w.age<.56){for(let i=1;i<=3;i++){g.save();g.globalAlpha=.28/i;const d=i*3;rect(x-w.nx*d-2,y-w.ny*d-1,4,2,'#a57cbb');g.restore()}}
 const f=(w.age-.56)/.42;if(f<0||f>=1)return;g.save();g.globalAlpha=1-ease(f);for(let i=-3;i<=3;i++){const across=i*(1+f*4),back=(1-Math.abs(i)/5)*f*12;rect(px-w.nx*back-w.ny*across,py-w.ny*back+w.nx*across,2,1,i%2?'#b99bc9':'#87738e')}g.restore()}
