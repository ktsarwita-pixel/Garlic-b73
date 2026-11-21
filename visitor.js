// The same wounded visitor follows the soul from study to arena.
let revealClock=0,wallPull=null,slamCount=0,roomShift=null;
const SHIFT_TIME=1.05;
function startSeven(first=1){encounter=7;resetBattle();keys.clear();round=first;swings=first-1;sevenWave()}
function sevenBox(){const p=round<4?0:roomShift?ease(roomShift.age/SHIFT_TIME):1;return {l:94+28*p,r:266-28*p,u:162-60*p,d:217+p}}
function sevenWave(morph=false){roomShift=morph?{age:0,sx:x,sy:y}:null;startWave(.55);wallPull=null;slamCount=0;const b=sevenBox();if(!roomShift){x=(b.l+b.r)/2;y=(b.u+b.d)/2;}msg(['White: dodge. Blue: stop. Red: move.','Watch the fractured bones change near you.','Keep moving through red. Watch the fractures.','Look up. The ceiling is no longer safe.','The gates are closing faster.','Corrupt Boke: leave the marked wall. A hit costs 10 HP.'][round-1]);ui()}
// Raster the linked sleeve, wrist and finger joints without antialiasing.
let visitorSheet, visitorInk;
function stampInk(x,y,w,h,color){visitorInk.fillStyle=color;visitorInk.fillRect(Math.round(x)-130,Math.round(y)-32,w,h)}
function stampMask(rows,palette,x,y){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(palette[row[i]])stampInk(x+2*i,y+2*j,2,2,palette[row[i]])})}
function jointLine(x0,y0,x1,y1,width,color){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)stampInk(x0+(x1-x0)*i/n-width/2,y0+(y1-y0)*i/n-width/2,width,width,color)}
// Forward kinematics: animate angles, never endpoints or bone lengths.
function armRig(side,w){const a=w?w.age:0,lead=w&&(!w.nx||w.nx===side),lift=ease(a/.22)*(1-ease((a-.22)/.34)),whip=ease((a-.22)/.34)*(1-ease((a-.78)/.54)),cast=ease((a-1.44)/.32)*(1-ease((a-2.64)/.42));
 const power=(whip+.80*cast)*(lead?1:.32),aim=w&&w.ny?w.ny*1.45:0;
 // The elbow leads; the wrist trails on the throw and checks back on impact.
 const lag=ease((a-.27)/.29)*(1-ease((a-.82)/.48)),check=ease((a-.56)/.08)*(1-ease((a-.64)/.18));
 const upper=1.14-.58*lift+(aim-1.14+.22)*power+.16*check,fore=1.68-2.85*lift+(aim-1.68-.14)*(lag+.72*cast)*(lead?1:.32)-.28*check;
 const sx=180+side*16,sy=78,ex=sx+side*9*Math.cos(upper),ey=sy+9*Math.sin(upper),px=ex+side*8*Math.cos(fore),py=ey+8*Math.sin(fore);
 return {sx,sy,ex,ey,px,py,angle:side===1?fore:Math.PI-fore,curl:lift+.35*whip,cast};}
function revenantArm(side,w){const {sx,sy,ex,ey,px,py,angle,curl,cast}=armRig(side,w);
 jointLine(sx,sy,ex,ey,7,'#282532');jointLine(sx,sy,ex,ey,4,'#48505d');jointLine(ex,ey,px,py,5,'#23232c');jointLine(ex,ey,px,py,2,'#8d8992');
 stampInk(ex-1,ey-1,3,2,'#606475');stampInk(px-1,py-1,2,2,'#bcb3b0');
 const ux=Math.cos(angle),uy=Math.sin(angle),tx=-uy,ty=ux;function at(out,across){return [px+ux*out+tx*across,py+uy*out+ty*across]}
 jointLine(...at(0,0),...at(3,0),4,'#a29c9b');jointLine(...at(.5,-1),...at(3,-1),2,'#d5cdc1');
 for(let i=-1;i<=1;i++){const [bx,by]=at(3,i*1.7),dir=angle+i*(.10+.16*cast)+side*.28*curl,kx=bx+2.5*Math.cos(dir),ky=by+2.5*Math.sin(dir),end=dir+side*(.24+curl*.95),len=i===0?3:2;jointLine(bx,by,kx,ky,2,'#a79e9c');jointLine(kx,ky,kx+len*Math.cos(end),ky+len*Math.sin(end),1,'#e6d9c9')}
 jointLine(...at(1,side*1.7),...at(3,side*4),2,'#beb5ae');}
const revenantPaint={...lastPaint,p:'#73626d',P:'#a99a99',w:'#c3bfba',W:'#ddd8d0',s:'#918b91',b:'#48566c',B:'#778291',d:'#343342',R:'#763443',r:'#452733',e:ink};
// Hand-cut silhouettes rather than a palette swap of the corridor boss.
// Low brows over hollow sockets; a closed jaw sits deep in the collar.
const hollowSkull=[
 '      kkkkkkk',
 '    kkswwWWWwkk',
 '   kswwwWWWWwwwkk',
 '  kswwwwwswwwwwwsk',
 ' kswwwwwskwwwwwwssk',
 ' kswWWWwwswwWWWwssk',
 ' kswwsswwwssswwssk',
 ' kswkkkkwwsskkkkwk',
 ' kswkkkkkswkkkkkwk',
 '  ksskkkswwkkkkssk',
 '   kwwwsskksswwwsk',
 '   kswwwskkswwwsk',
 '    ksswwwwwsssk',
 '    kskkkkkkkksk',
 '    ksswwssssssk',
 '     ksswwwwssk',
 '      kkkkkkkk' ];
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
const rearCoat=['     kkkkkkkkk','   kkdBBBBBBBdkk','  kdbbbBBbbbbbddk',' kdbdbbbbbbbdbdddk',' kddbbddddddbddbdk','  kdbbkkkkkkdbbdk','  kdbbbbbbbbbbdkk','  kddbbbdbbbbbdk','  kddbbbkbbdbbdk',' kdbdbbbkbbdbdddk',' kdbdbbbdbbdbdddk',' kddkbbdkbbdbdddk',' kdk kbdkbbkdkkdk',' kk  kdk kk k  kk'];
const rearHeel=['  kkkkkk ',' kssssssk',' kppppppk',' kpPPpppk',' kssssssk','  kkkkkk '];
// Choreograph floor contacts, then derive the hips from the feet. The first
// step starts with both heels together; the last brings the trailing heel in.
const passingHeel=['  kkkkkk ',' kssssssk',' kppppppk',' kpPPpppk','  ksssssk'];
function entryGait(progress){const beat=Math.min(11,Math.floor(progress*12)),f=progress*12-beat,left=beat%2===0;
 const plant=beat*6,from=Math.max(0,plant-6),to=Math.min(66,plant+6),arc=Math.sin(Math.PI*f),s=f*f*(3-2*f),swing=from+(to-from)*s,hips=(plant+swing)/2;
 const pose=(z,moving)=>({dy:Math.round((hips-z)/.61-(moving?arc*1.6:0)),lift:moving&&arc>.64});return {hips,left:pose(left?swing:plant,left),right:pose(left?plant:swing,!left),weight:(left?1:-1)*arc,arm:(swing-plant)/6*(left?1:-1)};}
// Body motion follows actions, not a looping breath: the dead figure goes
// completely still between gestures. Feet remain outside these transforms.
function visitorPose(){const w=mode==='dodge'?wallPull:null,age=mode==='strike'?1.45-flash:-2;
 const coil=w?pulse(w.age,0,.38):0,drive=w?pulse(w.age,.22,.86):0;
 const teleport=mode==='strike'&&swings<(encounter===8?5:6),side=round%2?1:-1;
 const settle=teleport?(pulse(age,.18,.48)-pulse(age,1.06,1.38))*side:0;

 return {lean:Math.round((w?w.nx*drive*2:0)-2*settle),drop:Math.round(2*coil+Math.abs(settle)),chin:Math.round(coil-drive),hem:Math.round(settle*2+(w?w.nx*drive:0))};}
function coatFinish(rear,hem){
 // Crisp broken seam, reflected sleeve edges and the underside of the hood.
 if(rear){jointLine(168,76,174,79,2,'#535f72');jointLine(174,79,183,80,2,'#363747');jointLine(183,80,190,76,2,'#677084');stampInk(180,82,1,6,'#515667');jointLine(179,89,176,94,1,'#424b58')}
 else{jointLine(166,77,171,81,2,'#637084');jointLine(172,80,169,87,1,'#87909a');jointLine(189,75,184,80,2,'#545c70');jointLine(184,80,179,89,1,'#a06165');stampInk(172,86,4,1,'#c2bcb2');stampInk(171,89,3,1,'#8c8990');jointLine(164,85,167,88,1,'#788391');jointLine(190,81,193,80,1,'#929ba2');stampInk(189,87,3,1,'#62667b');stampInk(188,88,2,1,'#30303e')}
 jointLine(166,90,165+hem,96,2,'#343342');jointLine(189,91,190+hem,95,2,'#3d4051');}
function sevenFigure(glow=true,wake=1,step=0,rear=false){if(!visitorSheet){visitorSheet=document.createElement('canvas');visitorSheet.width=100;visitorSheet.height=88;visitorInk=visitorSheet.getContext('2d')}visitorInk.clearRect(0,0,100,88);const p=revenantPaint,gait=rear?entryGait(step):null,swing=gait?gait.arm:0;
 if(rear){
  // Animate the two halves of Sans's own shorts. Waist fixed under the jacket;
  // each slipper overlaps the cuff so no bare leg shows in any pose.
  for(const side of [-1,1]){const foot=side<0?gait.left:gait.right,depth=Math.round(foot.dy*.5),hip=side<0?165:181,cuff=99+depth;
   for(let yy=90;yy<cuff;yy++){const row=shorts[Math.min(5,Math.floor((yy-90)*6/(cuff-90)))].slice(side<0?0:8,side<0?8:16);for(let i=0;i<row.length;i++)if(p[row[i]])stampInk(hip+2*i,yy,2,1,p[row[i]])}
   stampMask(foot.lift?passingHeel:rearHeel,p,hip-2,cuff-1);
  }
 }else{stampMask(boot,p,161,98);stampMask(boot,p,181,98);stampMask(shorts,p,165,90)}
 visitorInk.save();const pose=rear?{lean:Math.round(gait.weight),drop:0,chin:0,hem:Math.round(gait.arm)}:visitorPose();visitorInk.translate(pose.lean,pose.drop);stampMask(rear?rearCoat:burialCoat,p,160,69);coatFinish(rear,pose.hem);
 const handCue=mode==='dodge'&&round===6?wallPull:null;for(const side of [-1,1]){visitorInk.save();visitorInk.translate(0,Math.round(-side*swing*2));revenantArm(side,handCue);visitorInk.restore()}
 // Integer row shifts lift the chin out of the collar without rotating blurry pixels.
 const droop=Math.round(4*(1-wake)),hx=159,hy=(rear?46:43)+droop+pose.chin;
 if(rear){stampMask(rearCranium,p,160,hy+3);stampInk(177,hy+24,3,2,p.s);stampInk(174,hy+11,4,1,'#938a91');stampInk(177,hy+12,1,3,'#837b83');stampInk(178,hy+15,3,1,'#938a91');stampInk(171,77,5,1,'#718092');stampInk(176,79,7,1,'#474f60');stampInk(181,85,1,5,'#262532');stampInk(180,90,2,2,'#3e4553');jointLine(167,74,173,77,1,'#637080');jointLine(184,77,190,74,1,'#576475');stampInk(174,78,10,1,'#404955')}else{
 // Seat the mandible on a short neck tucked between the stationary lapels.
 const nape=hy+31;stampInk(174,nape,12,86-nape,'#454550');
 stampInk(176,nape,8,85-nape,'#a09b99');stampInk(177,nape+2,5,3,'#d0c8be');
 stampInk(176,nape+5,8,1,'#69666c');stampInk(178,nape+6,5,3,'#c4bcb4');
 jointLine(171,81,177,87,3,p.b);jointLine(188,81,182,87,3,p.d);
 for(let j=0;j<hollowSkull.length;j++){const cant=Math.round((j/16)*(2+droop/2));stampMask([hollowSkull[j]],p,hx+cant,hy+j*2)}
 // Heavy orbital shelves angle toward the bridge; leave the gaze visible beneath.
 jointLine(165,hy+12,170,hy+13,2,'#938d8c');jointLine(170,hy+13,176,hy+16,2,'#605c63');
 jointLine(182,hy+15,188,hy+12,2,'#716c71');jointLine(188,hy+12,192,hy+12,1,'#a29b97');
 jointLine(167,hy+19,170,hy+21,1,'#706b70');jointLine(190,hy+20,187,hy+22,1,'#878084');
 // Single-pixel bevels on the broken orbital rim, seam and rib ends.
 stampInk(174,hy+5,4,1,'#eee1cf');stampInk(177,hy+7,1,3,'#625c64');stampInk(168,hy+19,3,1,'#867e84');stampInk(171,hy+20,2,1,'#ada6a3');stampInk(175,83,4,1,'#b2abac');stampInk(173,86,4,1,'#a79fa3');stampInk(181,85,2,1,'#95505a');
 if(glow){const age=encounter===8?endingAge+.93:mode==='sevenHold'?endingAge+.93:mode==='strike'&&swings===6?.93-flash:-1;
 if(age>=-.28)visitorWound(age+.52);
 visitorInk.save();visitorInk.globalAlpha=1-ease((age-6.5)/1.9);visitorGaze(hy+17);visitorInk.restore();
 if(age>9.1)whiteCross(hy,age-9.1)}}
 visitorInk.restore();g.save();g.imageSmoothingEnabled=false;g.drawImage(visitorSheet,130,32);g.restore();}
// Illuminate the same ten connected pixels every frame, never swap eye silhouettes.
function whiteCross(hy,seconds){crossEye(visitorInk,186-130,hy+16-32,seconds,ease(seconds/1.15))}
function crossEye(ctx,x,y,seconds,reveal){const pulse=(1-Math.cos(seconds*1.8))/2;
 ctx.save();const alpha=ctx.globalAlpha*reveal;function mark(dx,dy,w,h,color){ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h)}
 ctx.globalAlpha=alpha*(.09+.09*pulse);mark(-1,-2,3,6,'#a2c3dc');mark(-2,-1,5,1,'#a2c3dc');mark(-2,1,5,1,'#a2c3dc');
 ctx.globalAlpha=alpha;mark(0,-2,1,6,'#bfcfd8');mark(-2,0,5,1,'#d3e0e7');mark(0,-1,1,4,'#f1f6f8');mark(-1,0,3,1,'#f1f6f8');
 ctx.globalAlpha=alpha*(.45+.55*pulse);mark(0,0,1,1,'#ffffff');ctx.restore()}
// The final sweep is the original blade arc, lowered ten pixels onto the coat.
function cutHeight(x){const f=(x-154)/51;return 108-40*f-5*Math.sin(Math.PI*f)}
// Precompute shades so aging never allocates colors in the pixel loop.
const agingBlood=Array.from({length:64},(_,i)=>[
 [0x49213f,0x2c192a],[0x843762,0x47253f],[0x32132f,0x211121],[0xb56a9d,0x573349],
 [0x49243f,0x301b2c],[0x793459,0x402237],[0x67294e,0x391d32]
].map(([wet,dry])=>'#'+[16,8,0].map(k=>Math.round(((wet>>k)&255)*(1-i/63)+((dry>>k)&255)*i/63).toString(16).padStart(2,'0')).join('')));
function visitorWound(clock){
 const rim=agingBlood[Math.round(63*ease((clock-.7)/9))],pool=agingBlood[Math.round(63*ease((clock-2)/18))];
 const u=Math.min(1,clock/.72),tip=154+Math.ceil(52*u*u*(3-2*u))-1;
 for(let x=168;x<=Math.min(191,tip);x++){
  const y=cutHeight(x),belly=Math.sin(Math.PI*(x-168)/23),width=Math.round(3*belly);
  stampInk(x,y-width,1,2*width+2,rim[0]);stampInk(x,y-width+1,1,width+1,pool[1]);
  stampInk(x,y,1,1+Math.round(belly),pool[2]);if(x%8<4)stampInk(x,y-1,1,1,rim[3]);
 }
 // Blood catches in folds first; uneven rivulets pool at their tips before a bead falls.
 for(const [x,len,delay,bend] of [[170,5,.4,1],[176,11,.53,-1],[182,8,.63,1],[188,5,.72,-1]]){
  if(x>tip||clock<=delay)continue;
  const duration=len*.21,flow=ease((clock-delay)/duration),travel=len*flow,h=Math.floor(travel),root=Math.round(cutHeight(x))+1;
  // Wet the cut first: only a single darkening pixel advances beyond the last full row.
  // Never stamp the finished bead or a rectangular collar at the origin.
  const path=j=>x+Math.round(bend*ease(j/len));let end=x;
  for(let j=0;j<=h;j++){const cx=path(j);stampInk(Math.min(end,cx),root+j,1+Math.abs(end-cx),1,pool[5]);end=cx}
  visitorInk.save();visitorInk.globalAlpha=travel-h;stampInk(end,root+h+1,1,1,pool[5]);visitorInk.restore();
  const age=clock-delay-duration;if(age<=0)continue;
  const swell=ease(age/.38),stretch=Math.round(3*swell),neck=root+h;
  if(age<=.38)stampInk(end,neck,1,stretch+1,pool[5]);
  const yy=neck+stretch+Math.round(80*Math.max(0,age-.38)**2);
  if(yy<106){visitorInk.save();visitorInk.globalAlpha=swell;stampInk(end,yy+1,1,1,pool[6]);visitorInk.globalAlpha=swell*swell;stampInk(end-1,yy+1,1,1,pool[6]);stampInk(end,yy+2,1,1,pool[6]);visitorInk.restore()}
  else stampInk(end-1,107,3,1,rim[4]);
 }
 for(let i=0;i<12;i++){const x=170+i*1.7,a=clock-(.27+i*.019);if(x>tip||a<=0||a>.85)continue;
 const vx=17+i*2.2,vy=-36+(i*11)%31,px=x+vx*a,py=cutHeight(x)+vy*a+70*a*a;
 visitorInk.save();visitorInk.globalAlpha=ease(a/.10)*(1-ease((a-.58)/.27));jointLine(px-vx*.035,py-(vy+140*a)*.035,px,py,i%3?1:2,i%3?'#a55081':'#68294f');visitorInk.restore()}
}
// A low inner brow leaves a hooked aperture. The face stays still: only the
// iris follows the soul, contracting into a needle as the wall pull begins.
function visitorGaze(y0){const track=x<166?-1:x>194?1:0,iris=186+track,box=sevenBox(),low=y>(box.u+box.d)/2?1:0;
 const lock=mode==='dodge'&&wallPull&&wallPull.age<1.76;
 stampInk(181,y0-2,9,5,'#211528');stampInk(182,y0+2,6,2,'#36203f');
 stampInk(181,y0-2,3,2,'#716674');stampInk(183,y0-1,3,1,'#504452');
 stampInk(188,y0-2,3,2,'#794396');stampInk(185,y0,5,2,'#ac49de');stampInk(182,y0+1,4,2,'#863db5');
 // A stepped lower lid frames the pupil; its light catches bone, not the empty socket.
 stampInk(182,y0+3,3,1,'#5b376f');stampInk(186,y0+3,4,1,'#b379c6');
 stampInk(iris-1,y0+low,3,2,lock?'#f3a0ff':'#d96bff');stampInk(iris,y0+low-1,1,lock?4:3,'#fff6ff');
 if(lock){const spread=ease(wallPull.age/.22)*(1-ease((wallPull.age-1.36)/.4));stampInk(189,y0-1,1+Math.round(3*spread),1,'#ac63ce');stampInk(190,y0+5,1,1+Math.round(2*spread),'#83599b')}
 stampInk(189,y0+3,2,1,'#935eac');stampInk(190,y0+4,1,2,'#674576');
 if(lock){stampInk(191,y0-2,2,1,'#b77bc7');stampInk(193,y0-3,1,1,'#795388')}
}
function drawVisitor(){const a=revealClock,pan=ease((a-.4)/2.65),zoom=1+1.63*pan;
 // The mirrored seal spans y=370..391. Wait for full clearance, then
 // walk from behind its far sill; both heels clear the near sill before closing.
 const stride=Math.max(0,Math.min(1,(a-1.17)/2.65)),px=180,py=425-entryGait(stride).hips;
 const gateAge=a<1.18?.48+.92*ease((a-.38)/.8):2.54+.66*ease((a-3.83)/.62);
 const cx=180,cy=HALL_HEIGHT/2+(361-HALL_HEIGHT/2)*pan;
 g.save();g.translate(HALL_WIDTH/2,HALL_HEIGHT/2);g.scale(zoom,zoom);g.translate(-cx,-Math.min(HALL_HEIGHT-HALL_HEIGHT/(2*zoom),cy));chamber(gateAge);
 if(a>1.17){g.save();g.beginPath();g.rect(95,68,170,302);g.rect(162,370,36,21);g.clip();rect(px-8,Math.round(py),16,2,'#48434a');g.translate(px,Math.round(py));g.scale(.61,.61);g.translate(-180,-110);sevenFigure(a>=3.43,ease((a-3.04)/.52),stride,true);g.restore()}g.restore();}
function blinkDodge(age){const side=round%2?1:-1,away=age>=.18&&age<1.06,dx=away?side*56:0;
 for(const start of [.18,1.06]){const f=(age-start)/.23;if(f<0||f>=1)continue;const departure=start===.18?0:side*56;
  // One frame of the old silhouette unthreads into offset scanlines.
  g.save();g.translate(departure,0);g.globalAlpha=.38*(1-f);g.beginPath();for(let k=0;k<15;k++)g.rect(149,46+k*4,62,Math.max(1,3-Math.floor(f*3)));g.clip();sevenFigure(false);g.restore();
  g.save();g.globalAlpha=(1-f)*.65;for(let k=0;k<9;k++)rect(165+departure+(k*13)%28+side*f*9,53+k*6,8-k%4,1,'#bf8ae0');g.restore()}
 g.save();g.translate(dx,0);sevenFigure();g.restore();}
function sevenBone(px,py,h,vx,vy,horiz,kind){shots.push({x:px,y:py,h,vx,vy,horiz,blue:kind==='blue',red:kind==='red',glitch:kind==='glitch',kind,damage:kind==='corrupt boke'?10:3,phase:(patternStep*7+Math.round(px+py))%19})}
// Each score entry sets the entrance, safe lane and material of a paired gate.
// Repeated lanes give the player time to obey blue/red before crossing again.
const gateScores=[
 ['L1w','L1b','R3r','R2w','L0w','R0b','L2r'],
 ['R2w','R0g','L0b','L2w','R3g','L1b','R1g'],
 ['L0r','R1g','L3w','L2r','R2g','R0w','L1g'],
 ['L1w','T2g','R2r','T0w','L0b','T3g','R1w','T1b'],
 ['T1w','L2g','T2b','R3r','L1w','T0g','R0b','T2r','L3g']
];
// Beam counts, cadence and bone choreography are independent: faster bones never add cannons.
const eightScore=[
 {count:5,beat:1.45,gates:['L1w','L2w','R2w','R0w'],gap:25,pace:.93},
 {count:3,beat:2.35,gates:['R1w','R2g','L2b','L0r','R1g','L3w','R2r'],gap:19,pace:.53},
 {count:2,beat:3,gates:['L1b','R1r','L3r','R2b','L0r'],gap:18,pace:.55},
 {count:10,beat:1.24,gates:['T1w','L1w','R2w','T2w','L2w'],gap:48,pace:.97},
 {count:22,beat:.67,gates:[]}
];
let cannons=[],sent=0,nextBeam=0;
function startEight(retry=false){encounter=8;if(retry)resetBattle();endingAge=Math.max(12,endingAge);round=1;swings=0;boss=100;wallPull=null;keys.clear();eightWave()}
function eightWave(){startWave(.7);roomShift=round===4?{age:0,sx:x,sy:y}:null;const b=sevenBox();if(!roomShift){x=180;y=(b.u+b.d)/2}cannons=[];sent=0;nextBeam=.65;msg(['Watch the skulls. Step out of their sights.','Fractured bones. Blue: stop. Red: move.','Heavy blasters. Watch the wide lanes.','Stay near the middle. Sidestep the dotted sights.','Blasters only. Keep moving.'][round-1]);ui()}
const THROAT_X=12;
function blastRadius(width,d){return Math.min(Math.floor(width/2),1+Math.floor(Math.max(0,d)/2))}
function blasterPose(c){const a=c.age-c.charge,fade=1-ease((a-.27)/.2),scale=c.big?1.25:1;
 const offset=-Math.round(7*(1-ease(c.age/.18))+5*(1-fade)+(a<0?0:3*(1-ease(a/.19))));
 const shift=offset+(c.big?6-2*Math.round(ease(c.age/c.charge)*(a<0?1:0)):0);
 return {fade,scale,offset:shift,muzzle:shift-2+Math.round(THROAT_X*scale)}}
function tickBeams(dt,b){const score=eightScore[round-1];if(sent<score.count&&elapsed>=nextBeam){const vertical=sent%2===0,big=round===3||round===5&&sent>=20;
 cannons.push({vertical,reverse:sent%4>=2,pos:Math.round(big?Math.max((vertical?b.l:b.u)+18,Math.min((vertical?b.r:b.d)-18,vertical?x:y)):vertical?x:y),big,age:0,charge:big?.92:round===4?.76:round<4?.77:.58,width:big?13:9});sent++;nextBeam+=big?Math.max(1.25,score.beat):score.beat}
 for(const c of cannons){const prev=c.age;c.age+=dt;if(prev<c.charge&&c.age>=c.charge)sfx('impact',c.big?.75:.43);
 const along=c.vertical?(c.reverse?b.d-y:y-b.u):(c.reverse?b.r-x:x-b.l),distance=along-blasterPose(c).muzzle;
 if(distance>=-2&&c.age>=c.charge&&c.age<c.charge+.27&&!testGod&&inv<=0&&Math.abs((c.vertical?x:y)-c.pos)<blastRadius(c.width,distance)+2){hp=Math.max(0,hp-(c.big?6:4));inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];cannons=[];msg('Your soul begins to crack.')}ui();if(!hp)return}}
 cannons=cannons.filter(c=>c.age<c.charge+.47)}
// Side-profile skull, mandible on a separate pivot. Bake the opening arc at native resolution.
const blasterFrames=new Map();
function blasterSkull(open,big=false){const key=open+(big?16:0);if(blasterFrames.has(key))return blasterFrames.get(key);
 const tile=document.createElement('canvas');tile.width=30;tile.height=32;const ctx=tile.getContext('2d');
 const colors={k:'#282530',s:'#665e71',m:'#a59aa3',b:'#d2c7be',h:'#f4e9db',v:'#282530'};
 function pixel(x,y,c){ctx.fillStyle=colors[c];ctx.fillRect(Math.round(x),Math.round(y),1,1)}
 const head=['kk','kskk      kkk',' kmbkk  kkbsk','  kmbbkkbhmsk','   kmbbWWWbbsk','  kmbWWWWbbbmskk',' kmbWWbbbbbmbbbsk','ksbWWbmbsmbbbWWbbkk','kmbWbbmskkkmbWWWWWbkk','ksbbbmkkvkkkmbbbbbbbmskk',' ksbbmkkvvkksmmmkkkmbbbsk','  kmbmskkkksbmskk  kmmssk','   ksmbbbmbbskk     kskk','    ksmmbbskk        kk','     kssskk'];
 head.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')pixel(x,y+1,c==='W'?'h':c)}));
 const jaw=['    kkk','  kkmbbkkkk     kk',' kmbbbbbbbbkkkkkhk','  ksmmmbbbbbbbbbbsk','   kkkkssmmmbbbmsk','       kkkkkkkkkk'];
 // Shear around the rear hinge in whole columns to keep the teeth joined at every opening.
 jaw.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')pixel(4+x,13+y+Math.max(0,x-3)*open/15,c)}));
 // The cheek pivot overlaps both bones even in the widest open pose.
 const hinge=[' skk ','sbbmk','mhbsk',' mbsk','  msk'];hinge.forEach((r,j)=>[...r].forEach((v,i)=>{if(v!==' ')pixel(4+i,12+j,v)}));
 for(const [x,y,v] of [[13,6,'s'],[14,7,'m'],[15,7,'s'],[16,8,'m'],[18,9,'h'],[19,9,'h'],[3,4,'b']])pixel(x,y,v);
 if(big){const crest=['kk',' kmkk     kk','  khbkk  kms','   kbbhkkbsk','    ksmhhbmk','      kmmssk'];crest.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!==' ')pixel(x+3,y,v)}));
  // Reinforced jaw rail follows the mandible rather than sliding over it.
  for(let x=9;x<20;x++){const y=17+Math.round((x-7)*open/15);pixel(x,y,x<13?'s':'m');if(x%4!==0)pixel(x,y-1,'b')}
 }
 blasterFrames.set(key,tile);return tile}
function drawBeams(b){for(const c of cannons){g.save();g.translate(c.vertical?c.pos:c.reverse?b.r:b.l,c.vertical?(c.reverse?b.d:b.u):c.pos);if(c.vertical)g.rotate(c.reverse?-Math.PI/2:Math.PI/2);else if(c.reverse)g.scale(-1,1);
 const span=c.vertical?b.d-b.u:b.r-b.l,w=c.width,a=c.age-c.charge,q=c.age/c.charge,{fade,scale,offset,muzzle}=blasterPose(c),length=span-muzzle;
 // Clip in firing coordinates so warning, beam and traveling highlights cannot leak behind the jaw.
 g.save();g.beginPath();g.rect(muzzle,-w,length,w*2);g.clip();g.translate(muzzle,0);
 if(a<0){g.globalAlpha=.32+.48*ease(q);for(let k=Math.floor(c.age*24)%6;k<length;k+=6)rect(k,-1,3,1,'#dec0e6')}
 else{const half=Math.floor(w/2),flow=Math.floor(a*210);g.globalAlpha=fade;
  // Contiguous pixel bands flare out from inside the mouth, behind the foreground teeth.
  for(let d=0;d<length;){const r=blastRadius(w,d),n=r===half?length-d:Math.min(2,length-d);
   rect(d,-r,n,2*r+1,'#9875af');rect(d,1-r,n,2*r-1,'#ddc5ea');const core=Math.max(0,Math.round((r-2)*(.86+.14*Math.cos(a*44))*fade));rect(d,-core,n,core*2+1,'#fffaf3');d+=n}
  for(let k=w+flow%23;k<length;k+=23){rect(k,-half,6,1,'#f4ddff');rect(k+7,half-1,4,1,'#c59ed7')}
 }
 g.restore();g.globalAlpha=ease(c.age/.12)*fade;g.translate(offset-2,-Math.round(14*scale));g.scale(scale,scale);g.imageSmoothingEnabled=false;
 const opening=Math.round(6*(a<0?ease((q-.18)/.78):fade));g.drawImage(blasterSkull(opening,c.big),0,0);
 crossEye(g,9,10,t,1);
 if(a<0){g.save();const build=ease((q-.12)/.72),lock=ease((q-.78)/.18),count=c.big?5:3;
  // Strands converge around a fixed throat, then vanish into a held white core before recoil.
  for(let i=0;i<count;i++){const phase=(q*(1.5+q)+i/count)%1,dist=(1-phase)*(c.big?14:10),dy=Math.sin(i*2.4+q*5)*dist*.34;
   g.globalAlpha=build*(1-lock)*Math.sin(Math.PI*phase);rect(THROAT_X+Math.round(dist),14+Math.round(dy),1+Math.round(phase),1,'#d1b3df')}
  g.globalAlpha=build;const radius=Math.round((c.big?3:2)*build);rect(THROAT_X,14-radius,3,radius*2+1,'#b08cbd');rect(THROAT_X-1,13,5,3,'#e0cbeb');
  g.globalAlpha=build*(.45+.55*lock);rect(THROAT_X,14,2+Math.round(lock*3),1,'#fffaf4');g.restore()}
 g.restore()}}
function nextGate(){const score=encounter===8?eightScore[round-1].gates:gateScores[round-1],entry=score[patternStep%score.length],b=sevenBox(),vertical=entry[0]==='T',span=vertical?b.r-b.l:b.d-b.u;
 const gap=encounter===8?eightScore[round-1].gap:[21,20,19,30,25][round-1],cut=6+Math.round((span-gap-12)*Number(entry[1])/3);return {b,vertical,reverse:entry[0]==='R',cut,gap,span,kind:{w:'white',b:'blue',r:'red',g:'glitch'}[entry[2]]}}
function sevenGate(){const {b,vertical,reverse,cut,gap,span,kind}=nextGate(),speed=61+round*6;
 for(const [offset,size] of [[0,cut],[cut+gap,span-cut-gap]]){if(vertical)sevenBone(b.l+offset,b.u,size,0,speed,true,kind);else sevenBone(reverse?b.r-3:b.l,b.u+offset,size,reverse?-speed:speed,0,false,kind)}patternStep++;spawn=encounter===8?eightScore[round-1].pace:[.82,.79,.74,.82,.65][round-1]}
function gateWarning(){if(round>=6||encounter===8&&round===5||mode!=='dodge'||spawn>.32)return;const {b,vertical,reverse,cut,gap,span,kind}=nextGate(),edge=reverse?b.r-2:b.l,color={white:'#cebea6',blue:'#539ab4',red:'#b6686f',glitch:'#a385b9'}[kind];g.save();g.globalAlpha=.3+.55*ease(1-spawn/.32);
 for(const [start,end] of [[0,cut],[cut+gap,span]])for(let k=start;k<end;k+=4){if(vertical)rect(b.l+k,b.u,2,2,color);else rect(edge,b.u+k,2,2,color)}g.restore()}
function wallSequence(dt,b){if(!wallPull&&slamCount>=3)return false;if(!wallPull){slamCount++;const nearest=[[x-b.l,-1,0],[b.r-x,1,0],[y-b.u,0,-1],[b.d-y,0,1]].sort((a,b)=>a[0]-b[0])[0];wallPull={age:0,nx:nearest[1],ny:nearest[2],sx:x,sy:y,fired:false};shots=[];sampleCue('rattle')}
 const w=wallPull,prev=w.age;w.age+=dt;
 if(prev<.56&&w.age>=.56)sfx('impact',.82);if(prev<1.76&&w.age>=1.76)sfx('crack',.78);
 if(w.age<=.92){const p=ease((w.age-.22)/.34);x=w.sx+((w.nx<0?b.l+5:w.nx>0?b.r-5:w.sx)-w.sx)*p;y=w.sy+((w.ny<0?b.u+5:w.ny>0?b.d-5:w.sy)-w.sy)*p;return true}
 // Root every spike on the marked wall. Only its exposed length changes.
 if(w.age>=1.76&&!w.fired){w.fired=true;for(let off=6;off<112;off+=10)sevenBone(w.nx?0:b.l+off,w.ny?0:b.u+off,4,0,0,!!w.nx,'corrupt boke')}
 if(w.fired){const depth=Math.round(SLAM_REACH*ease((w.age-1.76)/.17)*(1-ease((w.age-2.65)/.27)));for(const s of shots){s.h=Math.max(4,depth);if(w.nx)s.x=w.nx<0?b.l:b.r-s.h;else s.y=w.ny<0?b.u:b.d-s.h}if(w.age>=2.92)shots=[]}if(w.age>=3.55)wallPull=null;return false}
let endingAge=0;
function sevenTick(dt){if(encounter===8)endingAge+=dt;if(encounter===8&&mode==='sevenHold')return;if(mode==='sevenHold'){endingAge+=dt;if(encounter===7&&endingAge>=12){startEight()}return}if(mode==='strike'){const before=1.45-flash;flash-=dt;const age=1.45-flash;if(swings<(encounter===8?5:6)){if(before<.18&&age>=.18)sfx('phaseOut');if(before<1.06&&age>=1.06)sfx('phaseIn')}else if(before<.52&&age>=.52)sfx('impact');if(flash<=0){if(encounter===8){if(swings===5){mode='sevenHold';msg('…');ui()}else{round++;eightWave()}}else if(swings===6){endingAge=0;mode='sevenHold';msg('…');ui()}else{round++;sevenWave(round===4)}}return}if(mode!=='dodge')return;
 if(roomShift){const m=roomShift;m.age=Math.min(SHIFT_TIME,m.age+dt);const p=ease(m.age/SHIFT_TIME);x=m.sx+(180-m.sx)*p;y=m.sy+(160-m.sy)*p;if(m.age>=SHIFT_TIME)roomShift=null;return}
 const b=sevenBox(),ox=x,oy=y;elapsed+=dt;inv-=dt;
 const held=round===6&&wallSequence(dt,b);if(held&&drag&&target){target=null}if(!held){let dx=+ (keys.has('d')||keys.has('arrowright'))- +(keys.has('a')||keys.has('arrowleft')),dy=+(keys.has('s')||keys.has('arrowdown'))- +(keys.has('w')||keys.has('arrowup'));if(drag&&target){dx=target[0]-x;dy=target[1]-y}const q=Math.hypot(dx,dy)||1,step=drag&&target?Math.min(q,dt*95):dt*95;x=Math.max(b.l+5,Math.min(b.r-5,x+step*dx/q));y=Math.max(b.u+5,Math.min(b.d-5,y+step*dy/q))}if(encounter===8){tickBeams(dt,b);if(mode==='dying')return}if(round<6&&!(encounter===8&&round===5)&&(spawn-=dt)<=0)sevenGate();const moving=Math.hypot(x-ox,y-oy)>.001;
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;const width=s.horiz?s.h:3,height=s.horiz?3:s.h,dist=Math.hypot(Math.max(s.x-x,0,x-s.x-width),Math.max(s.y-y,0,y-s.y-height));if(s.glitch&&dist<31){s.glitch=false;s.changed=t;s.blue=Math.random()<.5;s.red=!s.blue}if(!testGod&&inv<=0&&dist<3&&(!s.blue||moving)&&(!s.red||!moving)){hp=Math.max(0,hp-s.damage);inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];wallPull=null;msg('Your soul begins to crack.')}ui();if(!hp)return}}
 shots=shots.filter(s=>s.x+(s.horiz?s.h:3)>=b.l&&s.x<=b.r&&s.y+(s.horiz?3:s.h)>=b.u&&s.y<=b.d);if(encounter===8?sent===eightScore[round-1].count&&!cannons.length:round===6?slamCount===3&&!wallPull:elapsed>6+round*.45){shots=[];wallPull=null;mode='ready';msg('An opening. FIGHT.');ui()}}
function sevenStage(b){
 // The study threshold survives the cut as a low-contrast, cracked arch.
 const y=b.u-4;rect(134,y-73,92,73,'#151417');rect(138,y-70,84,70,'#111013');
 for(const side of [-1,1]){const x=180+side*53;rect(x-3,y-76,7,76,'#211f24');rect(x-2,y-74,1,71,'#302c32');for(let k=0;k<4;k++)rect(x-3,y-k*18-2,7,2,'#161518');rect(x-5,y-2,11,2,'#353038')}
 rect(124,y-78,112,3,'#242127');rect(128,y-75,104,1,'#373039');for(let i=0;i<9;i++)rect(180+(i%4===2?1:0),y-72+i*8,1,8,'#282329');
 rect(163,y-1,34,2,'#252128');rect(169,y-1,22,1,'#302b33')}
function sevenDraw(){const b=sevenBox();sevenStage(b);g.save();g.translate(180,b.u-5);g.translate(-180,-110);if(mode==='strike'&&swings<(encounter===8?5:6))blinkDodge(1.45-flash);else sevenFigure();if(mode==='strike'){if(swings===(encounter===8?5:6))g.translate(0,10);slash(1.45-flash,swings<(encounter===8?5:6))}g.restore();rect(b.l-2,b.u-2,b.r-b.l+4,b.d-b.u+4,'#cbbfd2');rect(b.l,b.u,b.r-b.l,b.d-b.u,'#111015');for(const xx of [b.l,b.r-5])for(const yy of [b.u,b.d-1])rect(xx,yy,5,1,'#55495d');g.save();g.beginPath();g.rect(b.l,b.u,b.r-b.l,b.d-b.u);g.clip();gateWarning();if(encounter===8)drawBeams(b);slamEffects(b);for(const s of shots){g.save();g.translate(s.x,s.y);if(s.horiz)g.transform(0,1,1,0,0,0);drawVisitorBone(s);g.restore()}
 const w=wallPull;if(w&&!w.fired)drawSlamAlert(b,w);if(mode==='dying')brokenSoul(b);else if(hp&&(inv<=0||Math.floor(t*12)%2)){if(w&&w.age<=.92){g.save();const flatten=pulse(w.age,.54,.80);g.translate(Math.round(x),Math.round(y));g.scale(1+flatten*(w.nx?-.26:.20),1+flatten*(w.ny?-.26:.20));g.translate(-x,-y);soulRows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='r')rect(x+i-3,y+j-3,1,1,j===0||soulRows[j][i-1]!=='r'||soulRows[j][i+1]!=='r'?'#b99acb':'#09060d')}));g.restore()}else tinySoul(x,y)}g.restore()}

// Effects are timed from the same impact clock as the hand and collision.
function slamEffects(b){const w=wallPull;if(!w)return;const px=w.nx<0?b.l:w.nx>0?b.r-1:w.sx,py=w.ny<0?b.u:w.ny>0?b.d-1:w.sy;
 if(w.age>.22&&w.age<.56){for(let i=1;i<=3;i++){g.save();g.globalAlpha=.28/i;const d=i*3;rect(x-w.nx*d-2,y-w.ny*d-1,4,2,'#a57cbb');g.restore()}}
 const f=(w.age-.56)/.42;if(f<0||f>=1)return;g.save();g.globalAlpha=1-ease(f);for(let i=-3;i<=3;i++){const across=i*(1+f*4),back=(1-Math.abs(i)/5)*f*12;rect(px-w.nx*back-w.ny*across,py-w.ny*back+w.nx*across,2,1,i%2?'#b99bc9':'#87738e')}g.restore()}

const SLAM_REACH=26;
// One steady wall highlight and one upright warning, for any orientation.
function drawSlamAlert(b,w){const color='#ffc46b';
 g.save();g.globalAlpha=.19;rect(w.nx>0?b.r-SLAM_REACH:b.l,w.ny>0?b.d-SLAM_REACH:b.u,w.nx?SLAM_REACH:b.r-b.l,w.ny?SLAM_REACH:b.d-b.u,'#e59298');g.restore();
 rect(w.nx>0?b.r-2:b.l,w.ny>0?b.d-2:b.u,w.nx?2:b.r-b.l,w.ny?2:b.d-b.u,color);
 const cx=w.nx<0?b.l+8:w.nx>0?b.r-8:(b.l+b.r)/2,cy=w.ny<0?b.u+8:w.ny>0?b.d-8:(b.u+b.d)/2;
 rect(cx-1,cy-4,3,5,color);rect(cx-1,cy+3,3,2,color)}
// Corrupt Boke is solid and lethal regardless of movement. A charge moves
// through the fissure, never recoloring the body like a switching glitch bone.
function drawCorruptBoke(s){const h=Math.round(s.h),shaft=Math.max(0,h-4),pulse=(t*.95+s.phase*.067)%1;
 rect(0,2,3,shaft,'#654087');rect(0,2,1,shaft,'#b7b5be');rect(2,2,1,shaft,'#494551');
 for(let j=3;j<h-2;j++){const vein=(j%9<3?0:1);rect(vein,j,1,1,'#a447d8')}
 if(shaft>1){const at=2+Math.floor(pulse*shaft);rect(0,at,3,1,'#e2acff');if(at>3)rect(1,at-1,1,1,'#c172f5')}
 for(const d of [1,-1]){const y=d===1?0:h-1;rect(-1,y,2,1,'#d6d4dc');rect(2,y,2,1,'#ada8ba');rect(-2,y+d,7,1,'#897496');if(h>4)rect(-1,y+2*d,5,1,'#704388')}}
function drawVisitorBone(s){if(s.kind==='corrupt boke'){drawCorruptBoke(s);return}if(!s.glitch){boneSprite({...s,x:0,y:0});const age=t-s.changed;if(age>=0&&age<.18){const k=Math.round((s.h-2)*age/.18);rect(-1,k,5,1,s.blue?'#c1fbff':'#ffdbbf')}return}
 // Ash-gray cortex around a violet marrow line. A narrow ripple runs along
 // each bone at its own phase; its caps and collision silhouette stay steady.
 const h=Math.round(s.h),len=Math.max(0,h-4),cycle=(t*1.15+s.phase*.137)%1,cut=2+Math.floor(cycle*Math.max(1,len));
 rect(0,2,3,len,'#77508e');rect(0,2,1,len,'#bbb6c1');rect(2,2,1,len,'#615c69');
 if(len>2){const trail=Math.min(4,cut-2);rect(1,cut-trail,1,trail,'#ad7ccb');rect(0,cut,3,1,'#c9a3e6');if(cycle>.34&&cycle<.52)rect(-1,cut,1,1,'#a883c4')}
 for(const d of [1,-1]){const tip=d===1?0:h-1;rect(-1,tip,2,1,'#ddd9df');rect(2,tip,2,1,'#ada6b5');rect(-2,tip+d,7,1,'#998ca4');if(h>4)rect(-1,tip+2*d,5,1,'#786384')}}
