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
'  kwsskkkwwwkkkkkssk ',
'  kwkkkkkwwkkkkkkwsk ',
'  kwkkekkwwkkekkkswk ',
'  kkwwwwwkkswwwsswkk ',
'   kwwwwkkkkwwwWwsk  ',
'  kwswwwwwwwwwwwswsk ',
'   kwwwwmwwwwmwwwsk  ',
'    kswwwmmmmwwwsk   ',
'     kswwwwwWwsssk   ',
'      kksssssskk     ',
'        kkkkkk       '];
const angrySkull=skull.map((row,j)=>({5:'  kwkkwwwwwwwwwkkssk ',6:'  kwwkkkkwwkkkkkwwsk ',11:'   kwwwwwmmmmwwwwsk  ',12:'    kswwmwwwwmwwsk   '}[j]||row));
const coat=[
'      kkkkkkkkkk       ',
'    kkffsskkssffkk     ',
'   kbfwwsfwwfswwfbk    ',
'  kBbbffwsggswffbbBk   ',
' kBBbbbkfswwsfkbbbBBk  ',
' kBbbddbkfwwfkbbddBBk  ',
'kBBbbbkbbswwsbbkbbbBBk ',
'kBbbkkdbbzwwzbbdkkbbBk ',
'kdbkBBkbczwwzcbkBBkbBk ',
' kbbbbbBbswwsbBbbbbbk  ',
'  kkddBBbzwWwzbBBddkk   ',
'    kddbbzggzbbddk     ',
'    kkkkkkkkkkkkkk     '];
const boot=['  kkkkkk  ','  kssssk  ',' kpppppsk ','kPPPPpppsk','kssppppssk',' kkkkkkkk '];
const shorts=[' kkkkkkkkkkkkkkk ',' kgggGggkgggGggk ',' kgggGggkgggGggk ',' kgggGggkgggGggk ',' kgggggkkkgggggk ',' kkkkkkk kkkkkkk '];
const paint={m:"#716d68",k:ink,w:bone,W:'#fff9e8',s:shade,b:blue,d:'#315b83',z:'#bdccd4',c:'#729cba',B:'#7db2cb',f:'#d5d6cb',g:'#303b50',G:'#687588',p:'#bd8b99',P:'#efd1c7',e:'#f9f7e8'};
// Replace the pocketed sleeve, rather than drawing a second hand over it.
// Warm tip in front, shaded curled fingers behind, blue elbow to the outside.
const pointingCoat=coat.map((row,j)=>j<4||j>10?row:row.slice(0,12)+[
 'sfkbbbBBk', 'sfkBBbbbBk', 'skkkkBBbbk', 'kWWwskBBbk',
 'kwwskwsbbk', 'skkswskdk', 'wzksskkk'
][j-4]);
// Project the fingertip onto the body centreline. Its near face grows on
// the thrust while the far knuckles and elbow stay tucked against the coat.
const towardPlayer=coat.map((row,j)=>j<4||j>11?row:row.slice(0,8)+[
 'wwwsfkbBBbbk','wwkksssfBBbbk','wkWWkswsdBBbbk',
 'kwWWwkswksBBbk','kwwwwkssksBbbk','wkssksksksdbk',
 'zwkksskskkddk','bzggzkkkddk'
][j-4]);
let swings=0,fallAge=0;
const fallenFace=angrySkull.map((r,j)=>j===11?'   kwwwssssssswwwsk  ':r);
// The cut catches the open hoodie. Keep it attached to the cloth through the final hold.
const lastCoat=coat.map((row,j)=>[...row].map((p,i)=>{
 const line=19-j*1.24;if(j<2||j>10||p===' '||p==='k')return p;
 return Math.abs(i-line)<1.35?(i<line?'R':'r'):p;
}).join(''));
const lastPaint={...paint,R:'#af263c',r:'#722337'};
const lastFace=fallenFace.map((r,j)=>j===12?r.slice(0,14)+'R'+r.slice(15):j===13?r.slice(0,14)+'r'+r.slice(15):r);
const SOUL_BREAK=7.85,SOUL_ASH=8.65,FALL_END=10.42;
// Always beneath the coat, just left of the sternum (viewer-right). Ash exposes it stitch by stitch.
const monsterSoul=['   h   ','  hww  ',' hwwws ','hwwwwss','wwwwsss',' ss ss '];
function lastSoul(a,lean,drop){
 if(a>=FALL_END)return;
 const split=ease((a-SOUL_BREAK)/.36);
 g.save();monsterSoul.forEach((row,j)=>[...row].forEach((p,i)=>{
  if(p===' ')return;const right=i>=[4,3,4,3,3,3][j],seed=((i*31+j*17)%47)/47;
  const d=Math.max(0,a-SOUL_ASH-seed*.43),life=1-ease((d-.25)/.96);
  if(!life)return;g.globalAlpha=life;
  const px=158+lean+26+(i-3)+(right?1:-1)*split*2;
  const py=68+drop+7+(j-2)+(right?1:0)*split;
  rect(px+d*((seed-.4)*17)+d*d*6,py-d*(6+seed*13),1,1,p==='h'?'#fffefa':p==='w'?'#e8e8e3':'#bbbdbb');
 }));g.restore();
}
const foldingLegs=['  kkkkkkkkkkk  ',' kgGGggggggGgk ','kgGGgggkkggGggk','kgggggk  kggggk',' kgggk    kgggk','  kkk      kkk '];
// Front-view knees and slippers: centered toe caps, no side-facing heels.
const bentKnee=['   kkkkkkkkkk   ','  kgGGggggGGgk  ',' kgggggkkgggggk ','kgGGgggkkggGGggk','kgggggk  kgggggk',' kkkkk    kkkkk '];
const frontBoot=['  kkkk  ',' kssssk ','kppPPppk','kpPPPPpk','kssppssk',' kkkkkk '];
const tuckedBoot=[' kkkkkk ','kppPPppk','kssppssk',' kkkkkk '];
function kneelPose(a){const shift=ease((a-.52)/.48),fold=ease((a-.9)/.68),settle=pulse(a,1.55,1.95);
 return {fold,lean:0,drop:Math.round(2*shift+7*fold+2*settle),bow:Math.round(3*ease((a-1.13)/.78))}}
// Locate the bottommost stained stitch instead of emitting from arena coordinates.
const hem=lastCoat.flatMap((row,j)=>[...row].flatMap((c,i)=>'Rr'.includes(c)?[{i,j}]:[])).pop();
function drip(a,release){const d=a-release;if(d<-.24)return;const pose=kneelPose(Math.min(a,release));
 const x=158+pose.lean+2*hem.i,y=68+pose.drop+2*hem.j+2,floor=110;
 if(d<0){rect(x,y,1,1+Math.floor(2*ease((d+.24)/.24)),'#ae3044');return}
 const distance=floor-y,impact=Math.sqrt(distance/90);
 if(d<impact){const h=1+Math.min(2,Math.floor(d*8));rect(x,y+90*d*d-h+1,1,h,'#ac2e40');return}
 const rest=d-impact;if(rest>.85)return;g.save();g.globalAlpha=1-ease((rest-.24)/.61);rect(x-1,floor,3,1,'#842237');if(rest<.09)rect(x+2,floor-1,1,1,'#bc4350');g.restore();}
function fallenSans(){
 const a=fallAge;if(a>=FALL_END)return;
 const hit=a>=.24,{fold,lean,drop,bow}=kneelPose(a),eyes=1-ease((a-.65)/3.35);
 // Release each sprite cell once, from its actual resting place. The upper
 // silhouette loosens first; a little ash from the boots lingers at the end.
 function layer(rows,ox,oy){rows.forEach((row,j)=>[...row].forEach((key,i)=>{
  if(!lastPaint[key])return;
  const px=ox+i*2,py=oy+j*2,seed=((i*71+j*31+rows.length*13)%97)/97;
  const age=a-(4.25+(py-50)*.018+seed*.63);
  if(age<0){rect(px,py,2,2,key==='e'?ink:lastPaint[key]);return}
  if(age>1.38)return;
  g.globalAlpha=1-ease((age-.75)/.63);
  const wind=Math.sin(seed*27+age*3)*age*5+age*age*9;
  rect(px+wind,py-age*(8+seed*14),age<.16?2:1,age<.16?2:1,seed<.4?'#aaa8a4':'#e2dfd7');g.globalAlpha=1;
 }))}
 lastSoul(a,lean,drop);
 g.save();layer(frontBoot,162,98);layer(fold>.55?tuckedBoot:frontBoot,182,98+(fold>.55?4:0));
 layer(fold>.68?bentKnee:fold>.12?foldingLegs:shorts,164+lean,89+Math.round(9*fold));
 layer(hit?lastCoat:coat,158+lean,68+drop);layer(hit?lastFace:angrySkull,159+lean,43+drop+bow);
 if(eyes>0){g.globalAlpha=eyes;for(let i=0;i<skull[7].length;i++)if(skull[7][i]==='e')rect(159+lean+2*i,57+drop+bow,2,2,paint.e)}g.restore();
 // Keep the original sweep; shift its midpoint onto the hoodie wound.
 if(a<1.45){g.save();g.translate(2+lean,8+drop);slash(a*1.6,false);g.restore()}
 for(const release of [1.12,2.23,3.27])drip(a,release);
}
function sans(){
 const evade=mode==='strike',a=evade?EVADE_DURATION-flash:0,side=round%2?1:-1;
 const spring=pulse(a,0,.29),out=pulse(a,.22,.69),back=pulse(a,2.04,2.80);
 const offset=side*(65*ease((a-.19)/.52)*(1-ease((a-2.02)/.78))-3*spring);
 const cx=180+offset,lean=side*(3*out-2*back-spring),lift=5*out+3*back;
 const bob=(1-Math.cos(t*2.9))*.65,base=109-lift;
 rect(cx-20,109,40,2,'#101010');rect(cx-14,111,28,1,'#161616');
 for(const foot of [-1,1]){const step=foot*side;mask(boot,paint,cx+foot*10-10+step*2*out,base-11-(step>0?3*out:2*back))}
 mask(shorts,paint,cx-16,base-20);
 const torso=base-41+bob+2*spring,gesture=t-gestureStart;
 const pointing=encounter===4&&calm<3&&gesture>=.25&&gesture<.95;
 const thrust=pointing&&gesture>=.34&&gesture<.86;
 mask(thrust?towardPlayer:pointing?pointingCoat:coat,paint,cx-22+lean,torso);
 const hx=cx-21+lean*1.5,hy=torso-25+bob*.45;
 mask(encounter>=3&&calm<3?angrySkull:skull,{...paint,e:t%4.5<.14?ink:paint.e},hx,hy);
 if(mode==='dodge'||(evade&&a>.62&&a<2.15)){rect(hx+26,hy+14,3,2,'#44cdea');rect(hx+27,hy+14,1,1,'#deffff')}
 if(evade&&a>=.78)slash(a-.78);
}
// Draw the cut over time, then let its afterimage dissolve before the counterattack.
function slash(age,miss=true){
  let u=Math.min(1,age/.72);u=u*u*(3-2*u);
  const fade=Math.min(1,Math.max(0,(1.45-age)/.65));g.save();g.globalAlpha=fade;
  for(let i=0;i<Math.ceil(52*u);i++){
    const f=i/51,xx=154+i,yy=98-40*f-5*Math.sin(f*Math.PI),w=1+Math.round(3*Math.sin(f*Math.PI));
    rect(xx,yy-w,2,w*2+1,'#cf765d');rect(xx,yy-w+1,2,w+1,'#ffdea0');rect(xx,yy,2,1,'#fffcea');
  }
  if(miss&&age>.32&&age<1.18){g.globalAlpha=ease((age-.32)/.12)*(1-ease((age-.98)/.2));g.font='7px p, monospace';g.textAlign='center';g.fillStyle='#fff3cd';g.fillText('MISS',180,59-Math.round(ease(age-.32)*4))}
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
const classicSoulBox={l:98,r:262,u:121,d:171};
function shatter(age,b,cx,cy){
 g.save();g.beginPath();g.rect(b.l,b.u,b.r-b.l,b.d-b.u);g.clip();
 for(const f of fragments){const sign=Math.sign(f.vx),ox=cx+(f.i-3)*2.5+sign*4,oy=cy+(f.j-3)*2.5+(sign>0?2:0);
  const floor=b.d-5,gravity=54*(b.d-b.u)/50,hit=(-f.vy+Math.sqrt(f.vy*f.vy+2*gravity*(floor-oy)))/gravity;
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
function brokenSoul(b=classicSoulBox){
 const mx=(b.l+b.r)/2,my=Math.floor((b.u+b.d)/2)-1;
 const a=deathAge, focus=ease(a/.38), split=ease((a-.78)/.46);
 if(a>=1.52){shatter(a-1.52,b,mx,my);return}
 const cx=x+(mx-x)*focus,cy=y+(my-y)*focus,scale=1+focus*(1.5+.55*pulse(a,.38,.76));
 g.save();
 soulRows.forEach((row,j)=>[...row].forEach((p,i)=>{
  if(p!=='r')return;
  const right=i>=seam[j],dir=right?1:-1;
  const crack=i===seam[j]&&j<=Math.floor((a-.38)*16)&&a<.84;
  rect(cx+(i-3)*scale+dir*(4*split),cy+(j-3)*scale+(right?2:0)*split,Math.ceil(scale),Math.ceil(scale),crack?'#fff1da':right?'#ff626a':'#df475c');
 }));g.restore();

}
let encounter=1,patternStep=0,colorStep=0,gestureStart=0;
const sectionNames=['Blue Shift','Narrow Gates','Stop & Go'];
function boneSprite(b){
 const light=b.red?'#ffc3a9':b.blue?'#b3f6ff':'#fff5df',mid=b.red?'#ff505b':b.blue?'#37b9ef':'#d8cfb9',dark=b.red?'#ae273f':b.blue?'#17749e':'#92897c';
 rect(b.x,b.y+2,3,b.h-4,mid);rect(b.x+2,b.y+2,1,b.h-4,dark);
 for(const top of [true,false]){const end=top?b.y:b.y+b.h-1,dir=top?1:-1;
  rect(b.x-1,end,2,1,light);rect(b.x+2,end,2,1,mid);
  rect(b.x-2,end+dir,7,1,mid);rect(b.x-1,end+2*dir,5,1,dark);rect(b.x-1,end+dir,2,1,light)}
 if(b.red)for(let j=6;j<b.h-4;j+=8){rect(b.x,b.y+j,1,1,light);rect(b.x+1,b.y+j+1,1,1,light);rect(b.x+2,b.y+j,1,1,light)}
 if(b.blue)for(let j=6;j<b.h-4;j+=7)rect(b.x,b.y+j,2,1,light);
}
function startWave(delay){mode='dodge';elapsed=0;spawn=delay;shots=[];patternStep=0;colorStep=0;
 if(encounter===2)msg(['Blue Shift: hold for blue, then move to the white gap.','Narrow Gates: follow the gaps in the white bones.','Stop & Go: dodge white. Hold still for blue.'][(round-1)%3]);}
function emit(){const right=round%2,src=right?257:99,add=(y,h,speed,blue=false,red=false)=>shots.push({x:src,y,h,v:(right?-1:1)*speed,blue,red});
 if(encounter===1){spawn=.78;let h=13+Math.random()*14;add(Math.random()<.5?121:171-h,h,52);return}
 const n=patternStep++,section=(round-1)%3;
 const coloredBone=(speed,blue)=>{
  const beat=colorStep++;if(beat%3===2){add(121,50,speed,blue,!blue);return}
  const h=[28,32,30,35][(beat+round)%4];
  const center=146+[-2,1,0,2][beat%4];
  const y=beat%6===4?(round%2?121:171-h):Math.round(center-h/2);
  add(y,h,speed,blue,!blue);
 };
 if(encounter===6){const beat=n%6,spd=purple?104:62;spawn=purple?.49:.96;if(purple&&(beat===2||beat===3)){add(121,50,spd,beat===2,beat===3);return}const top=[9,18,24,14,20,12][beat],gap=purple?9:19;add(121,top,spd,purple&&beat===4);add(121+top+gap,50-top-gap,spd,false,purple&&beat===1);return}
 if(encounter>=5){const beat=n%8,speed=100+section*2;spawn=[.52,.57,.49,.54,.5,.53,.57,.52][beat];
  if([1,2,5,6].includes(beat)){add(121,50,speed,beat===2||beat===5,beat===1||beat===6);return}
  const top=[11,18,24,27,17,10,22,12][(n+round)%8],gap=8-section;
  add(121,top,speed,beat===3,beat===7);add(121+top+gap,50-top-gap,speed,beat===7,beat===3);return}
 if(encounter===4){const beat=n%6,speed=95,top=[12,18,24,14,20,10][(n+round)%6],gap=11-section;
  spawn=[.56,.65,.51,.59,.68,.54][beat];if(beat===1||beat===4){coloredBone(speed,beat===4);return}
  add(121,top,speed,beat===0,beat===3);add(121+top+gap,50-top-gap,speed,beat===3||beat===2,beat===0||beat===5);return}
 if(encounter===3){const beat=n%4;spawn=[.7,.58,.72,.62][beat];
  if(beat===0||beat===2&&section>0){const blue=beat===2;coloredBone(89,blue);return}
  const gap=14-section,top=[9,23,13,19][(n+round)%4];add(121,top,89);add(121+top+gap,50-top-gap,89);return}
 if((section===0&&n%3!==2)||(section===2&&n%3===1)){coloredBone(section===0?69:82,true);spawn=section===0?.84:.76;return}
 const top=[8,23,13,26][n%4],gap=section===0?19:section===1?17:16;
 add(121,top,section===1?65:74);add(121+top+gap,50-top-gap,section===1?65:74);spawn=.96;
}
function resetBattle(){swings=0;fallAge=0;gestureStart=t;round=1;hp=20;boss=100;food=3;calm=0;deathAge=0;inv=0;mode='ready';x=180;y=148;shots=[];drag=false;target=null;}
function draw(){g.clearRect(0,0,c.width,c.height);if(mode==='visitor'){drawVisitor();return}if(encounter>=7&&!walking()){sevenDraw();return}if(mode==='room'){g.save();g.translate(-HALL_LEFT,0);chamber();g.restore();return}if(walking()){hallway();return}if(encounter===6)heartOpponent();else if(mode==='fallen'||encounter===5&&boss===0)fallenSans();else sans();rect(94,118,172,57,'#585858');rect(96,119,168,54,'#e7e7e7');rect(98,121,164,50,'#101010');for(let i=100;i<260;i+=8)for(let j=124;j<171;j+=8)rect(i,j,1,1,'#222222');for(const b of shots)boneSprite(b);if(mode==='dying')brokenSoul();else if(hp>0&&(inv<=0||Math.floor(t*12)%2)){tinySoul(x,y)}if(paused||mode==='end'||mode==='between'){rect(101,134,158,22,'#222222');g.fillStyle='#ffe27d';g.font='8px p, monospace';g.textAlign='center';g.fillText(paused?'PAUSED':hp<=0?'SOUL LOST':'ENCOUNTER CLEAR',180,148)}}
let misses=0;
function say(line){if(encounter>=7||mode==='visitor'){speech=null;return}msg('Sans: “'+line+'”');dialogBlips(line,mode==='fallen')}
function msg(m){speech=null;$('#message').textContent=m}function ui(){const width=walking()?HALL_WIDTH:360,height=walking()?HALL_HEIGHT:encounter>=7?224:180;const scale=encounter>=7&&!walking()?3:1;if(c.width!==width*scale||c.height!==height*scale){c.width=width*scale;c.height=height*scale;g.setTransform(scale,0,0,scale,0,0);g.imageSmoothingEnabled=false}$('.world').classList.toggle('explore',walking());$('.world').classList.toggle('visitor-fight',encounter>=7&&!walking());$('.boss h2').textContent=mode==='room'?'Study':walking()?'Corridor':encounter===6?(purple?'Violet Heart':'White Heart'):'Sans';$('#encounter').textContent=walking()?'PASSAGE':encounter===8?'ENCOUNTER 08':encounter>=7?'ENCOUNTER 07 · THE VISITOR':encounter===6?'ENCOUNTER 06 · FRACTURE':encounter===5?'ENCOUNTER 05 · LAST STAND':encounter===1?'ENCOUNTER 01':encounter===4?'ENCOUNTER 04 · BONE LOCK':encounter===3?'ENCOUNTER 03 · REDLINE':'ENCOUNTER 02 · '+sectionNames[Math.min(round-1,2)].toUpperCase();document.querySelectorAll('[data-a]').forEach(b=>{const locked=blocked(b.dataset.a);b.classList.toggle('night-lock',locked&&encounter>=7);b.classList.toggle('bound',locked&&encounter!==6);b.classList.toggle('corrupt',locked&&encounter===6);b.disabled=mode==='sevenHold'||walking()||heartBusy()||mode==='fallen'||locked||mode==='dodge'||mode==='strike'||mode==='dying'||paused});for(let [id,v,max] of [['hp',hp,20],['boss',boss,100]]){if(id==='hp')$('#hpnum').textContent=v+' / '+max;$('#'+id+'bar').style.width=v/max*100+'%'}$('#turn').textContent=String(round).padStart(2,'0');$('#phase').textContent=walking()?(paused?'PAUSED':mode==='portal'?'CROSSING':'EXPLORE'):mode==='sevenHold'?'STILL':mode==='dying'?'SOUL LOST':mode==='strike'?'STRIKE':mode==='dodge'?'DODGE':mode==='end'||mode==='between'?'END':'READY'}
function blocked(a){if(mode==='look')return false;return encounter>=7&&a!=='fight'||encounter===6&&purple&&mode!=='end'&&a!=='fight'||encounter===5&&mode!=='end'&&(a==='act'||a==='mercy')||a==='mercy'&&mercyBound()}
function mercyBound(){return encounter===4&&calm<3&&mode!=='end'}
function finish(){if(encounter<5)sampleCue('clear');mode='between';msg(encounter<5?`Encounter 0${encounter} clear. Select any action for encounter 0${encounter+1}.`:'The corridor is quiet. Press any button to enter the hallway.')}
function startSansDeath(){boss=0;fallAge=0;shots=[];mode='fallen';msg('The fifth slash lands.');sampleCue('fatal');ui()}
function act(a){if(mode==='visitor'||mode==='room'||mode==='sevenHold')return;if(encounter>=7){if(paused||a!=='fight')return;if(mode==='end'){encounter===8?startEight(true):startSeven();return}if(mode==='ready'){swings++;boss=swings===(encounter===8?5:6)?0:100;flash=1.45;mode='strike';sfx('slash');msg('Slash '+swings+' / '+(encounter===8?5:6));ui()}return}if(mode==='look'&&!paused){enterRoom();return}if(paused||mode==='fallen'||mode==='dodge'||mode==='strike'||mode==='dying')return;if(mode==='between'){if(encounter===5){enterHall();return}encounter++;resetBattle();say(encounter===5?'THIS TIME I WONT GIVE UP!':encounter===4?'you know what no more mercy':encounter===3?'Ah you again im taking it serius':'new rule, kid. blue bones pass through if you hold still.');ui();return}
if(mode==='end'){if(hp<=0)sampleCue('retry');if(hp<=0&&encounter===6){enterHeart();return}if(hp>0)encounter=1;resetBattle();say(encounter===5?'THIS TIME I WONT GIVE UP!':encounter===2?'round two again. remember: blue means hold still.':'back already? kept your spot warm.');ui();return}if(blocked(a))return;if(encounter===6){heartAction(a);return}if(a==='item'&&!food){sampleCue('empty');msg('Your pockets are empty. Choose another action.');return}if(a==='fight'){if(encounter!==5||swings!==4)sfx('slash')}else if(a==='item')sfx('heal');else beep(330);if(a==='fight'){if(encounter===5&&++swings===5){startSansDeath();return}mode='strike';flash=EVADE_DURATION;msg('You swing.');ui();return}if(encounter===4&&a==='act'){calm++;say(['you want me to listen? then listen back.', '...okay. one more thing to say?', 'alright. the bone’s gone. your call.'][Math.min(calm,3)-1])}if(encounter===3&&a==='act'){calm++;say(['red means keep moving, kid.', 'yeah. i hear you. blue still means stop.', 'enough. use mercy and we’re done.'][Math.min(calm,3)-1])}if(a==='act'&&encounter===1){calm++;say(['heh. a joke? now we’re talking.', 'okay. that one got a real laugh.', 'call it a draw? mercy’s right there.'][Math.min(calm,3)-1])}if(a==='item'){food--;hp=Math.min(20,hp+8);msg(`You eat a pie slice. ${food} left.`+(encounter===3?' Red: move. Blue: stop.':''))}if(a==='mercy')msg(encounter===3?'Not yet. Try ACT. Red: move. Blue: stop.':'Not yet. Maybe a few jokes would help.');if(!boss||(a==='mercy'&&calm>=3&&encounter!==2)){finish()}else{startWave(.1)}ui()}
function update(dt){tickSpeech(dt);if(mode==='visitor'){const before=revealClock;revealClock+=dt;if(before<.38&&revealClock>=.38)sampleCue('seal-open');if(before<3.83&&revealClock>=3.83)sampleCue('seal-close');if(before<2.13&&revealClock>=2.13){sampleCue('rattle');msg('A slipper scrapes against the stone.')}if(before<3.43&&revealClock>=3.43){sampleCue('rift');msg('The wall crackles behind him.')}if(revealClock>=5.05)startSeven();return}if(encounter>=7&& !walking()&&mode!=='dying'){sevenTick(dt);return}if(chapterTick(dt))return;if(mode==='fallen'){const before=fallAge;fallAge+=dt;if(before<SOUL_BREAK&&fallAge>=SOUL_BREAK)sampleCue('soul-split',.89,.78);if(before<SOUL_ASH&&fallAge>=SOUL_ASH)sfx('dust',1.12);if(before<5.7&&fallAge>=5.7)sfx('dust');if(before<1.48&&fallAge>=1.48)say('heh. guess you finally got me.');if(before<3.1&&fallAge>=3.1)say('give me a minute, kid.');if(fallAge>=FALL_END){finish();ui()}return}if(mode==='dying'){const prev=deathAge;deathAge+=dt;if(prev<.78&&deathAge>=.78)sampleCue('soul-split');if(prev<1.52&&deathAge>=1.52)sampleCue('soul-scatter');if(prev<2.08&&deathAge>=2.08){say('hey. take a breath, kid.')}if(deathAge>=3.43){mode='end';msg('Your soul shattered. Select an action to retry.');ui()}return}if(mode==='strike'){
 const prev=flash;flash=Math.max(0,flash-dt);
 if(prev>EVADE_DURATION-1.1&&flash<=EVADE_DURATION-1.1){sfx('evade');say(['nice swing. wrong address.', 'pretty sure the air learned its lesson.', 'i was standing there. past tense.'][misses++%3]);ui()}
 if(!flash){if(!boss){finish()}else{if(encounter>=3)msg('Red: move. Blue: stop. White: dodge.');if(encounter===1)msg('Dodge the bones! Try ACT to win him over.');startWave(.55)}ui()}return;
}inv-=dt;if(mode!=='dodge')return;elapsed+=dt;spawn-=dt;const oldX=x,oldY=y;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));if(drag&&target){let vx=target[0]-x,vy=target[1]-y,l=Math.max(1,Math.hypot(vx,vy)/(90*dt));x+=vx/l;y+=vy/l}else{x+=dx*65*dt;y+=dy*65*dt}x=Math.max(102,Math.min(257,x));y=Math.max(125,Math.min(167,y));const moving=Math.hypot(x-oldX,y-oldY)>.00001;if(spawn<=0){if(!patternStep&&!shots.length&&elapsed<1)sampleCue('rattle');emit()}for(let b of shots){b.x+=b.v*dt;if(!testGod&&inv<=0&&(!b.blue||moving)&&(!b.red||!moving)&&x+2>b.x&&x-2<b.x+3&&y+2>b.y&&y-2<b.y+b.h){hp=Math.max(0,hp-3);inv=.85;sfx('hurt');if(!hp){mode='dying';deathAge=0;shots=[];msg('Your soul begins to crack.');ui();return}ui()}}shots=shots.filter(b=>b.x>=99&&b.x<=258);if(elapsed>(encounter===1?5.4:7.5)&&mode==='dodge'){shots=[];if(encounter===2&&round===3){sampleCue('clear');mode='between';msg('Encounter 02 clear. Select any action for encounter 03.')}else{mode='ready';round++;msg(encounter===6?(purple?'The eyes are watching. Strike again.':'The pale heart pulses. Your move.'):encounter===5?`FIGHT ${swings}/5. Keep pressing the attack.`:encounter>=3?(calm>=3?'Sans has lowered his guard. Choose MERCY.':'ACT to calm Sans. Red: move. Blue: stop.') :encounter===2?'Section clear. Choose an action when ready.':'Your move. Choose an action.')}ui()}}
function frame(now){let dt=Math.min(.04,(now-last)/1000);last=now;if(!paused&&!testPanel.open&&!letter.open){const steps=Math.ceil(gameSpeed),step=dt*gameSpeed/steps;for(let i=0;i<steps;i++){t+=step;update(step)}}draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{document.querySelector('.sel')?.classList.remove('sel');b.classList.add('sel');act(b.dataset.a)});$('#pause').onclick=()=>{paused=!paused;$('#pause use').setAttribute('href','assets/icons.svg#'+(paused?'play':'pause'));$('#pause').ariaLabel=paused?'Resume game':'Pause game';ui()};$('#sound').onclick=()=>{sound=!sound;if(sound)enableAudio();if(bus)bus.gain.value=sound?1:0;$('#sound use').setAttribute('href','assets/icons.svg#'+(sound?'sound':'mute'));$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').style.opacity=sound?1:.55;beep(440)};onkeydown=e=>{if(testPanel.open||letter.open)return;if(mode==='look'&&!paused&&!e.repeat){e.preventDefault();enterRoom();return}if(mode==='between'&&encounter===5&&!paused&&!e.repeat){e.preventDefault();enterHall();return}if(e.code==='Backquote'){e.preventDefault();if(!e.repeat)openTest();return}let k=e.key.toLowerCase();if(k.startsWith('arrow')||k===' ')e.preventDefault();keys.add(k);if(!e.repeat){if(k===' ')act('fight');if(k==='escape')$('#pause').click()}};onkeyup=e=>keys.delete(e.key.toLowerCase());onblur=()=>{keys.clear();drag=false;if(mode==='dodge'&&!paused)$('#pause').click()};function point(e){let r=c.getBoundingClientRect();target=[(e.clientX-r.left)*(c.width/g.getTransform().a)/r.width,(e.clientY-r.top)*(c.height/g.getTransform().d)/r.height]}c.onpointerdown=e=>{if(mode==='room'&&!paused){point(e);const [px,py]=target;if(canReadStudyBook()&&px+HALL_LEFT>=165&&px+HALL_LEFT<=194&&py>=204&&py<=226){openLetter();return}}if(mode==='look'&&!paused){enterRoom();return}if(mode==='between'&&encounter===5){enterHall()}drag=true;c.setPointerCapture(e.pointerId);point(e)};c.onpointermove=e=>{if(drag)point(e)};c.onpointerup=c.onpointercancel=()=>drag=false;

document.querySelector("[data-a=fight]").classList.add("sel");const full=$("#full");if(!document.fullscreenEnabled)full.hidden=true;full.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};

// Local playtest controls only: no account privileges or remote mutations.
const testPanel=$('#test-panel');let testGod=false,gameSpeed=1;
$('#test-speed').oninput=e=>{gameSpeed=e.target.valueAsNumber;$('#speed-value').textContent=gameSpeed.toFixed(1)+'×'};
function openTest(){keys.clear();drag=false;target=null;$('#tester').hidden=false;testPanel.showModal();$('#test-input').focus()}
function testCommand(raw){
 const cmd=raw.trim().toLowerCase().replace(/\s+/g,' ');
 if(cmd==='enc 8 last slash'){startEight(true);round=5;swings=4;eightWave();mode='ready';msg('Final slash. FIGHT.');ui()}else if(cmd==='enc 8'){startEight(true)}else if(cmd==='enc 7'||cmd==='gravity slam'){startSeven(cmd==='gravity slam'?6:1)}else if(cmd==='study'){encounter=6;resetBattle();enterRoom()}else if(cmd==='purple last stage'||cmd==='last slash'){enterHeart();purple=true;cracks=4;boss=20;if(cmd==='last slash')heartAction('fight');else msg('Four fractures. One slash left.')}else if(cmd==='hallway'){enterHall()}else if(cmd==='enc 6'){enterHeart()}else if(/^enc [1-5]$/.test(cmd)||cmd==='reset'){
  if(cmd==='reset'&&encounter>=7){encounter===8?startEight(true):startSeven();return null}if(cmd!=='reset')encounter=Number(cmd.slice(-1));resetBattle();
  if(encounter===5)say('THIS TIME I WONT GIVE UP!');else if(encounter===4)say('you know what no more mercy');else if(encounter===3)say('Ah you again im taking it serius');else msg('Encounter ready. Choose an action.');
 }else if(/^wave [1-3]$/.test(cmd)){round=Number(cmd.slice(-1));if(hp<=0)hp=20;inv=0;startWave(.55)}
 else if(cmd==='heal'){if(hp<=0)return 'Use reset to restart after death.';hp=20;food=3}
 else if(cmd==='sans death'||cmd==='finale'){encounter=5;resetBattle();swings=5;startSansDeath()}
 else if(cmd==='die'){hp=0;deathAge=0;shots=[];mode='dying';msg('Your soul begins to crack.')}
 else if(cmd==='calm'){calm=3;msg('Sans has lowered his guard.')}
 else if(/^god (on|off)$/.test(cmd)){testGod=cmd==='god on'}
 else return 'Unknown command. Try enc 4 or wave 2.';
 if(paused)$('#pause').click();ui();return null;
}
function runTest(cmd){const error=testCommand(cmd);if(error){$('#test-result').textContent=error;return}$('#test-input').value='';$('#test-result').textContent='Last: '+cmd+' · invincible '+(testGod?'on':'off');testPanel.close()}
$('#test-form').onsubmit=e=>{e.preventDefault();runTest($('#test-input').value)};
testPanel.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>runTest(b.dataset.cmd));
$('#test-close').onclick=()=>testPanel.close();$('#tester').onclick=openTest;
if(new URLSearchParams(location.search).get('admin')==='1')openTest();

const letter=$('#letter'),pages=[`Dear Sans if you see this you need to watch that human she is dangerous and probably she will challenge you and also don't forget that something is inside of you.... Sans thats its gester and i found a way to stop gester went you went uncontrol.

-peace by papyrus.`,`Remember you are also a living thing you have heart so keep it alive kid!.

And friend do you even have friend yet?.

-peace by papyrus`,`Sans im sorry for being a bad brother maybe one day that human can saved or destroyes something just keep and eye out!.

-peace by papyrus`,`Hello`];
let spread=0,turn=null;
function leaf(n){const el=document.createElement('article');el.className='book-leaf '+(n%2?'recto':'verso')+(n===3?' ripped':'');el.setAttribute('aria-label','Page '+(n+1)+(n===3?' — torn out':''));
 const copy=document.createElement('div');copy.className='book-copy';copy.textContent=pages[n];el.append(copy);
 const num=document.createElement('small');num.textContent=String(n+1).padStart(2,'0');el.append(num);return el}
function renderBook(n){spread=n;$('#spread').replaceChildren(leaf(n),leaf(n+1));$('#letter-prev').disabled=!n;$('#letter-next').disabled=!!n;$('#book-status').textContent=n?'Pages 3 and 4. Page 4 is torn out.':'Pages 1 and 2';fitBook()}
function fitBook(){if(!letter.open)return;const copies=[...letter.querySelectorAll('#spread > article .book-copy')];for(const c of copies)c.style.fontSize='';if(!copies.length)return;let size=parseFloat(getComputedStyle(copies[0]).fontSize);while(size>8&&copies.some(c=>c.scrollHeight>c.clientHeight+1)){size-=.5;for(const c of copies)c.style.fontSize=size+'px'}}
new ResizeObserver(()=>{if(turn)turn.finish();fitBook()}).observe($('#spread'));
const bookTurnFrames=[-1,1].map(dir=>Array.from({length:33},(_,i)=>{const t=i/32,bend=Math.sin(Math.PI*t)**2;return {offset:t,transform:`rotateY(${-dir*180*t}deg) skewY(${-dir*2.4*bend}deg) scaleX(${1-.025*bend})`}}));
function turnBook(dir){const next=spread+dir*2;if(turn||next<0||next>2)return;
 const old=[...$('#spread').children];renderBook(next);const now=[...$('#spread').children];const moving=dir>0?1:0;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!Element.prototype.animate)return;
 const flap=document.createElement('div');flap.className='book-flap '+(dir>0?'forward':'backward');flap.setAttribute('aria-hidden','true');flap.inert=true;
 const front=old[moving],back=now[1-moving];front.classList.add('leaf-front');back.classList.add('leaf-back');
 const hold=old[1-moving];back.replaceWith(hold);flap.append(front,back);$('#spread').append(flap);
 // The spine stays pinned. The fore-edge rises first, bows through the
 // midpoint and settles flat. The gutter shading travels with the paper.
 const timing={duration:880,easing:'cubic-bezier(.42,0,.26,1)',fill:'forwards'};
 turn=flap.animate(bookTurnFrames[dir===1?1:0],timing);
 turn.onfinish=()=>{back.classList.remove('leaf-back');hold.replaceWith(back);flap.remove();turn=null;fitBook()};}
function openLetter(){keys.clear();drag=false;target=null;renderBook(0);letter.showModal();fitBook()}
$('#letter-prev').onclick=()=>turnBook(-1);$('#letter-next').onclick=()=>turnBook(1);$('#letter-close').onclick=()=>letter.close();letter.onclose=()=>{if(turn){turn.cancel();turn=null}if(mode==='room'){keys.clear();target=null;drag=false;mode='visitor';revealClock=0;msg('The last page settles.');ui()}};letter.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();turnBook(e.key==='ArrowRight'?1:-1)}};
