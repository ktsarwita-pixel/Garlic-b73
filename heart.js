// Beyond the wall: hallway traversal and the two forms of the sixth opponent.
let glideDistance=0;
let hallX=180,hallY=398,sceneAge=0,purple=false,cracks=0;
const walking=()=>mode==='hall'||mode==='portal';
const heartBusy=()=>['heartHit','reform','destroy'].includes(mode);
function enterHall(){encounter=6;resetBattle();glideDistance=0;hallX=180;hallY=398;sceneAge=0;keys.clear();purple=false;cracks=0;mode='hall';msg('Follow the stone inlay north. Move with arrows / WASD, or hold and drag.');ui()}
function enterHeart(){encounter=6;resetBattle();cracks=0;purple=false;sceneAge=0;msg('A white heart beats on the other side.');ui()}
const soulInk=[' pr rr ','phrrrbr','rrrrrbd',' rrrbd ','  rbd  ','   d   '];
const soulColor={p:'#ff99a4',h:'#fff1da',r:'#ff465c',b:'#d82f51',d:'#a12245'};
function tinySoul(cx,cy){soulInk.forEach((row,j)=>[...row].forEach((v,i)=>{if(soulColor[v])rect(cx+i-3,cy+j-3,1,1,soulColor[v])}))}
// World coordinates are in floor pixels; the camera never scales or rotates.
const HALL_NORTH=38,HALL_SOUTH=410;
const hallClamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const HALL_LEFT=72,HALL_WIDTH=216,HALL_HEIGHT=438;
function hallWidth(y){return (y>=154&&y<=254)?87:65}
function moveInHall(dt){
 let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 let step=92*dt;
 if(drag&&target){dx=target[0]+HALL_LEFT-hallX;dy=target[1]-hallY;step=Math.min(step,Math.hypot(dx,dy))}
 const len=Math.hypot(dx,dy);if(!len)return;
 const oldX=hallX,oldY=hallY;const width=hallWidth(hallY);hallX=hallClamp(hallX+dx/len*step,180-width+4,180+width-4);
 const next=hallClamp(hallY+dy/len*step,HALL_NORTH,HALL_SOUTH);
 if(Math.abs(hallX-180)<=hallWidth(next)-4)hallY=next;
 glideDistance+=Math.hypot(hallX-oldX,hallY-oldY);if(glideDistance>=48){glideDistance%=48;sfx('drift')}
 if(hallY<=HALL_NORTH+1&&Math.abs(hallX-180)<23){mode='portal';sfx('static');sceneAge=0;drag=false;target=null;msg('The stone slips out of place. Beyond it, a heartbeat.');ui()}
}
// Shallow chips and mineral veins cut into individual flagstones, not the grout.
const stoneMarks=[['  ll',' ll ','dd  '],['    d','  ddd',' dd  ','dl   '],['lld',' dd'],['l   l','   ld']];
function flagstone(a,b,i,j){
 const seed=(i*73+j*137+i*j*13)%97;
 rect(a,b,31,15,['#777979','#747676','#797b7a','#767877'][seed%4]);
 rect(a+1,b,29,1,'#818382');rect(a+2,b+14,28,1,'#696c6b');
 if(seed%4===0){const mark=stoneMarks[(seed>>2)%4];mark.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!==' ')rect(a+4+seed%17+x,b+3+seed%5+y,1,1,v==='l'?'#8a8c88':'#626564')}))}
}
function hallway(){
 const port=mode==='portal';g.save();g.translate(-HALL_LEFT,0);
 rect(HALL_LEFT,0,HALL_WIDTH,HALL_HEIGHT,'#101112');
 // The gallery opens into a wider landing halfway up the map.
 for(const [top,bottom,w] of [[32,154,65],[154,255,87],[255,417,65]]){
  const l=180-w,r=180+w,h=bottom-top;
  for(const edge of [l-9,r]){rect(edge,top,9,h,'#424446');rect(edge+2,top,5,h,'#a4a6a6');rect(edge+3,top,1,h,'#d8d9d7')}
  rect(l,top,w*2,h,'#646667');rect(l,top,3,h,'#414345');rect(r-2,top,2,h,'#505253');
  g.save();g.beginPath();g.rect(l+3,top,w*2-6,h);g.clip();
  for(let j=Math.floor(top/16);j<bottom/16;j++)for(let i=0;i<7;i++){
   flagstone(78+i*32-(j%2)*16,j*16,i,j)}
  g.restore();
 }
 for(const py of [154,251])for(const px of [85,245]){rect(px,py,30,4,'#a9aaa8');rect(px,py+3,30,1,'#48494a')}
 // Inlaid guide stripe with repeating diamond medallions.
 for(const px of [158,201]){rect(px,34,2,381,'#555758');rect(px+1,34,1,381,'#b7b9b6')}
 for(const py of [80,205,330])for(let j=-7;j<=7;j++){
  const w=7-Math.abs(j);rect(180-w,py+j,w*2+1,1,'#c7c8c4');if(w>1)rect(182-w,py+j,w*2-3,1,'#656768')}
 for(const py of [67,135,203,278,360])for(const side of [-1,1]){
  const a=180+side*(hallWidth(py)+8);rect(a-6,py-7,12,15,'#313335');rect(a-5,py-7,10,11,'#aaacab');rect(a-3,py-5,6,7,'#777978');rect(a-2,py-4,4,4,'#ededdf');rect(a-3,py+5,6,2,'#525455')}
 rect(106,HALL_SOUTH+5,148,7,'#aaacab');rect(106,15,148,18,'#929494');rect(106,15,148,2,'#d6d7d3');rect(106,32,148,3,'#454748');
 // Compass rose in the central landing; a stepped threshold at the entrance.
 for(let j=-16;j<=16;j++){
  const w=16-Math.abs(j);rect(180-w,205+j,w*2+1,1,'#aaada9');
  if(w>1)rect(182-w,205+j,w*2-3,1,'#565959');
  const ray=j===0?11:Math.max(1,5-Math.abs(j));if(Math.abs(j)<13){rect(180-ray,205+j,ray,1,'#cdd0c9');rect(180,205+j,ray,1,'#949994')}
 }
 for(let n=0;n<3;n++){rect(156+n*3,414+n*3,48-n*6,2,'#787b79');rect(156+n*3,414+n*3,48-n*6,1,'#c8cac5')}
 // Mortar joints and recessed grilles distinguish the two side galleries.
 for(const side of [-1,1]){
  for(let py=42;py<411;py+=18){const ex=180+side*(hallWidth(py)+4);rect(ex-3,py,6,1,'#676a68')}
  const ax=180+side*74;rect(ax-5,185,11,40,'#9da09c');rect(ax-4,186,9,37,'#454847');for(let k=0;k<8;k++)rect(ax-3,188+4*k,7,1,'#747976');
  for(const py of [103,307]){const ax=180+side*48;rect(ax,py,5,1,'#656968');rect(ax+3,py+1,1,3,'#656968');rect(ax+4,py+3,3,1,'#656968')}
 }
 const age=port?sceneAge:-1;threshold(age);crossingSoul(age);g.restore();
}
// Carved twin leaves share one broken seal. Slice the artwork, not the frame.
const CROSS_END=3.25;
function threshold(age){
 const active=age>=0,open=active?ease((age-.48)/.92)*(1-ease((age-2.54)/.66)):0;
 const beat=Math.floor(t*4.5),phase=t*4.5-beat,near=1-ease((hallY-38)/95);
 rect(150,12,60,24,'#36383a');rect(152,14,56,21,'#15171a');
 for(let row=0;row<21;row++){
  const band=row>>2,slips=band===(beat*3)%5;
  const tear=slips?(beat%2?-1:1)*(phase<.32?3+Math.round(near*3):phase<.56?1:0):0;
  const tooth=[0,0,-2,-2,1,1][Math.floor(row/2)%6];
  for(const side of [-1,1]){
   const dx=tear+side*Math.round(open*19),left=side<0?153:180+tooth,right=side<0?180+tooth:207;
   g.save();g.beginPath();g.rect(152,14+row,56,1);g.clip();
   rect(left+dx,14+row,right-left,1,row===0?'#ebece6':row%8===7?'#656967':'#a4a7a3');
   // Mortar seams move with the displaced strip; the adjoining blocks stay put.
   const joint=side<0?159+((row>>3)%2)*10:193+((row>>3)%2)*8;
   rect(joint+dx,14+row,1,1,'#777b78');rect(joint+1+dx,14+row,1,1,'#b9bcb6');
   const seal=180+side*(2+Math.abs(10-row));rect(seal+dx,14+row,2,1,'#626664');rect(seal+dx+side*2,14+row,1,1,'#dedfd8');
   rect((side<0?right-1:left)+dx,14+row,1,1,side<0?'#e5e7df':'#555958');g.restore();
  }
 }
 for(const cx of [149,207]){rect(cx,12,4,24,'#686d69');rect(cx,12,1,23,'#d8dbd4');rect(cx-1,33,6,3,'#a1a59f')}
 rect(148,10,64,3,'#b8bbb6');rect(150,10,60,1,'#e0e2dc');
 if(open>.05){for(let i=0;i<7;i++){const progress=(t*.8+i*.147)%1;rect(180+Math.sin(i*4)*open*(13-9*progress),32-progress*15,1,2,'#636669')}}
}
function crossingSoul(age){
 const align=ease(age/.76),pull=ease((age-1.22)/1.19),lift=Math.sin(t*3)*.65+pull*2;
 const px=hallX+(180-hallX)*align,ground=hallY+(15-hallY)*pull;
 // Layer translucent shadow pixels over the actual stone and inlay beneath them.
 const w=4+Math.round(lift*.5);g.save();g.globalAlpha=.19*(1-pull);rect(px-w,ground+4,w*2+1,2,'#151619');rect(px-w+2,ground+3,w*2-3,4,'#151619');
 g.globalAlpha=.29*(1-pull);rect(px-2,ground+4,5,2,'#141416');g.restore();
 g.save();g.beginPath();g.rect(100,17,160,410);g.clip();g.globalAlpha=1-ease((age-2.12)/.36);tinySoul(px,ground-lift);g.restore();
}
const watchers=[[19,43,9],[51,78,17],[85,29,12],[127,53,9],[95,105,8],[16,102,6],[142,95,6],[221,34,7],[239,94,10],[263,57,18],[305,29,10],[337,78,15],[301,106,7],[350,41,5],[33,22,6],[61,48,8],[108,73,6],[126,19,6],[153,38,5],[183,24,10],[209,104,6],[244,18,6],[287,82,8],[325,49,6],[354,106,5],[70,111,5]];
function eyePresence(i){const lag=((i*11)%26)/25*.48;
 if(mode==='reform')return ease((sceneAge-.8-lag)/.94);
 if(mode==='destroy')return 1-ease((sceneAge-.12-lag)/1.12);
 return 1}
function watchingEyes(){watchers.forEach(([cx,cy,r],i)=>{
 const visible=eyePresence(i);if(visible<=0)return;g.save();g.globalAlpha*=visible;
 const phase=(t+i*.71)%(3.3+i*.09),lid=visible*ease(Math.abs(phase-.31)/(phase<.31?.25:.38)), gaze=Math.round(Math.max(-1,Math.min(1,(x-cx)/80))*r*.31);
 for(let u=-r;u<=r;u++){
 const h=Math.round((1-(Math.abs(u)/r)**1.6)*r*.43*lid),v=Math.round(u*(i%2?.12:-.12));
 const roof=cy+v-h,base=cy+v+h;rect(cx+u,roof-2,1,1,'#392940');rect(cx+u,roof-1,1,1,'#91699e');rect(cx+u,roof,1,2*h+1,'#71557a');rect(cx+u,base+1,1,1,'#49354f');if(h<2)continue;
 for(let k=1-h;k<h;k++){const du=u-gaze,d=du*du+(k-1)**2,rad=r*.32;let color=k<2-h?'#58425f':'#927a99';if(d<rad*rad)color=d>(rad-1)**2?'#46304f':k<0?'#9462ad':'#bf8bd0';if(Math.abs(du)<=Math.max(0,1-Math.abs(k)*.18)&&d<rad*rad)color='#29182e';if(du===-1&&k===-1)color='#ead9ed';rect(cx+u,cy+v+k,1,1,color)}
 }g.restore();
})}
// Each letter is a fitted shard. Separating actual pieces exposes the void between them.
const shell=['    AA  B B    ','    AAA BBB    ','  AAAAAACBBBB  ',' AAAAAACCCBBBB ','DAAAAACCCCBBBBE','DDAAACCCCCBBEEE',' DDAACCCCCBEEE ','  DDDACCCCEEEE ','   DDDCCCEEEE  ','    DDCCCEEE   ','     FFFFEE    ','      FFFF     ','       FF      '];
const drift={A:[-7,-6],B:[6,-8],C:[0,-1],D:[-9,4],E:[8,5],F:[1,10]};
// Cache a ramp for each value band so the lighting stays consistent as color returns.
const heartRamp=Array.from({length:65},(_,k)=>[[255,254,250,246,223,255],[227,224,217,203,145,243],[197,193,187,161,101,200],[156,153,150,113,62,147]].map(c=>'rgb('+[0,1,2].map(i=>Math.round(c[i]+(c[i+3]-c[i])*k/64)).join(',')+')'));
const pivots={A:[3,2],B:[11,2],C:[7,5],D:[4,5],E:[11,5],F:[7,9]};
// Rasterize each solid shard before rotation: adjacent texels share one transform.
const shardCache=new Map();
function shardSprite(id,tone){const key=id+tone;if(shardCache.has(key))return shardCache.get(key);
 const tile=document.createElement('canvas');tile.width=45;tile.height=shell.length*3;const ctx=tile.getContext('2d'),pal=heartRamp[tone];
 const solid=(i,j)=>!!shell[j]?.[i]?.trim();
 shell.forEach((row,j)=>[...row].forEach((cell,i)=>{if(cell!==id)return;
  const rim=!solid(i+1,j)||!solid(i,j+1),ridge=!solid(i-1,j)||!solid(i,j-1);
  const shade=rim?3:ridge?1:j>6||i>11?2:1;
  ctx.fillStyle=pal[shade];ctx.fillRect(3*i,3*j,3,3);
  if((i===2&&j===2)||(i===3&&j===1)||(i===10&&j===1)){ctx.fillStyle=pal[0];ctx.fillRect(3*i,3*j,3,2)}
  // A curved coronary groove branches over the rounded ventricular face.
  const vein=[-1,-1,-1,7,7,8,8,7,6,6,5][j];
  if(!rim&&(i===vein||(j>=5&&j<=7&&i===vein+j-4))){ctx.fillStyle=pal[2];ctx.fillRect(3*i+1,3*j,1,3);ctx.fillStyle=pal[1];ctx.fillRect(3*i+2,3*j,1,2)}
 }));shardCache.set(key,tile);return tile}
function heartOpponent(){
 if(mode==='end'&&boss===0)return;
 const forming=mode==='reform',breaking=mode==='destroy',hit=mode==='heartHit';
 const tint=purple?1:forming?ease((sceneAge-.64)/1.48):0;
 if(tint>0)watchingEyes();
 const order=purple?'BAFEDC':'ADEBFC',total=purple?5:4,n=cracks===total?6:cracks;
 const progress=hit?ease((sceneAge-.20)/.32):1;
 g.save();if(breaking)g.globalAlpha=1-ease((sceneAge-.8)/.95);
 g.imageSmoothingEnabled=false;
 // A small double beat reads as living tissue; release it before the shards fly.
 const beat=(t*(purple?1.3:1.02))%1,bump=(Math.exp(-((beat-.17)**2)/.003)+.38*Math.exp(-((beat-.37)**2)/.004))*(1-(forming||breaking?ease(sceneAge/.35):0));
 g.translate(180,73);g.scale(1+.035*bump,1-.024*bump);g.translate(-180,-73);
 for(const id of order){const index=order.indexOf(id),[dx,dy]=drift[id],[cx,cy]=pivots[id];
  const gap=count=>index<count?.24+.13*(count-index):0;
  const prev=hit?gap(Math.max(0,cracks-1)):gap(n);
  const bind=forming?1-ease((sceneAge-.91-index*.055)/.84):1;
  const burst=breaking?ease(sceneAge/1.45):forming?ease(sceneAge/.69)*bind:0;
  const offset=(prev+(gap(n)-prev)*progress)*bind+burst*2.7;
  const angle=(dx<0?-1:1)*burst*(.36+.07*index);
  g.save();g.translate(Math.round(158+cx*3+dx*offset),Math.round(52+cy*3+dy*offset+Math.sin(t*2)*1.5));g.rotate(angle);g.drawImage(shardSprite(id,Math.round(64*tint)),-cx*3,-cy*3);g.restore();
 }g.restore();if(hit)slash(sceneAge*1.6,false);
}
function heartAction(a){if(mode!=='ready')return;if(a==='fight'){cracks++;boss=Math.max(0,100-100*cracks/(purple?5:4));mode='heartHit';sceneAge=0;sampleCue((purple?'violet':'white')+cracks);msg(`Fracture ${cracks} / ${purple?5:4}.`)}else{if(purple)return;if(a==='item'){if(!food){sampleCue('empty');msg('No pie left.');return}sfx('heal');food--;hp=Math.min(20,hp+8);msg(`Pie restores your soul. ${food} left.`)}else msg(a==='act'?'You call out. No answer.':'You offer mercy. Its pulse stays steady.');startWave(.55)}ui()}
const seamPattern=['seam','seam-slip','seam','seam-freeze','seam-slip'];
function seamBeat(dt,level){const beat=Math.floor(t*4.5);if(beat!==Math.floor((t-dt)*4.5))sampleCue(seamPattern[beat%seamPattern.length],1,level)}
function chapterTick(dt){if(mode==='hall'){moveInHall(dt);if(hallY<133)seamBeat(dt,mode==='portal'?.7:.45+.55*ease((133-hallY)/90));return true}
 if(mode==='portal'){seamBeat(dt,.7);const before=sceneAge;sceneAge+=dt;if(before<.48&&sceneAge>=.48)sampleCue('seal-open');if(before<1.22&&sceneAge>=1.22){sampleCue('rift');msg('The seam opens. Your shadow stays on the stone.')}if(before<2.54&&sceneAge>=2.54)sampleCue('seal-close');if(sceneAge>=CROSS_END)enterHeart();return true}
 if(!heartBusy())return false;sceneAge+=dt;
 if(mode==='heartHit'&&sceneAge>=1.05){if(boss>0)startWave(.5);else{sfx('shatter');mode=purple?'destroy':'reform';sceneAge=0;msg(purple?'The last eye closes.':'The pieces stop falling. Something pulls them back.')}ui()}
 else if(mode==='reform'&&sceneAge>=2.25){sfx('reform');sfx('awaken');purple=true;cracks=0;boss=100;mode='ready';msg('The heart reforms in violet. Only FIGHT responds.');ui()}
 else if(mode==='destroy'&&sceneAge>=1.9){mode='end';msg('The violet heart is gone. Select an action to replay.');ui()}return true}
