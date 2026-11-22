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
 if(!frames[split]){const f=document.createElement('canvas');f.width=40;f.height=42;const ctx=f.getContext('2d');for(let i=0;i<tile.width;i++){const cut=guardCut(i);ctx.drawImage(tile,i,0,1,cut,i+5-split,5-split,1,cut);ctx.drawImage(tile,i,cut,1,32-cut,i+5+split,5+cut+split,1,32-cut);if(i>=7&&i<=18&&i%3!==0){ctx.fillStyle=i%2?'#cebfcb':'#918295';ctx.fillRect(i+5+split,5+cut+split,1,1)}}frames[split]=f}g.drawImage(frames[split],-18,-18)}
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
function homeTick(dt){homeAge+=dt;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(drag&&target){dx=target[0]-x;dy=target[1]-y;if(Math.hypot(dx,dy)<3)dx=dy=0}
 const len=Math.hypot(dx,dy);const from=[x,y];if(len){dx/=len;dy/=len;const step=drag&&target?Math.min(len,52*dt):52*dt;x=Math.max(15,Math.min(345,x+dx*step));y=Math.max(169,Math.min(216,y+dy*step));homeFacing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}
 const moving=Math.hypot(x-from[0],y-from[1])>.001;homeMotion+=(Number(moving)-homeMotion)*Math.min(1,dt*10);if(moving)homeWalk+=dt;}

function drawEpilogue(){rect(0,0,360,224,'#000');if(mode==='home'){g.save();g.globalAlpha=ease(homeAge/1.2);drawHome();g.restore();return}
 g.textAlign='center';g.textBaseline='middle';g.font='6px p, monospace';for(let i=0;i<epilogueLines.length;i++){const [start,line]=epilogueLines[i],age=epilogueAge-start;if(age<0)continue;const fade=ease(age/.28),jitter=age<.48&&Math.floor(age*24)%3===0;g.globalAlpha=fade;if(jitter){g.fillStyle='#713953';g.fillText(line,181+Math.floor(age*19)%3,77+i*19);g.fillStyle='#4d6379';g.fillText(line,178,78+i*19)}g.fillStyle='#eee8e7';g.fillText(line,180,77+i*19);if(jitter){rect(45+(i*57+Math.floor(age*90))%265,75+i*19,8,1,'#b58caf')}}g.globalAlpha=1}
// The furnishings and texture are all drawn by code; no external image assets.
function buildHome(){
 const layer=document.createElement('canvas');layer.width=1080;layer.height=672;const h=layer.getContext('2d');h.scale(3,3);h.imageSmoothingEnabled=false;
 const R=(x,y,w,z,color)=>{h.fillStyle=color;h.fillRect(x,y,w,z)},P=(points,color)=>{h.fillStyle=color;h.beginPath();points.forEach(([x,y],i)=>i?h.lineTo(x,y):h.moveTo(x,y));h.closePath();h.fill()};
 let seed=483971;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 // Walls, handmade plaster, faded floral paper and timber wainscoting.
 R(0,0,360,224,'#241b1c');R(3,4,354,111,'#58413a');R(6,7,348,92,'#9b7566');R(7,8,346,86,'#ad8875');
 for(let i=0;i<850;i++){const x=7+Math.floor(rnd()*345),y=8+Math.floor(rnd()*85);R(x,y,1+rnd()*2,.45,rnd()>.5?'#b8927e':'#a17a6a')}
 for(let y=13;y<89;y+=14)for(let x=12+(Math.floor(y/14)%2)*7;x<352;x+=14){R(x,y,1,3,'#ba9783');R(x-1,y+1,3,1,'#ba9783');R(x+1,y-2,.5,1,'#997766')}
 R(5,91,350,3,'#53382f');R(5,94,350,20,'#805549');R(5,93,350,1,'#d4a17c');
 for(let x=9;x<351;x+=32){R(x,96,27,15,'#593a31');R(x+1,97,25,13,'#a16f59');R(x+2,98,23,11,'#95634f');R(x+3,99,21,.5,'#c18b6b')}
 R(4,112,352,4,'#4a302b');R(4,115,352,1,'#d6a177');
 // Timber floor with offset joints, fine grain and warm wear.
 R(0,116,360,108,'#906047');for(let y=117,row=0;y<224;y+=11,row++){
 R(0,y,360,1,'#56382e');R(0,y+1,360,.5,'#c08a64');for(let x=(row%2?-18:4);x<360;x+=51){R(x,y,1,11,'#684532');R(x+1,y+2,36,.5,'#a87657');R(x+8,y+7,21,.5,'#77503e');R(x+30,y+5,13,.5,'#b58261')}}
 for(let i=0;i<850;i++){const xx=Math.floor(rnd()*360),yy=117+Math.floor(rnd()*107);R(xx,yy,1+rnd()*5,.35,rnd()>.5?'#a57555':'#79503e')}
 // Ceiling lintel and shadow.
 R(0,0,360,7,'#3c2926');R(0,7,360,2,'#6a4739');R(0,9,360,1,'#d0a07d');
 // Window: layered frame, distant forest, individual trees and sky.
 R(121,15,118,78,'#3c2b29');R(125,19,110,70,'#c9a17b');R(129,23,102,61,'#465a6d');
 R(131,25,98,24,'#667c8b');R(131,49,98,34,'#6f8782');
 for(let i=0;i<15;i++){const px=130+i*7,tip=52+(i*7%15);P([[px-4,82],[px+3,tip],[px+9,82]],i%2?'#516d68':'#5b766d');R(px+3,tip+6,1,Math.max(0,82-tip-6),'#526a62')}
 R(131,81,98,2,'#485f55');R(178,23,4,61,'#d6b08a');R(130,49,100,3,'#d6b08a');R(128,84,104,4,'#e1bc91');R(126,88,108,3,'#5a3a30');
 // Drapes with pleats, ties and hem.
 R(119,14,122,3,'#3e2926');R(123,15,114,1,'#b58262');P([[124,18],[137,18],[136,64],[132,80],[122,87]],'#743d40');P([[236,18],[223,18],[224,64],[228,80],[238,87]],'#743d40');
 for(let xx=125;xx<=135;xx+=3){R(xx,19,1,43,xx%2?'#a7605b':'#8c4a4b');R(360-xx,19,1,43,xx%2?'#a7605b':'#8c4a4b')};R(124,65,11,3,'#d2a174');R(225,65,11,3,'#d2a174');
 // Lamp and hearth light softly tint the plaster without obscuring the texture.
 let lamp=h.createRadialGradient(334,86,0,334,86,67);lamp.addColorStop(0,'rgba(255,211,141,.12)');lamp.addColorStop(1,'rgba(255,194,125,0)');h.fillStyle=lamp;h.fillRect(268,20,92,125);
 // Built-in shelves, fine edged wood, dozens of unique little books.
 R(12,19,80,94,'#3b2a27');R(15,21,74,90,'#6b4534');R(18,24,68,83,'#412e2a');
 for(let j=0;j<3;j++){const sy=49+j*24;R(17,sy,70,4,'#8c5b40');R(17,sy,70,1,'#d09b70');let bx=20;while(bx<82){const bw=2+Math.floor(rnd()*4),bh=9+Math.floor(rnd()*12),cols=['#b26252','#858d70','#c6a474','#637f81','#77718a','#b08362','#c3b79d'];R(bx,sy-bh,bw,bh,cols[Math.floor(rnd()*cols.length)]);R(bx,sy-bh,bw,.7,'#e2c096');if(bw>3)R(bx+1,sy-bh+3,.5,bh-5,'#5e5145');bx+=bw+1}}
 R(15,108,74,4,'#b47b55');R(17,111,70,2,'#4b3029');
 // Framed landscape and an old round wall clock, both offset from the fireplace.
 R(250,18,42,32,'#382823');R(252,20,38,28,'#ab805e');R(255,23,32,22,'#d8b187');R(257,25,28,18,'#779097');P([[257,42],[264,34],[269,39],[277,31],[285,40],[285,43]],'#677961');R(280,27,2,2,'#f2d79e');
 R(304,18,26,29,'#49332a');R(306,20,22,25,'#a57855');R(309,23,16,19,'#ead0a6');R(316,25,1,8,'#65483c');R(316,32,5,1,'#65483c');R(311,24,2,1,'#886e54');R(323,40,1,1,'#886e54');
 // Fireplace: irregular masonry blocks, soot, iron grate and mantel ornaments.
 R(249,63,88,51,'#49322d');R(251,65,84,47,'#9d7961');
 for(let yy=67,row=0;yy<112;yy+=8,row++)for(let xx=252-(row%2)*5;xx<334;xx+=10){R(xx,yy,9,7,(row+Math.floor(xx/10))%3?'#9c7964':'#b08b70');R(xx+1,yy+1,6,.5,'#c3a184');R(xx+1,yy+5,4,.5,'#816352')}
 R(264,77,58,37,'#59443a');R(268,79,50,35,'#211a1b');R(271,83,44,28,'#2d1c1a');
 R(250,60,87,6,'#3c2925');R(253,61,81,2,'#bd8a62');R(246,113,94,4,'#553930');R(249,113,88,1,'#d0a27d');
 R(270,108,46,2,'#1b1818');for(let xx=274;xx<315;xx+=7)R(xx,100,1,10,'#332b29');R(272,105,42,1,'#302624');
 R(258,50,11,10,'#4c342e');R(260,51,7,8,'#cba782');R(261,53,5,5,'#7b8d7e');R(320,52,9,8,'#b48664');R(323,48,4,4,'#788c77');
 // Sofa: back cushions, curved arms, seam, worn highlights and cushions.
 P([[24,110],[27,97],[34,94],[100,94],[108,98],[112,113],[111,141],[24,141]],'#4a302b');
 R(29,98,75,25,'#a86553');R(31,99,34,22,'#b67865');R(67,99,34,22,'#b47361');R(32,100,32,1,'#d99b80');R(68,100,32,1,'#d99b80');
 R(28,120,79,18,'#a95f50');R(32,121,70,2,'#d78f72');R(32,132,70,1,'#874d42');R(31,138,8,6,'#4d3029');R(99,138,8,6,'#4d3029');
 P([[24,112],[28,107],[34,109],[35,137],[25,138]],'#79483c');P([[112,112],[108,107],[102,109],[101,137],[111,138]],'#79483c');R(26,111,2,21,'#c18268');R(108,111,2,21,'#c18268');
 P([[38,104],[52,102],[56,115],[40,118]],'#d2a582');P([[84,104],[96,102],[100,115],[86,118]],'#d7b28d');R(41,105,10,1,'#ebc8a4');R(87,105,9,1,'#f0cba1');
 // Woven rug: a softened perspective, border, fringe and a dense geometric weave.
 P([[108,151],[249,151],[262,211],[95,211]],'#4d3431');P([[111,154],[246,154],[257,207],[100,207]],'#b78870');P([[116,158],[241,158],[252,203],[105,203]],'#74484c');P([[119,160],[238,160],[248,201],[109,201]],'#a66a65');
 for(let xx=115;xx<250;xx+=6){R(xx,158,2,.7,'#e2bb97');R(xx-4,202,2,.7,'#e2bb97')}for(let yy=164;yy<198;yy+=7){R(113,yy,132,.6,'#c9967b');for(let xx=121;xx<239;xx+=12){R(xx,yy+2,3,1,'#e0b69a');R(xx+1,yy+1,1,3,'#d7aa8e')}}
 // Coffee table with hand-worn grain, a book and a warm ceramic cup.
 R(133,135,93,4,'#422b27');R(138,139,5,16,'#4d3027');R(216,139,5,16,'#4d3027');R(136,128,87,8,'#81513b');R(138,129,83,2,'#bf8762');R(141,133,70,.6,'#c6966e');
 for(let i=0;i<18;i++)R(141+rnd()*76,130+rnd()*5,2+rnd()*7,.35,'#63402f');
 R(162,125,15,4,'#e2caa2');R(178,125,15,4,'#cfb48d');R(177,125,1,4,'#6a5040');R(164,126,10,.5,'#a59273');R(181,126,9,.5,'#a59273');R(204,123,7,5,'#e7d1ac');R(211,124,2,2,'#e7d1ac');R(205,123,5,1,'#7c5544');
 // House plants, delicate leaves, ceramic pots and brass lamp.
 const plant=(x,y)=>{R(x-5,y,10,8,'#a9674e');R(x-6,y,12,2,'#d0966e');R(x-1,y-19,1,19,'#476342');for(let k=0;k<7;k++){const py=y-4-k*2,side=k%2?1:-1;P([[x,py],[x+side*(3+k%3),py-5],[x+side*(6+k%3),py-4],[x+side*3,py-1]],k%2?'#70916b':'#527851');R(x+side*3,py-3,1,1,'#8aa97d')}};plant(20,108);plant(340,110);
 R(334,91,2,50,'#4f382e');R(331,139,13,2,'#574033');R(335,93,1,45,'#d1a66f');P([[327,92],[331,77],[339,77],[344,92]],'#d1a776');P([[330,90],[333,79],[338,79],[341,90]],'#f0cf9c');R(329,91,13,2,'#f6dbad');
 // Warm light over the room, subtle so the texture stays readable.
 const glow=h.createRadialGradient(48,113,2,48,113,95);glow.addColorStop(0,'rgba(255,175,85,.12)');glow.addColorStop(1,'rgba(255,175,85,0)');h.fillStyle=glow;h.fillRect(0,34,145,130);
 return layer;
}
function drawHome(){if(!paintedHome)paintedHome=buildHome();g.drawImage(paintedHome,0,0,360,224);
 // A restrained procedural flame, with an independently timed ember.
 const flicker=Math.sin(homeAge*7)>0?1:0;
 poly([[276,107],[277,99],[281,102],[283,92-flicker],[288,101],[291,96],[294,104],[298,101],[301,108]],'#bd592f');
 poly([[280,107],[282,101],[285,103],[287,96+flicker],[291,104],[294,101],[296,108]],'#f3a14f');
 poly([[285,108],[286,103],[288,105],[290,100+flicker],[293,108]],'#ffe2a0');
 rect(273,110,41,2,'#302322');drawFrisk()}
function drawFrisk(){
 // Four-direction pixel actor: a planted shadow, opposite arm/leg swing, a
 // gentle walking bounce, and an idle breath; the face is never swapped.
 const stride=Math.sin(homeWalk*9)*homeMotion,step=Math.round(stride*2),bob=Math.round(Math.abs(Math.sin(homeWalk*9))*homeMotion),breath=homeMotion<.15&&Math.sin(homeAge*2.1)>.75?1:0;
 g.save();g.translate(Math.round(x),Math.round(y));
 g.save();g.globalAlpha=.28;rect(-10,0,20,2,'#181117');rect(-7,2,14,1,'#181117');g.restore();
 if(homeFacing==='left'||homeFacing==='right'){
  if(homeFacing==='right')g.scale(-1,1);
  // Far arm and leg precede the body so the walk stays articulated.
  rect(1,-17+step,5,10,'#292d46');rect(2,-10+step,4,3,'#b97e65');
  rect(0,-7-step,5,6,'#292639');rect(-1,-3-step,7,3,'#29232b');rect(0,-3-step,4,1,'#6a493e');
  rect(-5,-7+step,5,6,'#342c40');rect(-7,-3+step,7,3,'#31252a');rect(-6,-3+step,4,1,'#795344');
  g.translate(0,-bob);
  rect(-7,-21,13,15,'#292a42');rect(-6,-20,11,13,'#405d83');rect(-5,-19,9,2,'#6184a3');rect(-6,-16,11,3,'#aa6089');rect(-6,-11,11,3,'#a25c86');rect(3,-19,2,11,'#344763');rect(-5,-7,9,1,'#7084a0');
  rect(-8,-20-step,4,10,'#344968');rect(-8,-18-step,3,2,'#ac688f');rect(-8,-11-step,4,3,'#d9a17d');rect(-7,-11-step,2,1,'#f0c39a');
  // Hair wraps behind the face; the small nose points left.
  rect(-7,-33,13,14,'#302528');rect(-6,-34,10,2,'#35282a');rect(-7,-31,12,12,'#57382e');rect(-5,-28,8,8,'#e5b18a');rect(-7,-27,2,4,'#e5b18a');rect(-5,-23,8,2,'#c99175');rect(-5,-25,2,1,'#50352f');rect(-7,-30,9,3,'#604031');rect(-4,-32,7,2,'#79503a');rect(1,-29,4,10,'#483028');rect(3,-25,2,6,'#392a28');rect(2,-28,1,5,'#8e5c42');
 }else{
  const back=homeFacing==='up';
  // Draw both feet separately to make the planted and passing poses readable.
  rect(-6,-8-step,5,7,'#302b3b');rect(1,-8+step,5,7,'#302b3b');rect(-7,-3-step,6,3,'#302329');rect(1,-3+step,6,3,'#302329');rect(-6,-3-step,4,1,'#765142');rect(2,-3+step,4,1,'#765142');
  g.translate(0,-bob-breath);
  rect(-9,-21,18,15,'#292b40');rect(-8,-20,16,13,'#435d82');rect(-7,-19,14,2,'#6889a6');rect(-8,-16,16,3,'#a75e89');rect(-8,-11,16,3,'#a65d87');rect(-8,-7,16,1,'#7891a7');rect(5,-19,2,11,'#374d70');rect(-6,-13,1,2,'#d68bad');
  rect(-11,-19-step,3,10,'#31415e');rect(-10,-18-step,3,2,'#af6b92');rect(-10,-10-step,3,3,'#dca785');rect(-9,-10-step,2,1,'#f2c79e');
  rect(8,-19+step,3,10,'#31415e');rect(8,-18+step,3,2,'#af6b92');rect(8,-10+step,3,3,'#c78c70');rect(8,-10+step,2,1,'#e8b896');
  // A rounded, layered fringe and longer side locks, with subtle warm highlights.
  rect(-9,-33,18,14,'#302427');rect(-8,-35,16,3,'#3d2929');rect(-9,-31,18,12,'#5d3a2e');rect(-7,-34,13,2,'#79503a');rect(-8,-30,2,10,'#49302b');rect(6,-30,2,11,'#422c2a');
  if(back){rect(-7,-31,14,12,'#5b3b2f');rect(-5,-32,9,1,'#8e5f43');rect(-5,-29,1,7,'#805239');rect(1,-30,1,8,'#724a36');rect(5,-27,1,7,'#3e2c29');rect(-7,-21,2,2,'#45302a')}
  else{rect(-6,-29,12,9,'#e8b38a');rect(-6,-22,12,2,'#cb9275');rect(-6,-29,12,2,'#674331');rect(-6,-28,3,2,'#674331');rect(3,-28,3,2,'#674331');rect(-4,-25,3,1,'#50362f');rect(2,-25,3,1,'#50362f');rect(-1,-22,2,1,'#a66760');rect(-6,-23,2,1,'#d99b80');rect(4,-23,2,1,'#d99b80')}
 }
 g.restore();
}
