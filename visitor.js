// The same wounded visitor follows the soul from study to arena.
let revealClock=0,wallPull=null,slamCount=0;
function startSeven(first=1){encounter=7;resetBattle();keys.clear();round=first;swings=first-1;sevenWave()}
function sevenBox(){return round<4?{l:94,r:266,u:162,d:217}:{l:122,r:238,u:102,d:218}}
function sevenWave(){startWave(.55);wallPull=null;slamCount=0;const b=sevenBox();x=(b.l+b.r)/2;y=(b.u+b.d)/2;msg(['White: dodge. Blue: stop. Red: move.','Watch the fractured bones change near you.','Keep moving through red. Watch the fractures.','Look up. The ceiling is no longer safe.','The gates are closing faster.','Watch his hands. Get away from the marked wall.'][round-1]);ui()}
// Raster the linked sleeve, wrist and finger joints without antialiasing.
let visitorSheet, visitorInk;
function stampInk(x,y,w,h,color){visitorInk.fillStyle=color;visitorInk.fillRect(Math.round(x)-130,Math.round(y)-32,w,h)}
function stampMask(rows,palette,x,y){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(palette[row[i]])stampInk(x+2*i,y+2*j,2,2,palette[row[i]])})}
function jointLine(x0,y0,x1,y1,width,color){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)stampInk(x0+(x1-x0)*i/n-width/2,y0+(y1-y0)*i/n-width/2,width,width,color)}
// Forward kinematics: animate angles, never endpoints or bone lengths.
function armRig(side,w){const a=w?w.age:0,lead=w&&(!w.nx||w.nx===side),lift=ease(a/.22)*(1-ease((a-.22)/.34)),whip=ease((a-.22)/.34)*(1-ease((a-.78)/.54)),cast=ease((a-1.44)/.32)*(1-ease((a-2.64)/.42));
 const power=(whip+.80*cast)*(lead?1:.32),aim=w&&w.ny?w.ny*1.45:0;
 const upper=1.14-.42*lift+(aim-1.14+.22)*power,fore=1.68-2.85*lift+(aim-1.68-.14)*power;
 const sx=180+side*16,sy=78,ex=sx+side*9*Math.cos(upper),ey=sy+9*Math.sin(upper),px=ex+side*8*Math.cos(fore),py=ey+8*Math.sin(fore);
 return {sx,sy,ex,ey,px,py,angle:side===1?fore:Math.PI-fore,curl:lift+.35*whip,cast};}
function revenantArm(side,w){const {sx,sy,ex,ey,px,py,angle,curl,cast}=armRig(side,w);
 jointLine(sx,sy,ex,ey,7,'#282532');jointLine(sx,sy,ex,ey,4,'#48505d');jointLine(ex,ey,px,py,5,'#23232c');jointLine(ex,ey,px,py,2,'#8d8992');
 const ux=Math.cos(angle),uy=Math.sin(angle),tx=-uy,ty=ux;function at(out,across){return [px+ux*out+tx*across,py+uy*out+ty*across]}
 jointLine(...at(0,0),...at(3,0),4,'#a29c9b');jointLine(...at(.5,-1),...at(3,-1),2,'#d5cdc1');
 for(let i=-1;i<=1;i++){const [bx,by]=at(3,i*1.7),dir=angle+i*(.10+.16*cast)+side*.28*curl,kx=bx+2.5*Math.cos(dir),ky=by+2.5*Math.sin(dir),end=dir+side*(.24+curl*.95),len=i===0?3:2;jointLine(bx,by,kx,ky,2,'#a79e9c');jointLine(kx,ky,kx+len*Math.cos(end),ky+len*Math.sin(end),1,'#e6d9c9')}
 jointLine(...at(1,side*1.7),...at(3,side*4),2,'#beb5ae');}
const revenantPaint={...lastPaint,p:'#73626d',P:'#a99a99',w:'#c3bfba',W:'#ddd8d0',s:'#918b91',b:'#48566c',B:'#778291',d:'#343342',R:'#763443',r:'#452733',e:ink};
// Hand-cut silhouettes rather than a palette swap of the corridor boss.
// The missing cheek drops into the collar; the jaw hangs from one hinge.
const hollowSkull=[
 '      kkkkkkk       ',
 '    kkswwwwWWkk     ',
 '   kswwwWswwWWwkk   ',
 '  kswwwwskwwwwwssk  ',
 ' ksswwwwskwwwwwwssk ',
 ' kswwwsswkswwwwwssk ',
 ' kswwkkksskkwwwssk  ',
 '  kskkkkkwsskkkksk  ',
 '  kskkkkkwkkkkkkwk  ',
 '   kksskkwkkkkkswk  ',
 '    ksskksksswwssk  ',
 '    kskkkwwwwssk    ',
 '     kskkkskkwk     ',
 '     ks   k  sk     ',
 '      ks ssksk      ',
 '       kssssk       ',
 '        kkkk        '];
const burialCoat=[
 '     kkkk  kkkk     ',
 '   kkddds kkddsk    ',
 '  kdddbbkkskddbbkk  ',
 ' kdddbbkzzkkdbbbbdk ',
 ' kddbbkkskzkdbbRrdk ',
 ' kddbkzzkkksbbRrddk ',
 '  kdbkkszzkbRRbbdkk ',
 '  kdbkzzkkbRrbbbdk  ',
 '  kddkskkRrdbbdddk  ',
 ' kdddkzkRrdbbbdddk  ',
 ' kdbbkkrkkdddbdddk  ',
 ' kdbdk   kddkdbddk  ',
 ' kddk     kdk kddk  ',
 ' kdk      kk   kdk  ',
 ' kk             kk  '];
const rearCranium=['      kkkkkkk','    kkswwwWWwkk','   kswwwWWWWwwwk','  kswwwWWwwwwwwsk',' kswwwwwwswwwwwssk',' kswwwwwsswwwwwwsk',' ksswwwwwskwwwwssk','  ksswwwwsswwwssk','   ksswwsswwwssk','    ksswwwwwssk','     ksssssssk','       ksssk'];
const rearCoat=['     kkkkkkkkk','   kkdBBBBBBBdkk','  kdbbbBBbbbbbddk',' kdbdbbbbbbbdbdddk',' kddbbddddddbddbdk','  kdbbkkkkkkdbbdk','  kdbbbbbbbbbbdkk','  kddbbbdbbbbbdk','  kddbbbkbbdbbdk',' kdbdbbbkbbdbdddk',' kdbdbbbrbbdbdddk',' kddkbbRrbbdbdddk',' kdk kbrkbbkdkkdk',' kk  kdk kk k  kk'];
const rearHeel=['  kkkkkk ',' kssssssk',' kppppppk',' kpPPpppk',' kssssssk','  kkkkkk '];
function sevenFigure(glow=true,wake=1,step=0,rear=false){if(!visitorSheet){visitorSheet=document.createElement('canvas');visitorSheet.width=100;visitorSheet.height=84;visitorInk=visitorSheet.getContext('2d')}visitorInk.clearRect(0,0,100,84);const p=revenantPaint;const swing=rear?step:0,bob=Math.round(Math.abs(swing));
 stampMask(rear?rearHeel:boot,p,161,98+Math.round(swing*3));stampMask(rear?rearHeel:boot,p,181,98-Math.round(swing*3));
 visitorInk.save();visitorInk.translate(Math.round(swing),-bob);stampMask(shorts,p,165,90);stampMask(rear?rearCoat:burialCoat,p,160,69);
 const handCue=mode==='dodge'&&round===6?wallPull:null;for(const side of [-1,1]){visitorInk.save();visitorInk.translate(0,Math.round(-side*swing*2));revenantArm(side,handCue);visitorInk.restore()}
 // Integer row shifts lift the chin out of the collar without rotating blurry pixels.
 const droop=Math.round(4*(1-wake)),hx=159,hy=46+droop;
 if(rear){stampMask(rearCranium,p,160,hy+3);stampInk(177,hy+24,3,2,p.s);stampInk(174,hy+11,4,1,'#938a91');stampInk(177,hy+12,1,3,'#837b83');stampInk(178,hy+15,3,1,'#938a91');stampInk(171,77,5,1,'#718092');stampInk(176,79,7,1,'#474f60');stampInk(181,85,1,5,'#262532');stampInk(180,90,2,2,'#793f4b');if(glow){stampInk(193,hy+15,1,3,'#c48aff');stampInk(191,73,3,1,'#9562b7')}}else{
 for(let j=0;j<hollowSkull.length;j++){const cant=Math.round((j/16)*(2+droop/2));stampMask([hollowSkull[j]],p,hx+cant,hy+j*2)}
 // Single-pixel bevels on the broken orbital rim, teeth, seam and rib ends.
 stampInk(174,hy+5,4,1,'#eee1cf');stampInk(177,hy+7,1,3,'#625c64');stampInk(168,hy+19,3,1,'#867e84');stampInk(171,hy+20,2,1,'#ada6a3');stampInk(181,hy+25,2,2,'#cbc1b6');stampInk(184,hy+26,1,2,'#afa29a');stampInk(175,83,4,1,'#b2abac');stampInk(173,86,4,1,'#a79fa3');stampInk(181,85,2,1,'#95505a');
 if(glow){const yy=hy+17;stampInk(182,yy,8,3,'#7935bf');stampInk(184,yy-1,4,5,'#a646f1');stampInk(183,yy,6,2,'#dd77ff');stampInk(185,yy,3,2,'#fff4ff');stampInk(186,yy,1,2,'#fff')}}
 visitorInk.restore();g.save();g.imageSmoothingEnabled=false;g.drawImage(visitorSheet,130,32);g.restore();}
function drawVisitor(){const a=revealClock,pan=ease((a-.4)/2.65),zoom=1+1.63*pan;
 // The mirrored seal spans y=370..391. Wait for full clearance, then
 // walk from behind its far sill; both heels clear the near sill before closing.
 const travel=ease((a-1.17)/2.65),px=180,py=430-72*travel;
 const gateAge=a<1.18?.48+.92*ease((a-.38)/.8):2.54+.66*ease((a-3.83)/.62);
 const stride=Math.sin(travel*8*Math.PI)*Math.min(1,travel*14,(1-travel)*14);
 const cx=180,cy=HALL_HEIGHT/2+(361-HALL_HEIGHT/2)*pan;
 g.save();g.translate(HALL_WIDTH/2,HALL_HEIGHT/2);g.scale(zoom,zoom);g.translate(-cx,-Math.min(HALL_HEIGHT-HALL_HEIGHT/(2*zoom),cy));chamber(gateAge);
 if(a>1.17){g.save();g.beginPath();g.rect(95,68,170,302);g.rect(162,370,36,21);g.clip();rect(px-8,Math.round(py),16,2,'#48434a');g.translate(px,Math.round(py));g.scale(.61,.61);g.translate(-180,-110);sevenFigure(a>=3.43,ease((a-3.04)/.52),stride,true);g.restore()}g.restore();}
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
 if(w.age<=.92){const p=ease((w.age-.22)/.34);x=w.sx+((w.nx<0?b.l+5:w.nx>0?b.r-5:w.sx)-w.sx)*p;y=w.sy+((w.ny<0?b.u+5:w.ny>0?b.d-5:w.sy)-w.sy)*p;return true}
 // Root every spike on the marked wall. Only its exposed length changes.
 if(w.age>=1.76&&!w.fired){w.fired=true;for(let off=6;off<112;off+=10)sevenBone(w.nx?0:b.l+off,w.ny?0:b.u+off,4,0,0,!!w.nx,'glitch')}
 if(w.fired){const depth=Math.round(26*ease((w.age-1.76)/.17)*(1-ease((w.age-2.65)/.27)));for(const s of shots){s.h=Math.max(4,depth);if(w.nx)s.x=w.nx<0?b.l:b.r-s.h;else s.y=w.ny<0?b.u:b.d-s.h}if(w.age>=2.92)shots=[]}if(w.age>=3.55)wallPull=null;return false}
function sevenTick(dt){if(mode==='strike'){const before=1.45-flash;flash-=dt;const age=1.45-flash;if(swings<6){if(before<.18&&age>=.18)sfx('phaseOut');if(before<1.06&&age>=1.06)sfx('phaseIn')}else if(before<.52&&age>=.52)sfx('impact');if(flash<=0){if(swings===6){mode='sevenHold';msg('…');ui()}else{round++;sevenWave()}}return}if(mode!=='dodge')return;const b=sevenBox(),ox=x,oy=y;elapsed+=dt;inv-=dt;
 const held=round===6&&wallSequence(dt,b);if(held&&drag&&target){target=null}if(!held){let dx=+ (keys.has('d')||keys.has('arrowright'))- +(keys.has('a')||keys.has('arrowleft')),dy=+(keys.has('s')||keys.has('arrowdown'))- +(keys.has('w')||keys.has('arrowup'));if(drag&&target){dx=target[0]-x;dy=target[1]-y}const q=Math.hypot(dx,dy)||1,step=drag&&target?Math.min(q,dt*95):dt*95;x=Math.max(b.l+5,Math.min(b.r-5,x+step*dx/q));y=Math.max(b.u+5,Math.min(b.d-5,y+step*dy/q))}if(round<6&&(spawn-=dt)<=0)sevenGate();const moving=Math.hypot(x-ox,y-oy)>.001;
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;const width=s.horiz?s.h:3,height=s.horiz?3:s.h,dist=Math.hypot(Math.max(s.x-x,0,x-s.x-width),Math.max(s.y-y,0,y-s.y-height));if(s.glitch&&dist<31){s.glitch=false;s.changed=t;s.blue=Math.random()<.5;s.red=!s.blue}if(!testGod&&inv<=0&&dist<3&&(!s.blue||moving)&&(!s.red||!moving)){hp=Math.max(0,hp-3);inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];wallPull=null;msg('Your soul begins to crack.')}ui();if(!hp)return}}
 shots=shots.filter(s=>s.x+(s.horiz?s.h:3)>=b.l&&s.x<=b.r&&s.y+(s.horiz?3:s.h)>=b.u&&s.y<=b.d);if(round===6?slamCount===3&&!wallPull:elapsed>6+round*.45){shots=[];wallPull=null;mode='ready';msg('An opening. FIGHT.');ui()}}
function sevenStage(b){
 // The study threshold survives the cut as a low-contrast, cracked arch.
 const y=b.u-4;rect(134,y-73,92,73,'#151417');rect(138,y-70,84,70,'#111013');
 for(const side of [-1,1]){const x=180+side*53;rect(x-3,y-76,7,76,'#211f24');rect(x-2,y-74,1,71,'#302c32');for(let k=0;k<4;k++)rect(x-3,y-k*18-2,7,2,'#161518');rect(x-5,y-2,11,2,'#353038')}
 rect(124,y-78,112,3,'#242127');rect(128,y-75,104,1,'#373039');for(let i=0;i<9;i++)rect(180+(i%4===2?1:0),y-72+i*8,1,8,'#282329');
 rect(163,y-1,34,2,'#252128');rect(169,y-1,22,1,'#302b33')}
function sevenDraw(){const b=sevenBox();sevenStage(b);g.save();g.translate(180,b.u-5);g.translate(-180,-110);if(mode==='strike'&&swings<6)blinkDodge(1.45-flash);else sevenFigure();if(mode==='strike')slash(1.45-flash,swings<6);g.restore();rect(b.l-2,b.u-2,b.r-b.l+4,b.d-b.u+4,'#cbbfd2');rect(b.l,b.u,b.r-b.l,b.d-b.u,'#111015');for(const xx of [b.l,b.r-5])for(const yy of [b.u,b.d-1])rect(xx,yy,5,1,'#55495d');g.save();g.beginPath();g.rect(b.l,b.u,b.r-b.l,b.d-b.u);g.clip();gateWarning();slamEffects(b);for(const s of shots){g.save();g.translate(s.x,s.y);if(s.horiz)g.transform(0,1,1,0,0,0);boneSprite({...s,x:0,y:0});if(s.changed!==undefined&&t-s.changed<.14){rect(-2,1,7,1,'#eee1f5');rect(-2,s.h-2,7,1,'#eee1f5')}if(s.glitch){rect(-1,2,4,s.h-4,'#50395e');rect(1,2+Math.floor(t*20)%Math.max(1,s.h-5),4,2,'#cb91ec')}g.restore()}
 const w=wallPull;if(w&&w.age>=.56&&!w.fired){const xx=w.nx<0?b.l:w.nx>0?b.r-3:b.l,yy=w.ny<0?b.u:w.ny>0?b.d-3:b.u;rect(xx,yy,w.nx?3:b.r-b.l,w.ny?3:b.d-b.u,Math.floor(t*10)%2?'#c15cbc':'#82426e');g.fillStyle='#ffd4ee';g.font='bold 12px monospace';g.textAlign='center';g.fillText('!',w.nx?xx-w.nx*9:180,w.ny?yy-w.ny*12+3:(b.u+b.d)/2)}if(mode==='dying')brokenSoul();else if(hp&&(inv<=0||Math.floor(t*12)%2)){if(w&&w.age<=.92){soulRows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='r')rect(x+i-3,y+j-3,1,1,j===0||soulRows[j][i-1]!=='r'||soulRows[j][i+1]!=='r'?'#b99acb':'#09060d')}))}else tinySoul(x,y)}g.restore()}

// Effects are timed from the same impact clock as the hand and collision.
function slamEffects(b){const w=wallPull;if(!w)return;const px=w.nx<0?b.l:w.nx>0?b.r-1:w.sx,py=w.ny<0?b.u:w.ny>0?b.d-1:w.sy;
 if(w.age>.22&&w.age<.56){for(let i=1;i<=3;i++){g.save();g.globalAlpha=.28/i;const d=i*3;rect(x-w.nx*d-2,y-w.ny*d-1,4,2,'#a57cbb');g.restore()}}
 const f=(w.age-.56)/.42;if(f<0||f>=1)return;g.save();g.globalAlpha=1-ease(f);for(let i=-3;i<=3;i++){const across=i*(1+f*4),back=(1-Math.abs(i)/5)*f*12;rect(px-w.nx*back-w.ny*across,py-w.ny*back+w.nx*across,2,1,i%2?'#b99bc9':'#87738e')}g.restore()}
