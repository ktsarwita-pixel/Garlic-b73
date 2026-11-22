// The same wounded visitor follows the soul from study to arena.
let revealClock=0,wallPull=null,slamCount=0,roomShift=null;
const SHIFT_TIME=1.05,SLAM_COUNT=6;let lastSlamAxis=null;
function startSeven(first=1){encounter=7;resetBattle();keys.clear();round=first;swings=first-1;sevenWave()}
function sevenBox(){const p=roomShift?.reverse?1-ease(roomShift.age/SHIFT_TIME):round<4?0:roomShift?ease(roomShift.age/SHIFT_TIME):1;return {l:94+28*p,r:266-28*p,u:162-60*p,d:217+p}}
function sevenWave(morph=false){roomShift=morph?{age:0,sx:x,sy:y}:null;startWave(.55);wallPull=null;slamCount=0;lastSlamAxis=null;const b=sevenBox();if(!roomShift){x=(b.l+b.r)/2;y=(b.u+b.d)/2;}msg(['White: dodge. Blue: stop. Red: move.','Watch the fractured bones change near you.','Keep moving through red. Watch the fractures.','Look up. The ceiling is no longer safe.','The gates are closing faster.','Corrupt Boke: leave the marked wall. A hit costs 10 HP.'][round-1]);ui()}
// Raster the linked sleeve, wrist and finger joints without antialiasing.
let visitorSheet, visitorInk;
function stampInk(x,y,w,h,color){visitorInk.fillStyle=color;visitorInk.fillRect(Math.round(x)-130,Math.round(y)-32,w,h)}
function stampMask(rows,palette,x,y){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(palette[row[i]])stampInk(x+2*i,y+2*j,2,2,palette[row[i]])})}
function jointLine(x0,y0,x1,y1,width,color){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)stampInk(x0+(x1-x0)*i/n-width/2,y0+(y1-y0)*i/n-width/2,width,width,color)}
// Forward kinematics: animate angles, never endpoints or bone lengths.
function armRig(side,w){const a=w?w.age:0,lead=w&&(!w.nx||w.nx===side),lift=ease(a/.22)*(1-ease((a-.22)/.34)),whip=ease((a-.22)/.34)*(1-ease((a-.78)/.54)),cast=ease((a-(w?spikeAt(w):1.76)+.29)/.29)*(1-ease((a-2.64)/.42));
 const power=(whip+.80*cast)*(lead?1:.32),aim=w&&w.ny?w.ny*1.45:0;
 // The elbow leads; the wrist trails on the throw and checks back on impact.
 const lag=ease((a-.27)/.29)*(1-ease((a-.82)/.48)),check=ease((a-.56)/.08)*(1-ease((a-.64)/.18));
 const upper=1.14-.58*lift+(aim-1.14+.22)*power+.16*check,fore=1.68-2.85*lift+(aim-1.68-.14)*(lag+.72*cast)*(lead?1:.32)-.28*check;
 const sx=180+side*16,sy=78,ex=sx+side*9*Math.cos(upper),ey=sy+9*Math.sin(upper),px=ex+side*8*Math.cos(fore),py=ey+8*Math.sin(fore);
 // Fingers close little-finger first, and uncurl in a wave as the wall is cast.
 const digits=[0,1,2].map(i=>ease((a-i*.036)/.19)*(1-ease((a-.30-i*.035)/.27))+.25*check);
 const thumb=ease((a-.06)/.17)*(1-ease((a-.41)/.25));
 return {sx,sy,ex,ey,px,py,digits,thumb,angle:(side===1?fore:Math.PI-fore)+side*(.28*lift-.19*whip+.32*check-.12*cast),curl:lift+.35*whip,cast};}
function revenantArm(side,w){const {sx,sy,ex,ey,px,py,angle,curl,cast,digits,thumb}=armRig(side,w);
 jointLine(sx,sy,ex,ey,7,'#282532');jointLine(sx,sy,ex,ey,4,'#48505d');jointLine(ex,ey,px,py,5,'#23232c');jointLine(ex,ey,px,py,2,'#8d8992');
 stampInk(ex-1,ey-1,3,2,'#606475');stampInk(px-1,py-1,2,2,'#bcb3b0');
 const ux=Math.cos(angle),uy=Math.sin(angle),tx=-uy,ty=ux;function at(out,across){return [px+ux*out+tx*across,py+uy*out+ty*across]}
 jointLine(...at(0,0),...at(3,0),4,'#a29c9b');jointLine(...at(.5,-1),...at(3,-1),2,'#d5cdc1');
 for(let i=-1;i<=1;i++){const [bx,by]=at(3,i*1.7),dir=angle+i*(.10+.16*cast)+side*.28*curl,kx=bx+2.5*Math.cos(dir),ky=by+2.5*Math.sin(dir),end=dir+side*(.20+digits[i+1]*1.24-.18*cast),len=i===0?3:2;jointLine(bx,by,kx,ky,2,'#a79e9c');jointLine(kx,ky,kx+len*Math.cos(end),ky+len*Math.sin(end),1,'#e6d9c9')}
 jointLine(...at(1,side*1.7),...at(3+thumb*1.8,side*(4-thumb*2)),2,'#beb5ae');}
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
 '    ksswwwWWWwsk',
 '       kkkkkk',
 '     kswwwwwssk',
 '      ksswwssk',
 '        kkkk'];
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
 // Raise the inner brows and let the outer lids sag; leave the empty socket dark.
 jointLine(167,hy+15,173,hy+12,2,'#827e80');jointLine(173,hy+12,176,hy+11,1,'#e2dace');
 jointLine(181,hy+12,187,hy+13,2,'#90898a');jointLine(187,hy+13,192,hy+15,2,'#777279');
 jointLine(167,hy+19,170,hy+21,1,'#706b70');jointLine(190,hy+20,187,hy+22,1,'#878084');
 // Only the outer ends bridge the recessed jaw gap; no inner sweep or bright rim.
 const jaw=hx+Math.round(13/16*(2+droop/2));
 for(const edge of [13,26])stampInk(jaw+edge,hy+25,1,4,p.s);
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
 const lock=mode==='dodge'&&wallPull&&wallPull.age<spikeAt(wallPull);
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
 if(encounter===8&&visitorSheet){const jump=age<.65?.18:1.06,from=jump===.18?0:side*56,to=side*56-from,f=(age-jump)/.14;
  // Lose registration at the old position, vanish, then reassemble at the other anchor.
  if(f>=-.6&&f<1){const incoming=f>.18,strength=incoming?1-(f-.18)/.82:(f+.6)/.6;g.save();g.imageSmoothingEnabled=false;
   if(f<0||incoming)for(let row=0;row<88;row+=4){const n=row/4,j=Math.floor(age*50);if(strength>((n*7)%22+1)/22)continue;const tear=Math.round(Math.sin(n*2+j)*strength*17);g.drawImage(visitorSheet,0,row,100,4,130+(incoming?to:from)+tear,32+row,100,4)}g.restore();return}
  g.save();g.translate(dx,0);sevenFigure();g.restore();return}
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
function startEight(retry=false){const handoff=!retry&&encounter===7?{age:0,sx:x,sy:y,reverse:true}:null;encounter=8;if(retry)resetBattle();endingAge=Math.max(12,endingAge);round=1;swings=0;boss=100;wallPull=null;keys.clear();eightWave(handoff)}
function eightWave(handoff=null){startWave(.7);roomShift=handoff||(round===4?{age:0,sx:x,sy:y}:null);if(handoff){x=handoff.sx;y=handoff.sy}const b=sevenBox();if(!roomShift){x=180;y=(b.u+b.d)/2}cannons=[];sent=0;nextBeam=.65;msg(['Watch the skulls. Step out of their sights.','Fractured bones. Blue: stop. Red: move.','Heavy blasters. Watch the wide lanes.','Stay near the middle. Sidestep the dotted sights.','Blasters only. Keep moving.'][round-1]);ui()}
const THROAT_X=12;
function blastRadius(width,d){return Math.min(Math.floor(width/2),1+Math.floor(Math.max(0,d)/2))}
function blasterPose(c){const a=c.age-c.charge,fade=1-ease((a-.27)/.2),scale=c.big?1.25:1;
 const offset=-Math.round(7*(1-ease(c.age/.18))+5*(1-fade)+(a<0?0:3*(1-ease(a/.19))));
 const shift=offset+(c.big?6-2*Math.round(ease(c.age/c.charge)*(a<0?1:0)):0);
 return {fade,scale,offset:shift,muzzle:shift-2+Math.round(THROAT_X*scale)}}
function tickBeams(dt,b){const score=eightScore[round-1];if(sent<score.count&&elapsed>=nextBeam){const vertical=sent%2===0,big=round===3||round===5&&sent>=20;
 cannons.push({vertical,reverse:sent%4>=2,pos:Math.round(big?Math.max((vertical?b.l:b.u)+18,Math.min((vertical?b.r:b.d)-18,vertical?x:y)):vertical?x:y),big,age:0,charge:big?.92:round===4?.76:round<4?.77:.58,width:big?13:9});sfx('beamCharge',cannons[cannons.length-1].charge);sent++;nextBeam+=big?Math.max(1.25,score.beat):score.beat}
 for(const c of cannons){const prev=c.age;c.age+=dt;if(prev<c.charge&&c.age>=c.charge)sfx('beamFire',c.charge);
 const along=c.vertical?(c.reverse?b.d-y:y-b.u):(c.reverse?b.r-x:x-b.l),distance=along-blasterPose(c).muzzle;
 if(distance>=-2&&c.age>=c.charge&&c.age<c.charge+.27&&!testGod&&inv<=0&&Math.abs((c.vertical?x:y)-c.pos)<blastRadius(c.width,distance)+2){hp=Math.max(0,hp-(c.big?6:4));inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];cannons=[];msg('Your soul begins to crack.')}ui();if(!hp)return}}
 cannons=cannons.filter(c=>c.age<c.charge+.47)}
// Dorsal view. Both temples, horns and jaw rails are projected around the
// beam axis (y=14); local +x always points toward the target.
const blasterFrames=new Map();
// Tint actual enamel in the source cut, never the rectangular strip or dark throat.
const litJaws=new Map();
function jawSource(level){const base=frontalGuard();if(!level)return base;if(litJaws.has(level))return litJaws.get(level);
 const src=document.createElement('canvas');src.width=base.width;src.height=base.height;const ctx=src.getContext('2d');ctx.drawImage(base,0,0);
 const img=ctx.getImageData(0,19,30,10),d=img.data;for(let i=0;i<d.length;i+=4){if(!d[i+3]||d[i]<120)continue;
  const target=d[i]>245?[255,250,243]:d[i]>200?[221,197,234]:[152,117,175];for(let j=0;j<3;j++)d[i+j]+=(target[j]-d[i+j])*level/32}
 ctx.putImageData(img,0,19);litJaws.set(level,src);return src}

function blasterSkull(open,big=false,charge=0,front=false){open=Math.round(open*4)/4;const glow=Math.round(Math.max(0,Math.min(1,charge))*32),key=open*4+(big?32:0)+64*glow+(front?4096:0);if(blasterFrames.has(key))return blasterFrames.get(key);
 const tile=document.createElement('canvas');tile.width=30;tile.height=32;const ctx=tile.getContext('2d');
 const palette={k:'#282530',s:'#48454e',m:'#a6a4ad',b:'#e4e3df',h:'#fffdf5',u:'#e4e3df',l:'#fffdf5'};
 if(!front){
  // Cut the finished blocker, including its temple highlights. Local source Y
  // becomes firing X. Keep the crown cut rigid; animate only the bite below it.
  const src=jawSource(glow);ctx.imageSmoothingEnabled=false;ctx.translate(0,29);ctx.rotate(-Math.PI/2);
  const strip=(sy,dy,width,gap=0)=>{const left=Math.floor((29-width)/2),half=width>>1;
   for(let side=0;side<2;side++){const dx=left+side*half+(side?gap:-gap);
    ctx.drawImage(src,side*15,sy,15,1,dx,dy,half,1);
   }
  };
  const upper=[0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18];
  upper.forEach((sy,j)=>strip(sy,j,(sy<7?26:28)-(big?0:4),sy>15?Math.round(open*(sy-15)/9):0));
  // Closed, only the front edge of the chin shows. Opening exposes the
  // cheek hinges one scanline at a time, without scaling the eye sockets.
  const jaw=[19,20,21,22,23,24].slice(6-Math.round(open)).concat([24,26,27,28]);
  jaw.forEach((sy,j)=>strip(sy,upper.length+j,Math.max(20,26-Math.floor(j/2)*2)-(big?0:2),Math.round(open*(1+j/jaw.length)*.4)));
  blasterFrames.set(key,tile);return tile}
 // Both views consume the same bone samples. In front view anatomical depth
 // determines height: horns sweep upward, the crown overhangs the muzzle,
 // and the short lower jaw sits below the dark throat rather than beside it.
 // Front-only surfaces hidden in plan view: throat interior, socket walls
 // and the underside joining both mandibular branches at the chin.
 // The front elevations supply the head-on contour that a top view lacks.
 // Clip projected markings to this outline; do not flatten the two jaws together.
 const face=[' k',' khk',' kbhk','  kbhk     k','  kmbhk   khk','   kmbhkkkhbbkk','   kshhhhbmbhhb','  kmhhbbmmmhhbm',' kbhbbskkmbhbms',' khbskkkksmbbms',' kmbkkkkkksbhbm','  kskkkkkksmhbk','  kmbskkkkmbhbk','  kbhhbmmsbhbsk','   kmbhhbhbbskk','    kshbhbmskks','    kmbkmbhssmb','    kbhkkbhbbhh','    kbhksmbkkks','     mbkshkkkkk','     kmbsbkkkkk','     ksmsbkkkkk','      smbskkkkk','      ksmskkkkk','       kmbskkkk','        kmbsskk','         kmbbms','          ksmmb','           ksss'];if(front){ctx.beginPath();face.forEach((row,y)=>[...row].forEach((v,i)=>{if(v===' ')return;for(const x of [i,29-i]){ctx.fillStyle=palette[x>14&&y>15&&v==='h'?'b':v];ctx.fillRect(x,y,1,1);ctx.rect(x,y,1,1)}}));ctx.clip()}
 let part='crown';
 const dot=(x,y,t)=>{ctx.fillStyle=palette[t];if(!front){ctx.fillRect(x,y,1,1);return}
  const d=y-14,sign=Math.sign(d);
  let u=14.5+d,v=3+x,h=2;
  // Seen head-on, the cheek occludes the rear jaw rails. Keep the
  // frontal nose, sockets, hinge and chin planes visible; only the
  // swept temple armor breaks through the outer sides of that surface.
  if(part!=='crown'||Math.abs(d)<9||x>5)return;
  u+=sign*Math.min(2,x*.16);v=4+x*.86-Math.max(0,Math.abs(d)-7)*.65;h=2;
  ctx.fillRect(Math.floor(u),Math.round(v),2,h)};
 // A vaulted crown, hooked occipital spurs and two orbital trenches. Read each
 // row from the back of the skull toward its snout. Reflect shape, not lighting.
 const cap=['   kmbbhbbbk','  kmbhhbbhhbk','  kbhhhmbhhbbk','  kbhmsksbbhhbk','   kbbskkkkkbhbk','   khbskkkkkmbbk','   khhhbkkksbhbk','  ksbhhhbbbhhbkk','  kbhhbkkmbbsk',' kbhhsk  kbbk',' kbbsk    kk','kbsk'];
 for(const side of [-1,1]){part='crown';cap.forEach((row,d)=>[...row].forEach((v,x)=>{if(v!==' ')dot(x,14+side*d,side>0&&v==='h'?'b':v)}));
  if(big){for(let x=1;x<14;x++){const outer=12-Math.floor((x-1)*.34);for(let j=0;j<4;j++)dot(x,14+side*(outer-j),['k','m',side<0?'h':'b','s'][j])}
   for(let x=5;x<=12;x++)dot(x,14+side*(1+(x>>2)),x%3?'m':'h')}
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
  // Thin anodic streams run along the core, always inside the damaging silhouette.
  for(let k=w+flow%31;k<length;k+=31){const sign=k%2?1:-1;rect(k,sign*Math.max(1,half-2),9,1,'#f3e3f8');rect(k+9,sign*Math.max(1,half-3),4,1,'#fff9fb')}
  for(let k=w+flow%23;k<length;k+=23){rect(k,-half,6,1,'#f4ddff');rect(k+7,half-1,4,1,'#c59ed7')}
 }
 g.restore();g.globalAlpha=ease(c.age/.12)*fade;g.translate(offset-2,-Math.round(14*scale));g.scale(scale,scale);g.imageSmoothingEnabled=false;
 const opening=6*(a<0?ease((q-.18)/.78):fade);g.drawImage(blasterSkull(opening,c.big,a<0?ease((q-.12)/.72):fade),0,0);
 crossEye(g,9,c.big?8:9,t,1);
 if(a<0)drawBlasterCharge(q,c.big);
 else{g.save();g.globalAlpha*=Math.max(0,1-a/.21);for(const side of [-1,1]){rect(12,14+side*3,3,1,'#fff8fb');rect(16,14+side*5,2,1,'#e0c5e8')};g.restore()}
 g.restore()}}
function drawBlasterCharge(q,big,opacity=1){g.save();const alpha=g.globalAlpha*opacity;const build=ease((q-.12)/.72),lock=ease((q-.78)/.18),count=big?5:3;
  // Strands converge around a fixed throat, then vanish into a held white core before recoil.
  for(let i=0;i<count;i++){const phase=(q*(1.5+q)+i/count)%1,dist=(1-phase)*(big?14:10),dy=Math.sin(i*2.4+q*5)*dist*.34;
   g.globalAlpha=alpha*build*(1-lock)*Math.sin(Math.PI*phase);rect(THROAT_X+Math.round(dist),14+Math.round(dy),1+Math.round(phase),1,'#d1b3df')}
  // A pinprick at the emitter; the jaw itself now carries the charge cue.
  g.globalAlpha=alpha*build*(.4+.6*lock);rect(THROAT_X,14,1,1,'#fffaf3');g.restore()}
function nextGate(){const score=encounter===8?eightScore[round-1].gates:gateScores[round-1],entry=score[patternStep%score.length],b=sevenBox(),vertical=entry[0]==='T',span=vertical?b.r-b.l:b.d-b.u;
 const gap=encounter===8?eightScore[round-1].gap:[21,20,19,30,25][round-1],cut=6+Math.round((span-gap-12)*Number(entry[1])/3);return {b,vertical,reverse:entry[0]==='R',cut,gap,span,kind:{w:'white',b:'blue',r:'red',g:'glitch'}[entry[2]]}}
function sevenGate(){const {b,vertical,reverse,cut,gap,span,kind}=nextGate(),speed=61+round*6;
 for(const [offset,size] of [[0,cut],[cut+gap,span-cut-gap]]){if(vertical)sevenBone(b.l+offset,b.u,size,0,speed,true,kind);else sevenBone(reverse?b.r-3:b.l,b.u+offset,size,reverse?-speed:speed,0,false,kind)}patternStep++;spawn=encounter===8?eightScore[round-1].pace:[.82,.79,.74,.82,.65][round-1]}
function gateWarning(){if(round>=6||encounter===8&&round===5||mode!=='dodge'||spawn>.32)return;const {b,vertical,reverse,cut,gap,span,kind}=nextGate(),edge=reverse?b.r-2:b.l,color={white:'#cebea6',blue:'#539ab4',red:'#b6686f',glitch:'#a385b9'}[kind];g.save();g.globalAlpha=.3+.55*ease(1-spawn/.32);
 for(const [start,end] of [[0,cut],[cut+gap,span]])for(let k=start;k<end;k+=4){if(vertical)rect(b.l+k,b.u,2,2,color);else rect(edge,b.u+k,2,2,color)}g.restore()}
// Keep escape time in real seconds: tempo accelerates the throw, not player speed.
function spikeAt(w){const speed=w.tempo||1;return .92+.31*speed-.06*(speed-1)}
function wallSequence(dt,b){if(!wallPull&&slamCount>=SLAM_COUNT)return false;if(!wallPull){slamCount++;const nearest=[[x-b.l,-1,0],[b.r-x,1,0],[y-b.u,0,-1],[b.d-y,0,1]].filter(v=>lastSlamAxis===null||Boolean(v[1])!==lastSlamAxis).sort((a,b)=>a[0]-b[0])[0];lastSlamAxis=Boolean(nearest[1]);wallPull={tempo:1+.105*(slamCount-1),age:0,nx:nearest[1],ny:nearest[2],sx:x,sy:y,fired:false};shots=[];sampleCue('rattle')}
 const w=wallPull,prev=w.age;w.age+=dt*w.tempo;
 if(prev<.56&&w.age>=.56)sfx('impact',.82);if(prev<spikeAt(w)&&w.age>=spikeAt(w))sfx('crack',.78);
 if(w.age<=.92){const p=ease((w.age-.22)/.34);x=w.sx+((w.nx<0?b.l+5:w.nx>0?b.r-5:w.sx)-w.sx)*p;y=w.sy+((w.ny<0?b.u+5:w.ny>0?b.d-5:w.sy)-w.sy)*p;return true}
 // Root every spike on the marked wall. Only its exposed length changes.
 if(w.age>=spikeAt(w)&&!w.fired){w.fired=true;for(let off=6;off<112;off+=10)sevenBone(w.nx?0:b.l+off,w.ny?0:b.u+off,4,0,0,!!w.nx,'corrupt boke')}
 if(w.fired){const depth=Math.round(SLAM_REACH*ease((w.age-spikeAt(w))/(.105*w.tempo))*(1-ease((w.age-2.65)/.27)));for(const s of shots){s.h=Math.max(4,depth);if(w.nx)s.x=w.nx<0?b.l:b.r-s.h;else s.y=w.ny<0?b.u:b.d-s.h}if(w.age>=2.92)shots=[]}if(w.age>=3.55)wallPull=null;return false}
// The last volley is a bluff: these skulls are scenery, never damaging cannons.
let farewellAge=0,ring=[];
function beginFarewell(){x=180;y=140;mode='farewell';farewellAge=0;const offset=Math.random()*Math.PI*2;ring=Array.from({length:15},(_,i)=>({angle:offset+i*Math.PI*2/15+(Math.random()-.5)*.12,r:(i%3===1?117:99)+Math.random()*12,big:i%3===1,seed:Math.random()*9}));inv=0;msg('The broken blaster falls.');ui()}
function farewellTick(dt){const old=farewellAge;farewellAge+=dt;const at=n=>old<n&&farewellAge>=n;
 if(at(1.6))sampleCue('rattle');if(at(2.3))sfx('ringCharge',3.78);if(at(6.65))sfx('dust');if(at(7.2))msg('Sans: “SEE YOU SOON”');if(at(10.1))sfx('phaseOut');if(at(11)){beginEpilogue()}}
// Every grain starts at a real opaque bone pixel. The silhouette loses exactly
// the pixels that lift away; stable release times keep the ash from flickering.
const ashMaps=new WeakMap();
function erodeSkull(tile,dust,seed,origin){let grains=ashMaps.get(tile);if(!grains){grains=[];const {width:w,height:h}=tile,data=tile.getContext('2d').getImageData(0,0,w,h).data;let rng=7351;const rand=()=>((rng=Math.imul(rng,1664525)+1013904223>>>0)/4294967296);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=4*(x+w*y);if(!data[k+3])continue;grains.push({x,y,color:`rgb(${data[k]},${data[k+1]},${data[k+2]})`,release:.34*(1-y/h)+.29*rand(),vx:(rand()-.38)*21,vy:8+rand()*19,phase:rand()*6})}ashMaps.set(tile,grains)}
 const alpha=g.globalAlpha;for(const p of grains){const f=Math.max(0,(dust-p.release)/(1-p.release));if(f>=1)continue;g.globalAlpha=alpha*(1-f*f);g.fillStyle=f>.04?(p.phase>3?'#d7d0cf':'#928995'):p.color;g.fillRect(Math.round(p.x-origin+f*p.vx+3*f*Math.sin(seed+p.phase+f*5)),Math.round(p.y-origin-f*p.vy+5*f*f),1,1)}g.globalAlpha=alpha}
// Compose fracture frames at native resolution before rotating; rotating individual
// one-pixel strips leaves antialiased seams between neighboring columns.
const fractureFrames=new WeakMap();
function guardCut(x){return 24-Math.floor(x*.68)}
function splitSkull(tile,split){g.imageSmoothingEnabled=false;if(!split){g.drawImage(tile,-13,-13);return}
 let frames=fractureFrames.get(tile);if(!frames){frames=[];fractureFrames.set(tile,frames)}
 if(!frames[split]){const f=document.createElement('canvas');f.width=40;f.height=42;const ctx=f.getContext('2d');ctx.imageSmoothingEnabled=false;for(let i=0;i<tile.width;i++){const cut=guardCut(i);ctx.drawImage(tile,i,0,1,cut,i+5-split,5-split,1,cut);ctx.drawImage(tile,i,cut,1,32-cut,i+5+split,5+cut+split,1,32-cut);if(i>=7&&i<=18&&i%3!==0){ctx.fillStyle=i%2?'#cebfcb':'#918295';ctx.fillRect(i+5+split,5+cut+split,1,1)}}frames[split]=f}g.drawImage(frames[split],-18,-18)}
// A dedicated front view: paired crown prongs, recessed orbits and a central muzzle.
function frontalGuard(){return blasterSkull(5,true,0,true)}
function blockShield(age){if(age<.06||age>=2.9)return;const arrive=ease((age-.06)/.26),impact=Math.max(0,age-.42),kick=Math.sin(Math.min(1,impact/.25)*Math.PI),drop=ease((age-.58)/1.17),dust=ease((age-1.75)/1.15);g.save();g.translate(180+(1-arrive)*17+drop*7,82-(1-arrive)*13+kick*3+drop*19);g.rotate((1-arrive)*.22-drop*.34);g.scale(1.55+arrive*.18+kick*.12,1.66-kick*.16);g.globalAlpha=arrive;const tile=frontalGuard(),split=Math.round(4*drop);if(dust>0&&fractureFrames.get(tile)?.[4])erodeSkull(fractureFrames.get(tile)[4],dust,.7,18);else splitSkull(tile,split);crossEye(g,-5-split,-2-split,t,1-drop);g.restore()}
function ringPoint(c,r){const dy=Math.sin(c.angle);return [Math.round(x+Math.cos(c.angle)*r),Math.round(y+dy*r*(dy>0?.49:.72))]}
function farewellRing(){const a=farewellAge;if(a<1.5||a>9.1)return;const enter=ease((a-1.5)/.8),charge=ease((a-2.3)/2.7),eye=1-ease((a-6.08)/.68);
 for(const c of ring){const dust=ease((a-6.82-c.seed*.025)/1.94),r=c.r+18*(1-enter),[mx,my]=ringPoint(c,r);g.save();g.translate(mx,my);g.rotate(Math.atan2(y-my,x-mx));const size=c.big?1.48:1.08;g.scale(size,size);g.translate(13-THROAT_X,13-14);g.globalAlpha=enter;const tile=blasterSkull(6*charge,c.big,charge*(1-ease((a-5.32)/.76)));if(dust>0)erodeSkull(tile,dust,c.seed,13);else splitSkull(tile,0);crossEye(g,-4,c.big?-5:-4,t,eye);if(a<6.08){const f=ease((a-5.32)/.76);g.translate(-13,-13);drawBlasterCharge(charge,c.big,1-f*f*(3-2*f))}g.restore()}}
function farewellFigure(){const a=farewellAge;if(a<10.1){sevenFigure();return}if(a>=10.96||!visitorSheet)return;
 const f=ease((a-10.1)/.86),beat=Math.floor((a-10.1)*22);g.save();g.imageSmoothingEnabled=false;
 for(let sy=0;sy<88;sy+=4){const n=sy/4,wave=Math.sin(n*2.1+beat*.8),dx=Math.round(wave*(2+26*f)*f);if(f>.28+(n*7%22)/32)continue;const dy=32+sy-Math.round(f*f*sy*.36);g.globalAlpha=.22*(1-f);g.drawImage(visitorSheet,0,sy,100,4,130-dx*2,dy,100,3);g.globalAlpha=1-f*.55;g.drawImage(visitorSheet,0,sy,100,4,130+dx,dy,100,Math.max(1,4-Math.floor(f*4)))}g.restore()}
const farewellGlyph={S:[7,4,7,1,7],E:[7,4,6,4,7],Y:[5,5,2,2,2],O:[7,5,5,5,7],U:[5,5,5,5,7],N:[9,13,11,9,9]};
function farewellCaption(b){const a=farewellAge;if(a<7.2||a>=10.1)return;const words='SEE YOU SOON',n=Math.min(words.length,Math.floor((a-7.2)*17));for(let i=0;i<n;i++){const rows=farewellGlyph[words[i]];if(!rows)continue;const w=words[i]==='N'?4:3,px=157+i*4,py=b.u+5+Math.round(Math.sin(t*8+i*.8));for(let j=0;j<5;j++)for(let k=0;k<w;k++)if(rows[j]&(1<<(w-1-k))){rect(px+k+1,py+j+1,1,1,'#17131c');rect(px+k,py+j,1,1,'#f5efe8')}}}


let endingAge=0;
function sevenTick(dt){if(encounter===8)endingAge+=dt;if(mode==='farewell'){farewellTick(dt);return}if(mode==='departed'){epilogueTick(dt);return}if(mode==='sevenHold'){endingAge+=dt;if(encounter===7&&endingAge>=12){startEight()}return}if(mode==='strike'){const before=1.45-flash;flash-=dt;const age=1.45-flash;if(swings<(encounter===8?5:6)){if(before<.18&&age>=.18)sfx(encounter===8?'glitchDodgeOut':'phaseOut');if(before<1.06&&age>=1.06)sfx(encounter===8?'glitchDodgeIn':'phaseIn')}else if(before<.52&&age>=.52)sfx('impact');if(flash<=0){if(encounter===8){if(swings===5){beginFarewell()}else{round++;eightWave()}}else if(swings===6){endingAge=0;mode='sevenHold';msg('…');ui()}else{round++;sevenWave(round===4)}}return}if(mode!=='dodge')return;
 if(roomShift){const m=roomShift;m.age=Math.min(SHIFT_TIME,m.age+dt);const p=ease(m.age/SHIFT_TIME);x=m.sx+(180-m.sx)*p;y=m.sy+((m.reverse?189.5:160)-m.sy)*p;if(m.age>=SHIFT_TIME)roomShift=null;return}
 const b=sevenBox(),ox=x,oy=y;elapsed+=dt;inv-=dt;
 const held=round===6&&wallSequence(dt,b);if(held&&drag&&target){target=null}if(!held){let dx=+ (keys.has('d')||keys.has('arrowright'))- +(keys.has('a')||keys.has('arrowleft')),dy=+(keys.has('s')||keys.has('arrowdown'))- +(keys.has('w')||keys.has('arrowup'));if(drag&&target){dx=target[0]-x;dy=target[1]-y}const q=Math.hypot(dx,dy)||1,step=drag&&target?Math.min(q,dt*95):dt*95;x=Math.max(b.l+5,Math.min(b.r-5,x+step*dx/q));y=Math.max(b.u+5,Math.min(b.d-5,y+step*dy/q))}if(encounter===8){tickBeams(dt,b);if(mode==='dying')return}if(round<6&&!(encounter===8&&round===5)&&(spawn-=dt)<=0)sevenGate();const moving=Math.hypot(x-ox,y-oy)>.001;
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;const width=s.horiz?s.h:3,height=s.horiz?3:s.h,dist=Math.hypot(Math.max(s.x-x,0,x-s.x-width),Math.max(s.y-y,0,y-s.y-height));if(s.glitch&&dist<31){s.glitch=false;s.changed=t;s.blue=Math.random()<.5;s.red=!s.blue}if(!testGod&&inv<=0&&dist<3&&(!s.blue||moving)&&(!s.red||!moving)){hp=Math.max(0,hp-s.damage);inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];wallPull=null;msg('Your soul begins to crack.')}ui();if(!hp)return}}
 shots=shots.filter(s=>s.x+(s.horiz?s.h:3)>=b.l&&s.x<=b.r&&s.y+(s.horiz?3:s.h)>=b.u&&s.y<=b.d);if(encounter===8?sent===eightScore[round-1].count&&!cannons.length:round===6?slamCount===SLAM_COUNT&&!wallPull:elapsed>6+round*.45){shots=[];wallPull=null;mode='ready';msg('An opening. FIGHT.');ui()}}
function sevenStage(b){
 // The study threshold survives the cut as a low-contrast, cracked arch.
 const y=b.u-4;rect(134,y-73,92,73,'#151417');rect(138,y-70,84,70,'#111013');
 for(const side of [-1,1]){const x=180+side*53;rect(x-3,y-76,7,76,'#211f24');rect(x-2,y-74,1,71,'#302c32');for(let k=0;k<4;k++)rect(x-3,y-k*18-2,7,2,'#161518');rect(x-5,y-2,11,2,'#353038')}
 rect(124,y-78,112,3,'#242127');rect(128,y-75,104,1,'#373039');for(let i=0;i<9;i++)rect(180+(i%4===2?1:0),y-72+i*8,1,8,'#282329');
 rect(163,y-1,34,2,'#252128');rect(169,y-1,22,1,'#302b33')}
function sevenDraw(){const b=sevenBox();sevenStage(b);g.save();g.translate(180,b.u-5);g.translate(-180,-110);if(mode==='strike'&&swings<(encounter===8?5:6))blinkDodge(1.45-flash);else if(mode==='farewell'){farewellFigure();blockShield(1.45+farewellAge)}else if(mode!=='departed')sevenFigure();if(mode==='strike'){if(encounter===8&&swings===5)blockShield(1.45-flash);if(swings===(encounter===8?5:6))g.translate(0,10);slash(1.45-flash,swings<(encounter===8?5:6))}g.restore();rect(b.l-2,b.u-2,b.r-b.l+4,b.d-b.u+4,'#cbbfd2');rect(b.l,b.u,b.r-b.l,b.d-b.u,'#111015');for(const xx of [b.l,b.r-5])for(const yy of [b.u,b.d-1])rect(xx,yy,5,1,'#55495d');g.save();g.beginPath();g.rect(b.l,b.u,b.r-b.l,b.d-b.u);g.clip();gateWarning();if(encounter===8)drawBeams(b);slamEffects(b);for(const s of shots){g.save();g.translate(s.x,s.y);if(s.horiz)g.transform(0,1,1,0,0,0);drawVisitorBone(s);g.restore()}
 const w=wallPull;if(w&&!w.fired)drawSlamAlert(b,w);if(mode==='dying')brokenSoul(b);else if(hp&&(inv<=0||Math.floor(t*12)%2)){if(w&&w.age<=.92){g.save();const flatten=pulse(w.age,.54,.80);g.translate(Math.round(x),Math.round(y));g.scale(1+flatten*(w.nx?-.26:.20),1+flatten*(w.ny?-.26:.20));g.translate(-x,-y);soulRows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='r')rect(x+i-3,y+j-3,1,1,j===0||soulRows[j][i-1]!=='r'||soulRows[j][i+1]!=='r'?'#b99acb':'#09060d')}));g.restore()}else tinySoul(x,y)}g.restore();if(mode==='farewell'){farewellRing();farewellCaption(b)}}

// Effects are timed from the same impact clock as the hand and collision.
function slamEffects(b){const w=wallPull;if(!w)return;const px=w.nx<0?b.l:w.nx>0?b.r-1:w.sx,py=w.ny<0?b.u:w.ny>0?b.d-1:w.sy;
 if(w.age>.22&&w.age<.56){for(let i=1;i<=3;i++){g.save();g.globalAlpha=.28/i;const d=i*3;rect(x-w.nx*d-2,y-w.ny*d-1,4,2,'#a57cbb');g.restore()}}
 const f=(w.age-.56)/.42;if(f<0||f>=1)return;g.save();g.globalAlpha=1-ease(f);for(let i=-3;i<=3;i++){const across=i*(1+f*4),back=(1-Math.abs(i)/5)*f*12;rect(px-w.nx*back-w.ny*across,py-w.ny*back+w.nx*across,2,1,i%2?'#b99bc9':'#87738e')}g.restore()}

const SLAM_REACH=34;
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

// Epilogue time is measured from the first completely black frame, in game time.
let epilogueAge=0,homeAge=0,homeWalk=0,homeMotion=0,homeFacing='down';
// The home is drawn from primitives and cached as an offscreen canvas; no image assets.
let paintedHome=null;
const epilogueLines=[
 [2,'after that you find destroyed the glitching door'],
 [4,'you get out of the hallway'],
 [5,'you go back to your home relaxing'],
 [7,'explore and multiverse to search for the right Sans']
];
function beginEpilogue(){if(typeof document!=='undefined')document.querySelector('#ending-narration').textContent='';mode='departed';epilogueAge=0;keys.clear();drag=false;target=null;msg('');ui()}
function epilogueTick(dt){const old=epilogueAge;epilogueAge+=dt;for(const [at,line] of epilogueLines)if(old<at&&epilogueAge>=at){msg(line);if(typeof document!=='undefined')document.querySelector('#ending-narration').textContent=line;}if(epilogueAge>=10.5)enterHome()}
function enterHome(){mode='home';homeAge=0;homeWalk=0;homeMotion=0;homeFacing='down';x=180;y=186;keys.clear();drag=false;target=null;msg('Home.');ui()}
// Free-move floor: Frisk's feet hitbox slides along the walls and furniture.
const HOME_HITBOX={hw:6,hh:3};
const HOME_AREA={l:9,r:345,t:116,b:219};
// Solids: the sofa under the window, the coffee table and the corner lamp.
const HOME_SOLID=[[122,95,106,49],[134,158,82,18],[332,77,18,66]];
function homeFree(px,py){
 const {hw,hh}=HOME_HITBOX;
 if(px-hw<HOME_AREA.l||px+hw>HOME_AREA.r||py-hh<HOME_AREA.t||py+hh>HOME_AREA.b)return false;
 for(const [ox,oy,ow,oh] of HOME_SOLID)if(px+hw>ox&&px-hw<ox+ow&&py+hh>oy&&py-hh<oy+oh)return false;
 return true;
}
function homeTick(dt){homeAge+=dt;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(drag&&target){dx=target[0]-x;dy=target[1]-y;if(Math.hypot(dx,dy)<3)dx=dy=0}
 const len=Math.hypot(dx,dy);const from=[x,y];if(len){dx/=len;dy/=len;const step=drag&&target?Math.min(len,52*dt):52*dt;
  // Probe each axis in sub-steps so the hitbox slides along solids instead of clipping.
  const probes=Math.max(1,Math.ceil(step));for(let i=0;i<probes;i++){const s=step/probes;if(homeFree(x+dx*s,y))x+=dx*s;if(homeFree(x,y+dy*s))y+=dy*s}
  homeFacing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}
 const moving=Math.hypot(x-from[0],y-from[1])>.001;homeMotion+=(Number(moving)-homeMotion)*Math.min(1,dt*10);if(moving)homeWalk+=dt;}

function drawEpilogue(){rect(0,0,360,224,'#000');if(mode==='home'){g.save();g.globalAlpha=ease(homeAge/1.2);drawHome();g.restore();return}
 g.textAlign='center';g.textBaseline='middle';g.font='6px p, monospace';for(let i=0;i<epilogueLines.length;i++){const [start,line]=epilogueLines[i],age=epilogueAge-start;if(age<0)continue;const fade=ease(age/.28),jitter=age<.48&&Math.floor(age*24)%3===0;g.globalAlpha=fade;if(jitter){g.fillStyle='#713953';g.fillText(line,181+Math.floor(age*19)%3,77+i*19);g.fillStyle='#4d6379';g.fillText(line,178,78+i*19)}g.fillStyle='#eee8e7';g.fillText(line,180,77+i*19);if(jitter){rect(45+(i*57+Math.floor(age*90))%265,75+i*19,8,1,'#b58caf')}}g.globalAlpha=1}
// The furnishings and texture are all drawn by code; no external image assets.
// Dusk-green room: trellis wallpaper, lime hearth left, walnut hutch right.
function buildHome(){
 const layer=document.createElement('canvas');layer.width=1080;layer.height=672;const h=layer.getContext('2d');h.scale(3,3);h.imageSmoothingEnabled=false;
 const R=(x,y,w,z,color)=>{h.fillStyle=color;h.fillRect(x,y,w,z)},P=(points,color)=>{h.fillStyle=color;h.beginPath();points.forEach(([x,y],i)=>i?h.lineTo(x,y):h.moveTo(x,y));h.closePath();h.fill()};
 let seed=90251;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 // Sage plaster with a diamond trellis above a deep green wainscot.
 R(0,0,360,224,'#1e2522');R(3,4,354,112,'#5c6f66');R(6,7,348,84,'#6a7f74');R(7,8,346,82,'#71877a');
 for(let i=0;i<850;i++){const x=7+Math.floor(rnd()*345),y=8+Math.floor(rnd()*81);R(x,y,1+rnd()*2,.45,rnd()>.5?'#7d9285':'#63776c')}
 for(let y=13;y<90;y+=13)for(let x=11+(Math.floor(y/13)%2)*6;x<353;x+=13){R(x,y,1.4,1.4,'#87a093');R(x-1,y+5,3,.8,'#87a093');R(x+1,y-3,.6,1,'#54665d');R(x+5,y+1,.8,3,'#54665d')}
 R(5,91,350,3,'#c9bfa4');R(5,94,350,19,'#33443f');R(5,93,350,1,'#e4dcc6');
 for(let x=9;x<351;x+=34){R(x,96,28,14,'#2b3a36');R(x+1,97,26,12,'#3c504a');R(x+2,98,24,1,'#4d635c');R(x+3,107,22,.5,'#25322f')}
 R(4,112,352,4,'#26332f');R(4,115,352,1,'#a99e85');
 // Dark walnut floor with offset joints, long grain and scuffs.
 R(0,116,360,108,'#4d362c');for(let y=117,row=0;y<224;y+=11,row++){
 R(0,y,360,1,'#33231c');R(0,y+1,360,.5,'#64493a');for(let x=(row%2?-18:4);x<360;x+=51){R(x,y,1,11,'#3c2a22');R(x+1,y+2,36,.5,'#5b4133');R(x+8,y+7,21,.5,'#452f26');R(x+30,y+5,13,.5,'#664a39')}}
 for(let i=0;i<850;i++){const xx=Math.floor(rnd()*360),yy=117+Math.floor(rnd()*107);R(xx,yy,1+rnd()*5,.35,rnd()>.5?'#5d4436':'#3a2a21')}
 // Ceiling lintel and shadow.
 R(0,0,360,7,'#241c19');R(0,7,360,2,'#463530');R(0,9,360,1,'#7a6353');
 // Moonlit window: cream frame, pine ridge, cross muntins and a deep sill.
 R(121,14,118,80,'#3a3129');R(125,18,110,72,'#e8dcc3');
 R(129,22,102,64,'#1d2b48');R(131,24,98,26,'#22314f');R(131,50,98,34,'#1a2740');
 R(134,30,20,.6,'#33456b');R(196,34,24,.6,'#33456b');
 for(const [sx,sy] of [[141,28],[155,36],[207,29],[221,35],[228,26],[137,40]])R(sx,sy,.7,.7,'#efe8cd');
 R(205,26,8,8,'#efe8cd');R(207,25,6,6,'#f8f3dd');
 P([[131,64],[146,52],[158,62],[172,49],[187,62],[202,51],[216,62],[229,50],[229,84],[131,84]],'#24352c');
 for(let i=0;i<15;i++){const px=130+i*7,tip=44+(i*7%16),shade=i%2?'#17251f':'#1f3129';P([[px-4,83],[px+3,tip],[px+9,83]],shade);P([[px-4,76],[px+3,tip+6],[px+10,76]],shade);R(px+3,tip+6,1,Math.max(0,83-tip-6),'#152119')}
 R(131,82,98,2,'#141f1a');R(178,22,4,64,'#f1e7cf');R(130,53,100,3,'#f1e7cf');R(127,86,106,4,'#efe4c9');R(125,90,110,3,'#3a2f28');
 // Teal drapes with pleats, rope ties and tassels.
 R(119,13,122,3,'#241d1a');R(123,14,114,1,'#8d7f5f');
 P([[124,17],[138,17],[137,64],[133,80],[122,88]],'#2e4a46');P([[236,17],[222,17],[223,64],[227,80],[238,88]],'#2e4a46');
 for(let xx=125;xx<=136;xx+=3){R(xx,18,1,46,xx%2?'#3f615b':'#25403c');R(360-xx,18,1,46,xx%2?'#3f615b':'#25403c')}
 R(124,64,12,3,'#b9a67e');R(224,64,12,3,'#b9a67e');P([[126,66],[133,66],[131,75],[128,75]],'#b9a67e');P([[226,66],[233,66],[231,75],[228,75]],'#b9a67e');
 // Limestone hearth on the left with grate, mantel and hearth slab.
 R(14,54,100,63,'#615e58');
 for(let yy=58,row=0;yy<112;yy+=8,row++)for(let xx=16-(row%2)*5;xx<112;xx+=11){R(xx,yy,10,7,(row+Math.floor(xx/11))%3?'#8b877f':'#9c988f');R(xx+1,yy+1,7,.5,'#aca79d');R(xx+1,yy+5,5,.5,'#6e6a63')}
 R(28,74,72,38,'#413e39');R(31,77,66,35,'#17151a');R(34,86,60,26,'#241f24');
 R(44,104,44,2,'#17151a');for(let xx=48;xx<86;xx+=7)R(xx,96,2,10,'#3a3630');R(46,105,40,1,'#4a463f');
 R(12,50,104,5,'#55463c');R(15,51,98,2,'#7a6353');
 R(10,113,108,4,'#4c463f');R(13,113,102,1,'#9a948a');
 // Moonlit print, mint clock and mantel trinkets.
 R(22,16,64,32,'#3a2f28');R(24,18,60,28,'#c9b48c');R(27,21,54,22,'#22314f');
 P([[27,38],[36,30],[43,35],[52,27],[61,36],[68,30],[81,38],[81,43],[27,43]],'#24352c');
 R(70,24,6,6,'#efe8cd');R(72,23,4,4,'#f8f3dd');
 R(94,18,24,28,'#3a2f28');R(96,20,20,24,'#e8dcc3');R(105,24,1,9,'#4a3128');R(105,32,6,1,'#4a3128');R(104,31,3,3,'#7a5a3e');
 R(56,44,7,6,'#4a3128');R(58,38,2,6,'#c9b48c');R(57,36,4,2,'#efe4c9');R(58,34,2,2,'#ffe9b3');
 R(76,47,16,3,'#7c4b52');R(77,45,15,2,'#4f6b63');R(78,43,13,2,'#8a6f3f');
 // Walnut hutch of little books on the right wall.
 R(246,19,80,94,'#3a2a22');R(249,21,74,90,'#4a3128');R(252,24,68,84,'#35241e');
 for(let j=0;j<3;j++){const sy=47+j*24;R(251,sy,70,4,'#5d4133');R(251,sy,70,1,'#8a6a4e');let bx=254;while(bx<318){const bw=2+Math.floor(rnd()*4),bh=9+Math.floor(rnd()*12),cols=['#7c4b52','#4f6b63','#8a6f3f','#57617e','#6b4f6e','#8f7f63','#46606b'];R(bx,sy-bh,bw,bh,cols[Math.floor(rnd()*cols.length)]);R(bx,sy-bh,bw,.7,'#c9b48c');if(bw>3)R(bx+1,sy-bh+3,.5,bh-5,'#2f211b');if(bh>13){R(bx+1,sy-bh+3,bw,.5,'#b7a077');R(bx+1,sy-4,bw,.5,'#b7a077')}bx+=bw+1}}
 R(251,96,70,4,'#5d4133');R(253,100,66,10,'#4a3128');R(255,102,62,6,'#3a2a22');R(257,104,58,1,'#5d4133');R(251,111,70,2,'#3a2a22');
 R(247,20,3,92,'#4a3128');R(248,21,1,89,'#7a5a3e');R(322,20,3,92,'#4a3128');R(323,21,1,89,'#7a5a3e');
 // Ochre sofa tucked under the window.
 P([[124,110],[127,97],[134,94],[214,94],[221,97],[225,112],[225,143],[124,143]],'#7a5a2a');
 R(129,96,90,22,'#b98a45');R(131,97,42,20,'#c99a52');R(177,97,42,20,'#c99a52');
 R(132,98,40,1,'#e0b877');R(178,98,40,1,'#e0b877');R(174,96,2,22,'#8a6531');
 R(126,117,97,17,'#b98a45');R(129,118,91,2,'#dcb271');R(129,130,91,1,'#8a6531');
 P([[124,112],[128,105],[134,107],[135,138],[125,140]],'#a57a3b');P([[225,112],[221,105],[215,107],[214,138],[224,140]],'#a57a3b');
 R(126,111,2,25,'#d8ab64');R(223,111,2,25,'#d8ab64');
 P([[142,103],[154,101],[157,113],[144,115]],'#d8b877');P([[194,103],[206,101],[208,113],[196,115]],'#d8b877');
 R(145,104,9,1,'#eed7a4');R(197,104,9,1,'#eed7a4');
 R(128,141,5,3,'#3a2a1c');R(216,141,5,3,'#3a2a1c');
 // Indigo rug with a cream border, fringe and medallions.
 R(104,148,140,62,'#31405e');R(107,151,134,56,'#3a4b6e');R(111,155,126,48,'#2c3a56');
 R(113,157,122,1,'#cfc8b0');R(113,200,122,1,'#cfc8b0');R(113,157,1,44,'#cfc8b0');R(234,157,1,44,'#cfc8b0');
 for(let xx=117;xx<232;xx+=10){R(xx,159,4,1,'#a4657a');R(xx,198,4,1,'#a4657a')}
 for(let yy=163;yy<196;yy+=8){R(115,yy,1,4,'#a4657a');R(232,yy,1,4,'#a4657a')}
 for(const [cx,cy] of [[130,166],[218,166],[130,190],[218,190]]){P([[cx,cy-4],[cx+4,cy],[cx,cy+4],[cx-4,cy]],'#cfc8b0');P([[cx,cy-2],[cx+2,cy],[cx,cy+2],[cx-2,cy]],'#57617e')}
 for(let i=0;i<27;i++){R(106+i*5.3,146,1,2,'#cfc8b0');R(106+i*5.3,210,1,2,'#cfc8b0')}
 // Walnut coffee table with a book and a banded mug.
 R(136,158,78,8,'#5d4133');R(138,159,74,2,'#74553f');R(140,163,70,.6,'#83614a');
 for(let i=0;i<16;i++)R(140+rnd()*68,160+rnd()*5,2+rnd()*6,.35,'#4a3128');
 R(136,166,78,3,'#4a3128');R(139,169,5,7,'#4a3128');R(206,169,5,7,'#4a3128');
 R(139,175,5,1,'#33231c');R(206,175,5,1,'#33231c');
 R(156,159,16,4,'#e8dcc3');R(172,159,16,4,'#cfc4a6');R(171,159,1,4,'#5d4133');
 R(158,160,11,.5,'#a89b7c');R(174,160,11,.5,'#988c70');
 R(190,158,9,6,'#efe8d6');R(190,160,9,2,'#2e4a46');R(199,159,2,3,'#efe8d6');R(190,158,9,1,'#cfc8b0');
 // Brass floor lamp in the right corner.
 P([[334,78],[345,78],[349,96],[330,96]],'#e8dcc3');R(334,79,11,1,'#efe4c9');
 R(331,96,19,2,'#c9b48c');R(338,98,3,42,'#8a6a2e');R(339,100,1,38,'#d8b877');
 R(335,140,10,3,'#8a6a2e');R(334,142,13,2,'#6e5324');
 // Potted plants at the wall base.
 const plant=(x,y)=>{R(x-6,y,12,9,'#4f7268');R(x-7,y,14,2,'#639084');R(x-1,y-20,1,20,'#3f5c40');for(let k=0;k<7;k++){const py=y-4-k*2,side=k%2?1:-1;P([[x,py],[x+side*(3+k%3),py-5],[x+side*(6+k%3),py-4],[x+side*3,py-1]],k%2?'#6f9a66':'#4e7a4c');R(x+side*3,py-3,1,1,'#87b07a')}};plant(7,108);plant(236,108);
 // Warm light from the hearth and the lamp.
 let fireGlow=h.createRadialGradient(64,102,2,64,102,92);fireGlow.addColorStop(0,'rgba(255,166,84,.14)');fireGlow.addColorStop(1,'rgba(255,166,84,0)');h.fillStyle=fireGlow;h.fillRect(0,14,156,152);
 let lampGlow=h.createRadialGradient(340,88,0,340,88,58);lampGlow.addColorStop(0,'rgba(255,224,150,.13)');lampGlow.addColorStop(1,'rgba(255,224,150,0)');h.fillStyle=lampGlow;h.fillRect(284,30,112,124);
 return layer;
}
function drawHome(){if(!paintedHome)paintedHome=buildHome();g.drawImage(paintedHome,0,0,360,224);
 // A restrained procedural flame, with an independently timed ember.
 const flicker=Math.sin(homeAge*7)>0?1:0;
 poly([[52,107],[53,99],[57,102],[59,92-flicker],[63,101],[67,96],[70,104],[73,101],[76,107]],'#bd592f');
 poly([[56,107],[58,101],[61,103],[63,96+flicker],[67,104],[70,101],[72,107]],'#f3a14f');
 poly([[61,107],[62,103],[64,105],[66,100+flicker],[69,107]],'#ffe2a0');
 rect(44,110,44,2,'#302322');drawFrisk()}
// Frisk is a hand-pixeled 24x42 atlas: swept fringe, striped sweater, denim
// and boots, drawn 1:1 so every pixel stays square.
const friskPixelPalette={k:'#241d24',h:'#4a3026',H:'#6b4633',l:'#8f6146',s:'#f0c097',S:'#cf9b76',E:'#2f2426',b:'#476c91',B:'#6b8fab',d:'#304864',p:'#ad638c',P:'#d18ca6',n:'#2c2d3c',N:'#45465c',o:'#39282a',t:'#8a5a41',v:'#3d5b79',m:'#a56b60'};
const friskSideHead=[
'......kkkkkkkkk......',
'....kkHHHHHHHHHkk....',
'...kHHHllHHHHHHHk....',
'..kHHHllHHHHHHHHHk...',
'..kHHHHHHHHHHHHHHk...',
'..kHhHHHHHHHHHHHHk...',
'..khssssssHHHHHHHk...',
'..khssssssssHHHHHk...',
'..khsssEEssssHHHHk...',
'..khssssssssHHHHHk...',
'.khssssssssssHHHHk...',
'.khssssssssssSHHHk...',
'..kssmmssssssHHHHk...',
'..kssssssssSSHHHHk...',
'..ksssssssSSSHHHHk...',
'...ksssssssSSHHHHk...',
'....kssssssSHHHHk....',
'.....kkkssskkkkk.....'
];
const friskSideTorso=[
'...kkkkkkkkkkkk...',
'..kbbBBBBBBBBddk..',
'.kbbbBBBBBBBBdddk.',
'.kbbBBBBBBBBBBddk.',
'.kbppPPPPPPPPppdk.',
'.kbPPppppppppPPdk.',
'.kbbBBBBBBBBBBddk.',
'.kbbbBBBBbBBBdddk.',
'.kbbBBBBBBBBBBddk.',
'.kbppPPPPPPPPppdk.',
'.kbPPppppppppPPdk.',
'.kbbBBBBBBBBBBddk.',
'..kbbbBBBBBBdddk..',
'...kddddddddddk...',
'...kkkkkkkkkkkk...'
];
const friskSideSleeve=[
'.kkk.',
'kbbbk',
'kpppk',
'kPPpk',
'kbbdk',
'kbbdk',
'kpppk',
'kPPpk',
'kdddk',
'.kSs.',
'..kk.'
];
const friskSidePants=[
'.kkkkkkkkkk.',
'knnnNnnnnnk.',
'knnnNnnnnnk.',
'knnnnnnnnnk.',
'.knnnkknnk..',
'.kkkk..kkk..'
];
const friskSideLeg=['.kkk.','knnnk','knNnk','knnnk','.knnk','.knk.'];
const friskSideBoot=['..kkkk.','.ktoook','kttoook','koooook','.kkkkk.'];
let friskSideFrames=null;
function friskPixels(ctx,rows,x,y){for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++){const c=friskPixelPalette[rows[j][i]];if(c){ctx.fillStyle=c;ctx.fillRect(x+i,y+j,1,1)}}}
function buildFriskSideFrames(){
 // Frames progress through contact, recoil, passing and extension for each
 // leg. Shoulder pixels always overlap the body and feet meet the legs.
 // Keep the head anchored; one-pixel bobbing made the earlier walk jitter.
 const shifts=[0,1,2,1,0,-1,-2,-1],lift=[0,0,1,1,0,0,1,1];
 return Array.from({length:9},(_,i)=>{const tile=document.createElement('canvas');tile.width=24;tile.height=42;const ctx=tile.getContext('2d');const walking=i<8,dx=walking?shifts[i]:0,rise=walking?lift[i]:0,bob=0;
  friskPixels(ctx,friskSideLeg,12-dx,31-bob);friskPixels(ctx,friskSideBoot,11-dx,36-(walking&&dx>0?rise:0));
  friskPixels(ctx,friskSidePants,7,27-bob);
  friskPixels(ctx,friskSideLeg,7+dx,31-bob);friskPixels(ctx,friskSideBoot,6+dx,36-(walking&&dx<0?rise:0));
  friskPixels(ctx,friskSideSleeve,15+Math.round(dx/2),20-bob);
  friskPixels(ctx,friskSideTorso,4,16-bob);
  friskPixels(ctx,friskSideSleeve,11-Math.round(dx/2),19-bob);
  friskPixels(ctx,friskSideHead,1,1-bob);
  return tile;
 });
}
function drawFriskSide(){if(!friskSideFrames)friskSideFrames=buildFriskSideFrames();const frame=homeMotion>.16?Math.floor(homeWalk*10)%8:8;if(homeFacing==='right')g.scale(-1,1);g.drawImage(friskSideFrames[frame],-12,-42,24,42);}

// Front/back share the sweater grid, shifted a pixel for the frontal
// silhouette, with their own heads so Frisk keeps one size when turning.
const friskFrontHead=[
'.......kkkkkkkk.......',
'.....kkHHHHHHHHkk.....',
'....kHHHHllllHHHHk....',
'...kHHHHHHHHHHHHHHk...',
'..kHHHHHHHHHHHHHHHHk..',
'..kHHhhhhhhhhhhhhHHk..',
'..kHHhssssssssssHHHk..',
'..kHHssssssssssssHHk..',
'..kHssEEssssssEEssHk..',
'..kHssssssssssssssHk..',
'..kHsssssSssSsssssHk..',
'..kHssssssssssssssHk..',
'..kHssssssmmssssssHk..',
'...kssssssssssssssk...',
'...kssssssSsssssssk...',
'....kssssssssssssk....',
'....kssssssSSssssk....',
'......kkkssssskkk.....'
];
const friskBackHead=[
'.......kkkkkkkk.......',
'.....kkHHHHHHHHkk.....',
'....kHHHHllllHHHHk....',
'...kHHHHHHHHHHHHHHk...',
'..kHHHHHHHHHHHHHHHHk..',
'..kHHllHHHHHHHHllHHk..',
'..kHHHlHHHHHHHHlHHHk..',
'..kHHllHHHHHHHHllHHk..',
'..khhhHHHHHHHHHHhhhk..',
'..khhHHHHHHHHHHHHhhk..',
'..khHHHHHHHHHHHHHHhk..',
'..kHHHHHHHHHHHHHHHHk..',
'..kHHHHHHHHHHHHHHHHk..',
'...kHHHHHHHHHHHHHHk...',
'...khHHHHHHHHHHHHhk...',
'....kHHHHHHHHHHHHk....',
'....kHHHHHHHHHHHHk....',
'......kkHHHHHHkk......'
];
const friskFrontBoot=['.kkkk.','ktootk','kooook','kooook','.kkkk.'];
let friskFrontFrames=null,friskBackFrames=null;
function buildFriskFrontFrames(back){const stride=[0,1,2,1,0,-1,-2,-1],lift=[0,0,1,1,0,0,1,1];
 return Array.from({length:9},(_,i)=>{const tile=document.createElement('canvas');tile.width=24;tile.height=42;const ctx=tile.getContext('2d');const walking=i<8,dx=walking?stride[i]:0,rise=walking?lift[i]:0;
  friskPixels(ctx,friskSidePants,6,27);
  friskPixels(ctx,friskSideLeg,5,31);friskPixels(ctx,friskFrontBoot,5,36-(dx>0?rise:0));
  friskPixels(ctx,friskSideLeg,13,31);friskPixels(ctx,friskFrontBoot,13,36-(dx<0?rise:0));
  friskPixels(ctx,friskSideTorso,3,16);
  friskPixels(ctx,friskSideSleeve,2,19+Math.round(dx/2));friskPixels(ctx,friskSideSleeve,17,19-Math.round(dx/2));
  friskPixels(ctx,back?friskBackHead:friskFrontHead,1,1);
  return tile;
 });
}
function drawFriskFacing(){const back=homeFacing==='up';if(back&&!friskBackFrames)friskBackFrames=buildFriskFrontFrames(true);if(!back&&!friskFrontFrames)friskFrontFrames=buildFriskFrontFrames(false);const frames=back?friskBackFrames:friskFrontFrames,frame=homeMotion>.16?Math.floor(homeWalk*10)%8:8;g.drawImage(frames[frame],-12,-42,24,42)}

function drawFrisk(){
 // A stable floor shadow is shared by the four pixel-art directions.
 g.save();g.translate(Math.round(x),Math.round(y));g.save();g.globalAlpha=.28;rect(-11,0,22,2,'#181117');rect(-7,2,14,1,'#181117');g.restore();
 if(homeFacing==='left'||homeFacing==='right')drawFriskSide();else drawFriskFacing();
 g.restore();
}
