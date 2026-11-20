// Beyond the wall: hallway traversal and the two forms of the sixth opponent.
let glideDistance=0;
let hallX=180,hallY=398,sceneAge=0,purple=false,cracks=0;
const walking=()=>mode==='hall'||mode==='portal'||mode==='room';
const heartBusy=()=>['heartHit','reform','destroy'].includes(mode);
function enterHall(){encounter=6;resetBattle();glideDistance=0;hallX=180;hallY=398;sceneAge=0;keys.clear();purple=false;cracks=0;mode='hall';msg('Follow the stone inlay north. Move with arrows / WASD, or hold and drag.');ui()}
function enterHeart(){encounter=6;resetBattle();cracks=0;purple=false;sceneAge=0;msg('A white heart hangs still on the other side.');ui()}
const soulInk=[' pp rr ','phrrrbr','prrrrbd',' rrbbd ','  bbd  ','   d   '];
const soulColor={p:'#ff99a4',h:'#ffd9ce',r:'#ff465c',b:'#d82f51',d:'#a12245'};
function tinySoul(cx,cy){soulInk.forEach((row,j)=>[...row].forEach((v,i)=>{if(soulColor[v])rect(cx+i-3,cy+j-3,1,1,soulColor[v])}))}
// World coordinates are in floor pixels; the camera never scales or rotates.
const HALL_NORTH=38,HALL_SOUTH=410;
const hallClamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const HALL_LEFT=72,HALL_WIDTH=216,HALL_HEIGHT=438;
function hallWidth(y){return (y>=154&&y<=254)?87:65}
// Inclusive floor spans on each raster row, including the shoulders of the landing.
// Check the silhouette rather than its centre: the tip can approach a ledge
// without either lobe passing through it. Reserve both extremes of the hall bob.
const soulSpans=soulInk.map((row,i)=>[i-3,row.search(/\S/)-3,row.trimEnd().length-4]);
function soulFits(px,py,room){
 const cx=Math.round(px),top=Math.round(py-(room?1:.65)),bottom=Math.round(py+(room?-1:.65));
 for(const [dy,l,r] of soulSpans)for(let y=top+dy;y<=bottom+dy;y++){
  const left=cx+l,right=cx+r;
  if(room){
   if(y<66||y>=372||left<94||right>=266)return false;
   if(y>=369&&left<212&&right>=148)return false; // closed south door
   if((y<70||y>=369)&&(left<97||right>=263))return false; // pier bases
  }else{
   if(y<32||y>=415)return false;
   // The three dark pixels beneath the stone are a cast shadow, not masonry.
   const wide=y>=157&&y<251,edge=wide?93:115;
   if(wide&&(y<162||y>=247)&&(left<97||right>=263))return false; // projecting pier feet
   if(left<edge||right>=360-edge)return false;
   if((y<36&&left<212&&right>=148)||(y>=414&&left<204&&right>=156))return false;
  }
 }
 return true;
}
function moveInHall(dt){
 let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 let step=92*dt;
 if(drag&&target){dx=target[0]+HALL_LEFT-hallX;dy=target[1]-hallY;step=Math.min(step,Math.hypot(dx,dy))}
 const len=Math.hypot(dx,dy);if(!len)return;
 const oldX=hallX,oldY=hallY,room=mode==='room';
 // At most one pixel per axis per probe; resolve independently to slide on contact.
 const steps=Math.ceil(step);for(let n=0;n<steps;n++){
  const nx=hallX+dx/len*step/steps,ny=hallY+dy/len*step/steps;
  if(soulFits(nx,hallY,room))hallX=nx;
  if(soulFits(hallX,ny,room))hallY=ny;
 }
 if(room)return;
 glideDistance+=Math.hypot(hallX-oldX,hallY-oldY);if(glideDistance>=48){glideDistance%=48;sfx('drift')}
 if(hallY<=HALL_NORTH+3&&Math.abs(hallX-180)<23){mode='portal';sfx('static');sceneAge=0;drag=false;target=null;msg('The stone slips out of place. Beyond it, a heartbeat.');ui()}
}
// Shallow chips and mineral veins cut into individual flagstones, not the grout.
const stoneMarks=[['  ll',' ll ','dd  '],['    d','  ddd',' dd  ','dl   '],['lld',' dd'],['l   l','   ld']];
function flagstone(a,b,i,j){
 const seed=(i*73+j*137+i*j*13)%97;
 rect(a,b,31,15,['#777979','#747676','#797b7a','#767877'][seed%4]);
 rect(a+1,b,29,1,'#818382');rect(a+2,b+14,28,1,'#696c6b');
 if(seed%4===0){const mark=stoneMarks[(seed>>2)%4];mark.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!==' ')rect(a+4+seed%17+x,b+3+seed%5+y,1,1,v==='l'?'#8a8c88':'#626564')}))}
}
// Hand-pixelled architectural details, baked once so the moving soul stays cheap.
const hallTones={k:'#36393a',d:'#535657',s:'#727577',m:'#959896',l:'#b8bbb6',h:'#dcdfd6',w:'#f0f1e8'};
const hallArt={
 lantern:['    kk    ','   kmlk   ','  kmlhlk  ',' kddmmddk ',' kshhhmdk ',' kslwwldk ',' kslwwldk ',' kslhhldk ',' kddmmddk ','  kmlldk  ','   kmdk   ','    dk    '],
 plinth:['  llllllll  ',' llhhhhhhll ',' mmmmmmmmsd ','  smlmmlds  ','  smlmmlds  ','  smlmmlds  ','  smlmmlds  ',' smllllllms ',' llhhhhhhld ',' mmmmmmmmsd ','  dddddddd  '],
 relief:['    sss    ','   smlms   ','  smlhlms  ',' smlmdmlms ','smlmdsdmlms','slhdshsdmls','smlmdsdmlms',' smlmdmlms ','  smlhlms  ','   smlms   ','    sss    ']};
const hallStamps=new Map();
function stoneStamp(name,cx,y){let img=hallStamps.get(name);if(!img){const rows=hallArt[name];img=document.createElement('canvas');img.width=rows[0].length;img.height=rows.length;const ctx=img.getContext('2d');rows.forEach((row,j)=>[...row].forEach((p,i)=>{if(hallTones[p]){ctx.fillStyle=hallTones[p];ctx.fillRect(i,j,1,1)}}));hallStamps.set(name,img)}g.drawImage(img,cx-(img.width>>1),y)}
let galleryBackdrop;
function enterRoom(){mode='room';hallX=180;hallY=346;keys.clear();drag=false;target=null;msg('The door behind you is sealed. The room is empty.');ui()}
// Bake the floor at room scale; the open doorway samples its actual entrance stones.
let roomTiles;
function roomFloor(){
 if(roomTiles)return roomTiles;
 const tile=document.createElement('canvas');tile.width=170;tile.height=304;
 const ctx=tile.getContext('2d'),ink=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 ink(0,0,170,304,'#515456');
 for(let j=0;j<19;j++)for(let i=-1;i<7;i++){
  const x=i*28+(j%2)*14,y=j*16,k=(11*i+7*j+33)%5;
  ink(x,y,27,15,['#787b7b','#747879','#767a7a','#797c7c','#757879'][k]);ink(x+1,y,25,1,'#848787');ink(x+1,y+14,24,1,'#696d6e');
  if(k===2){ink(x+5,y+9,3,1,'#696d6e');ink(x+8,y+8,2,1,'#696d6e')}
 }
 for(const n of [6,9]){const tone=n===6?'#565b5c':'#9a9e9c';ink(n,n,170-2*n,1,tone);ink(n,n,1,304-2*n,tone);ink(169-n,n,1,304-2*n,tone);ink(n,303-n,170-2*n,1,tone)}
 // A recessed octagonal pavement seal, not an object in the walkable area.
 for(let y=-16;y<=16;y++){const w=Math.min(17,24-Math.abs(y));for(const sign of [-1,1]){ink(85+sign*w,152+y,1,1,'#575c5c');ink(85+sign*(w-2),152+y,1,1,'#999d9a')}if(Math.abs(y)>=15)ink(85-w,152+y,w*2+1,1,'#838885')}
 for(let y=-7;y<=7;y++){const w=7-Math.abs(y);ink(85-w,152+y,2*w+1,1,'#959996');if(w>1)ink(86-w,152+y,2*w-1,1,'#6a7070')}
 roomTiles=tile;return tile;
}
function chamber(){
 rect(72,0,216,438,'#101112');rect(84,48,192,336,'#35393a');rect(87,50,186,19,'#54595a');
 for(let i=0;i<8;i++){const x=88+i*23;rect(x,52,22,11,'#818585');rect(x+1,52,20,1,'#a7aaa7');rect(x,62,22,2,'#656a6b')}
 for(const x of [88,265]){rect(x,66,7,306,'#666b6c');rect(x+2,66,2,306,'#969b99');for(let y=68;y<371;y+=32)rect(x,y,7,2,'#494e4f')}
 g.drawImage(roomFloor(),95,68);rect(94,68,1,304,'#414345');rect(265,68,1,304,'#414345');rect(95,66,170,2,'#414345');rect(88,372,184,4,'#848887');rect(88,376,184,5,'#515657');
 for(const x of [91,269])for(const y of [59,369])stoneStamp('plinth',x,y);
 g.save();g.translate(0,405);g.scale(1,-1);threshold(-1);g.restore();
 rect(hallX-3,hallY+3,7,2,'#494c4d');tinySoul(hallX,hallY-1);
}
function hallway(){
 g.save();g.translate(-HALL_LEFT,0);
 if(!galleryBackdrop){
  paintGallery();
  // Reflect the finished west masonry about the boundary between the two
  // middle pixels. This pairs even-width fixtures and odd-width inlays alike.
  const half=HALL_WIDTH/2;
  galleryBackdrop=document.createElement('canvas');galleryBackdrop.width=HALL_WIDTH;galleryBackdrop.height=HALL_HEIGHT;
  const bg=galleryBackdrop.getContext('2d');bg.drawImage(g.canvas,0,0,half,HALL_HEIGHT,0,0,half,HALL_HEIGHT);
  bg.translate(HALL_WIDTH,0);bg.scale(-1,1);bg.drawImage(g.canvas,0,0,half,HALL_HEIGHT,0,0,half,HALL_HEIGHT);
 }
 g.drawImage(galleryBackdrop,HALL_LEFT,0);
 const age=mode==='portal'?sceneAge:-1;threshold(age);crossingSoul(age);
 g.restore();
}

function paintGallery(){
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
  const a=180+side*(hallWidth(py)+7);
  // Narrow bands of lamplight wash across the adjacent stone, never over the soul.
  g.save();for(let k=0;k<4;k++){const span=16-k*3;g.globalAlpha=.025+k*.012;rect(side<0?a+7:a-7-span,py-7+k,span,15-2*k,'#edece2')}g.restore();
  stoneStamp('lantern',a,py-6)}
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
 // Four capped piers frame the landing. The grilles read as recessed ironwork.
 for(const side of [-1,1]){
  for(const py of [151,247])stoneStamp('plinth',180+side*84,py);
  const ax=180+side*74;rect(ax-3,187,1,35,'#777b79');rect(ax+2,187,1,35,'#656a68');
  for(const py of [187,220]){rect(ax-4,py,2,2,'#b4b6b0');rect(ax+3,py,1,1,'#a8aba7')}
  for(const py of [80,330])stoneStamp('relief',180+side*22,py-5);
  stoneStamp('relief',180+side*49,18);
 }
 // Compass points continue outside the mosaic rather than crossing its face.
 for(let k=0;k<5;k++){const n=5-k;rect(180-n,182+k,n,1,'#aeb1ab');rect(180,182+k,n,1,'#717572');rect(180-k,226+k,Math.max(1,k*2),1,'#898d88')}
}
// Carved twin leaves share one broken seal. Slice the artwork, not the frame.
const CROSS_END=3.25;
function threshold(age){
 const active=age>=0,open=active?ease((age-.48)/.92)*(1-ease((age-2.54)/.66)):0;
 const beat=Math.floor(t*4.5),phase=t*4.5-beat,near=1-ease((hallY-38)/95);
 rect(150,12,60,24,'#36383a');rect(152,14,56,21,'#15171a');
 // Keep the hallway camera fixed. The sliding leaves occlude this patch naturally.
 if(open>0){
  // Compress the last few courses into the recess; the threshold stays fixed
  // while only the fractured leaves slip. Nearest-neighbour keeps the grout crisp.
  g.save();g.imageSmoothingEnabled=false;g.drawImage(roomFloor(),43,260,84,44,152,14,56,21);
  for(let k=0;k<4;k++){g.globalAlpha=.09*(4-k);rect(152,14+k,56,1,'#202429')}
  g.globalAlpha=1;rect(152,33,56,1,'#a2a6a2');rect(152,34,56,1,'#626665');g.restore();
 }
 for(let row=0;row<21;row++){
  const band=row>>2,slips=band===(beat*3)%5;
  const tear=slips?(beat%2?-1:1)*(phase<.32?3+Math.round(near*3):phase<.56?1:0):0;
  const tooth=[0,0,-2,-2,1,1][Math.floor(row/2)%6];
  for(const side of [-1,1]){
   const dx=tear+side*Math.round(open*23),left=side<0?153:180+tooth,right=side<0?180+tooth:207;
   g.save();g.beginPath();g.rect(152,14+row,56,1);g.clip();
   rect(left+dx,14+row,right-left,1,row===0?'#ebece6':row%8===7?'#656967':'#a4a7a3');
   // Contact shadow hugs the room-facing edge, never the hallway floor.
   if(open>0){const lip=(side<0?right:left)+dx;g.globalAlpha=.4*open;rect(side<0?lip:lip-2,14+row,2,1,'#24272a');g.globalAlpha=.17*open;rect(side<0?lip+2:lip-4,14+row,2,1,'#24272a');g.globalAlpha=1}
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
const shell=['  AAA     BBB  ',' AAAAA   BBBBB ','AAAAAAACBBBBBBB','AAAAAACCCBBBBBB','DAAAAACCCCBBBBE',' DDAAACCCCBBEE ','  DDDACCCCEEE  ','   DDDCCCEEE   ','    DDCCCEE    ','     FFFCE     ','      FFF      ','       F       '];
const drift={A:[-7,-6],B:[6,-8],C:[0,-1],D:[-9,4],E:[8,5],F:[1,10]};
// Cache a ramp for each value band so the lighting stays consistent as color returns.
const heartRamp=Array.from({length:65},(_,k)=>[[255,252,243,248,226,255],[243,238,228,222,181,249],[226,222,216,198,143,235],[204,202,202,170,108,211],[177,178,184,143,84,181],[148,150,161,111,66,146],[116,120,133,82,48,112]].map(c=>'rgb('+[0,1,2].map(i=>Math.round(c[i]+(c[i+3]-c[i])*k/64)).join(',')+')'));
const pivots={A:[3,2],B:[11,2],C:[7,5],D:[4,5],E:[11,5],F:[7,9]};
// Rasterize each solid shard before rotation: adjacent texels share one transform.
// Shade the unbroken silhouette once. Each shard inherits those exact pixels,
// so cut edges cannot leave a dark grid when the pieces come back together.
const shardPixels=Object.fromEntries(Object.keys(drift).map(id=>[id,[]]));
const cellAt=(px,py)=>shell[py>>1]?.[px>>1]?.trim();
for(let py=0;py<shell.length*2;py++)for(let px=0;px<30;px++){
 const id=cellAt(px,py);if(!id)continue;
 const lobe=px<15?7:21;
 const gleam=((px-lobe+2)/4.6)**2+((py-3)/2.8)**2;
 let band=gleam<.48?0:gleam<1.5?1:2;
 // Broad lower-right penumbra, then a narrow contact edge and reflected light.
 if(!cellAt(px+4,py+4))band=Math.max(band,3);
 if(!cellAt(px+2,py+3))band=Math.max(band,4);
 if(!cellAt(px+1,py+1))band=5;
 if(!cellAt(px,py+1)&&py>8)band=6;
 if(px>=22&&py>=8&&py<=13&&!cellAt(px+1,py)&&cellAt(px-1,py+1))band=4;
 const left=Math.floor(px*1.5),top=Math.floor(py*1.5);
 shardPixels[id].push([left,top,Math.floor((px+1)*1.5)-left,Math.floor((py+1)*1.5)-top,band]);
}
const shardCache=new Map();
function shardSprite(id,tone){const key=id+tone;if(shardCache.has(key))return shardCache.get(key);
 const tile=document.createElement('canvas');tile.width=45;tile.height=shell.length*3;const ctx=tile.getContext('2d'),pal=heartRamp[tone];
 for(const [x,y,w,h,band] of shardPixels[id]){ctx.fillStyle=pal[band];ctx.fillRect(x,y,w,h)}
 shardCache.set(key,tile);return tile}
function heartOpponent(){
 if(mode==='look'||mode==='end'&&boss===0)return;
 const forming=mode==='reform',breaking=mode==='destroy',hit=mode==='heartHit';
 const tint=purple?1:forming?ease((sceneAge-.64)/1.48):0;
 if(tint>0)watchingEyes();
 const order=purple?'BAFEDC':'ADEBFC',total=purple?5:4,n=cracks===total?6:cracks;
 const progress=hit?ease((sceneAge-.20)/.32):1;
 g.save();if(breaking)g.globalAlpha=1-ease((sceneAge-2.55)/.82);
 g.imageSmoothingEnabled=false;
 for(const id of order){const index=order.indexOf(id),[dx,dy]=drift[id],[cx,cy]=pivots[id];
  const gap=count=>index<count?.24+.13*(count-index):0;
  const prev=hit?gap(Math.max(0,cracks-1)):gap(n);
  const bind=breaking?1-ease((sceneAge-.62-index*.045)/1.12):forming?1-ease((sceneAge-.91-index*.055)/.84):1;
  const burst=breaking?ease(sceneAge/.55)*bind:forming?ease(sceneAge/.69)*bind:0;
  const offset=(prev+(gap(n)-prev)*progress)*bind+burst*2.7;
  const angle=(dx<0?-1:1)*burst*(.36+.07*index);
  g.save();g.translate(Math.round(158+cx*3+dx*offset),Math.round(52+cy*3+dy*offset));g.rotate(angle);g.drawImage(shardSprite(id,Math.round(64*tint)),-cx*3,-cy*3);g.restore();
 }g.restore();if(hit)slash(sceneAge*1.6,false);
 if(purple&&cracks===5&&(hit||breaking)){const age=hit?sceneAge:sceneAge+1.05;
  for(let i=0;i<52;i++){const f=i/51,u=age-.46-f*.22;if(u<0||u>1.18)continue;
   const px=154+i+Math.sin(i*19)*u*7,py=98-40*f-5*Math.sin(f*Math.PI)-u*(5+i%8)+u*u*22;
   g.save();g.globalAlpha=(1-ease((u-.46)/.72))*ease(u/.1);rect(px,py,2,2,'#535056');rect(px,py,2,1,'#111014');g.restore()}
 }
}
function heartAction(a){if(mode!=='ready')return;if(a==='fight'){cracks++;boss=Math.max(0,100-100*cracks/(purple?5:4));mode='heartHit';sceneAge=0;sampleCue((purple?'violet':'white')+cracks);msg(`Fracture ${cracks} / ${purple?5:4}.`)}else{if(purple)return;if(a==='item'){if(!food){sampleCue('empty');msg('No pie left.');return}sfx('heal');food--;hp=Math.min(20,hp+8);msg(`Pie restores your soul. ${food} left.`)}else msg(a==='act'?'You call out. No answer.':'You offer mercy. Its pulse stays steady.');startWave(.55)}ui()}
const seamPattern=['seam','seam-slip','seam','seam-freeze','seam-slip'];
function seamBeat(dt,level){const beat=Math.floor(t*4.5);if(beat!==Math.floor((t-dt)*4.5))sampleCue(seamPattern[beat%seamPattern.length],1,level)}
function chapterTick(dt){if(mode==='room'){moveInHall(dt);if(hallY>321)seamBeat(dt,.32);return true}if(mode==='look')return true;if(mode==='hall'){moveInHall(dt);if(hallY<133)seamBeat(dt,mode==='portal'?.7:.45+.55*ease((133-hallY)/90));return true}
 if(mode==='portal'){seamBeat(dt,.7);const before=sceneAge;sceneAge+=dt;if(before<.48&&sceneAge>=.48)sampleCue('seal-open');if(before<1.22&&sceneAge>=1.22){sampleCue('rift');msg('The seam opens. Your shadow stays on the stone.')}if(before<2.54&&sceneAge>=2.54)sampleCue('seal-close');if(sceneAge>=CROSS_END)enterHeart();return true}
 if(!heartBusy())return false;sceneAge+=dt;
 if(mode==='heartHit'&&sceneAge>=1.05){if(boss>0)startWave(.5);else{sampleCue('soul-scatter',purple?.78:1.08);mode=purple?'destroy':'reform';sceneAge=0;msg(purple?'The last eye closes.':'The pieces stop falling. Something pulls them back.')}ui()}
 else if(mode==='reform'&&sceneAge>=2.25){sfx('reform');sfx('awaken');purple=true;cracks=0;boss=100;mode='ready';msg('The heart reforms in violet. Only FIGHT responds.');ui()}
 else if(mode==='destroy'){
  if(sceneAge-dt<.78&&sceneAge>=.78)sfx('reform');
  const restored=Math.round(100*ease((sceneAge-.62)/1.36));if(boss!==restored){boss=restored;ui()}
  if(sceneAge>=3.42){cracks=0;mode='look';msg('The violet heart is gone. Press anything to look around.');ui()}
 }return true}
