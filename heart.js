// Beyond the wall: hallway traversal and the two forms of the sixth opponent.
let glideDistance=0;
let hallX=180,hallY=398,sceneAge=0,purple=false,cracks=0;
const walking=()=>mode==='visitor'||mode==='hall'||mode==='portal'||mode==='room';
const heartBusy=()=>['heartHit','reform','destroy'].includes(mode);
function enterHall(){encounter=6;resetBattle();glideDistance=0;hallX=180;hallY=398;sceneAge=0;keys.clear();purple=false;cracks=0;mode='hall';msg('Follow the stone inlay north. Move with arrows / WASD, or hold and drag.');ui()}
function enterHeart(){encounter=6;resetBattle();cracks=0;purple=false;sceneAge=0;msg('A white heart hangs still on the other side.');ui()}
const soulInk=[' pp rr ','phrrrbr','prrrrbd',' rrbbd ','  bbd  ','   d   '];
const soulColor={p:'#ff99a4',h:'#ffd9ce',r:'#ff465c',b:'#d82f51',d:'#a12245'};
const exploreInk=[' ppp rrr ','phrrprrrb','prrrrrrbb',' rrrrrbd ','  rrrbd  ','   bbd   ','    d    '];
function tinySoul(cx,cy,ink=soulInk){const ox=ink[0].length>>1;ink.forEach((row,j)=>[...row].forEach((v,i)=>{if(soulColor[v])rect(cx+i-ox,cy+j-3,1,1,soulColor[v])}))}
// World coordinates are in floor pixels; the camera never scales or rotates.
const HALL_NORTH=38,HALL_SOUTH=410;
const hallClamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const HALL_LEFT=72,HALL_WIDTH=216,HALL_HEIGHT=438;
function hallWidth(y){return (y>=154&&y<=254)?87:65}
// Inclusive floor spans on each raster row, including the shoulders of the landing.
// Check the silhouette rather than its centre: the tip can approach a ledge
// without either lobe passing through it. Reserve both extremes of the hall bob.
const soulSpans=exploreInk.map((row,i)=>[i-3,row.search(/\S/)-4,row.trimEnd().length-5]);
function soulFits(px,py,room){
 const cx=Math.round(px),top=Math.round(py-(room?1:.65)),bottom=Math.round(py+(room?-1:.65));
 for(const [dy,l,r] of soulSpans)for(let y=top+dy;y<=bottom+dy;y++){
  const left=cx+l,right=cx+r;
  if(room){
   if(roomFurniture.some(([x,b,w,h])=>y>=b&&y<b+h&&left<x+w&&right>=x))return false;
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
// Distance to the book itself, not the canvas pointer or the room entrance.
function canReadStudyBook(){return Math.hypot(Math.max(166-hallX,0,hallX-194),Math.max(205-hallY,0,hallY-225))<=24}
function enterRoom(){mode='room';hallX=180;hallY=346;keys.clear();drag=false;target=null;msg('The door behind you is sealed. Approach the desk and tap the open book to read it.');ui()}
// Bake the floor at room scale; the open doorway samples its actual entrance stones.
let roomTiles;
function roomFloor(){
 if(roomTiles)return roomTiles;
 const tile=document.createElement('canvas');tile.width=170;tile.height=304;
 const ctx=tile.getContext('2d'),ink=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 ink(0,0,170,304,'#515456');
 // Offset courses of irregular cut slate. Highlights follow the upper lip;
 // worn centres are broad and quiet so they do not compete with the soul.
 let seed=931;const pick=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed>>>8)%n};
 for(let j=0;j<19;j++){const y=j*16;for(let x=-pick(22);x<170;){const w=22+pick(16),k=pick(4);
 ink(x,y,w-1,15,['#767a78','#797d7b','#717674','#757977'][k]);ink(x+2,y,w-5,1,'#858984');ink(x+1,y+14,w-3,1,'#686d6a');
 if(k===0){const v=x+5+pick(w-16),b=y+4+pick(6);ink(v,b,5,1,'#808480');ink(v+5,b-1,3,1,'#808480')}
 if(k===2){ink(x+w-4,y+13,3,1,'#646966');ink(x+w-2,y+12,1,1,'#686c69')}x+=w}}
 for(const n of [6,9]){const tone=n===6?'#565b5c':'#9a9e9c';ink(n,n,170-2*n,1,tone);ink(n,n,1,304-2*n,tone);ink(169-n,n,1,304-2*n,tone);ink(n,303-n,170-2*n,1,tone)}
 // A recessed octagonal pavement seal, not an object in the walkable area.
 for(let y=-16;y<=16;y++){const w=Math.min(17,24-Math.abs(y));for(const sign of [-1,1]){ink(85+sign*w,152+y,1,1,'#575c5c');ink(85+sign*(w-2),152+y,1,1,'#999d9a')}if(Math.abs(y)>=15)ink(85-w,152+y,w*2+1,1,'#838885')}
 for(let y=-7;y<=7;y++){const w=7-Math.abs(y);ink(85-w,152+y,2*w+1,1,'#959996');if(w>1)ink(86-w,152+y,2*w-1,1,'#6a7070')}
 roomTiles=tile;return tile;
}
// Freestanding furniture is scenery only. Bounds are shared with movement.
const roomFurniture=[[95,169,22,40],[95,211,22,40],[95,303,22,40],[95,345,22,24],[243,303,22,40],[243,345,22,24],[149,198,62,38]];
// Draw each cabinet once at game resolution. Local +x runs from wall to aisle.
const shelfTiles=new Map();
// Parallel height edges drop one pixel east for every two south. Orientation
// changes the contents of a case, never the projection or the light source.
function furnitureBody(x,y,w,h,depth,top){
 const dx=depth/2,tw=w-dx,th=h-depth;
 g.save();g.globalAlpha=.12;rect(x+2,y+2,w,h,'#262322');g.globalAlpha=.22;rect(x+2,y+2,w-1,h-1,'#262322');g.restore();
 for(let z=depth;z>0;z--){const sx=Math.ceil(z/2);
  rect(x+sx,y+z,tw,th,'#675544');rect(x+sx,y+th+z-1,tw,1,z===depth?'#463c35':'#796553');}
 rect(x,y,tw,th,top);rect(x+1,y,tw-2,1,'#b39a7b');rect(x,y+1,1,th-2,'#a38d74');
 return [tw,th];
}
function studyShelf(x,y,w,h,seed){
 const east=x>180;
 let tile=shelfTiles.get(seed);
 if(!tile){tile=document.createElement('canvas');tile.width=w;tile.height=h;
  const c=tile.getContext('2d'),tw=w-3,th=h-6;
  // Work in cabinet coordinates. Mirror only the plan: every upright projects
  // three pixels right and six down, regardless of which wall it stands against.
  const plank=(u,v,ww,hh,z,col)=>{c.fillStyle=col;c.fillRect((east?tw-u-ww:u)+Math.ceil(z/2),v+z,ww,hh)};
  const timber=(u,v,ww,hh,deep)=>{for(let z=deep;z>0;z--){plank(u,v,ww,hh,z,'#645041');plank(u,v+hh-1,ww,1,z,'#796553')}
   plank(u,v,ww,hh,0,'#94785e');plank(u,v,ww,1,0,'#b39a7b');};
  let state=317+seed;const roll=n=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return (state>>>8)%n};
  const cloth=['#805759','#516e72','#71755a','#9a7652','#746577','#776149','#596878'];
  // One continuous carcass: cut wells into the top rather than drawing four
  // overlapping extruded beams (which used to leave doubled corner seams).
  timber(0,0,tw,th,6);
  const bays=h>30?2:1,back=4,opening=tw-back-1;
  plank(1,3,1,th-6,0,'#a38d74');plank(2,th-8,1,4,0,'#806950');
  for(let bay=0;bay<bays;bay++){
   const start=2+Math.floor(bay*(th-2)/bays),end=Math.floor((bay+1)*(th-2)/bays);
   plank(back,start,opening,end-start,0,'#4c403a');
   plank(back,start,opening,1,0,'#403733');
   if(bay)plank(back,start-2,opening,1,0,'#b39a7b');
   // Divide the whole bay among complete spines. Spread the spare pixels
   // across the run instead of truncating a book or leaving a gap at the end.
   const length=end-start,count=Math.floor(length/2.4),set=roll(cloth.length);
   for(let j=0;j<count;j++){
    const p=start+Math.floor(j*length/count),size=start+Math.floor((j+1)*length/count)-p;
    const u=back+roll(2),front=tw-2-roll(2),span=front-u+1;
    const color=cloth[(set+Math.floor(j/2)+bay)%cloth.length];
    plank(u,p,span,size,0,color);plank(u+1,p+1,span-3,1,0,j%3?'#c8bba2':'#aa9d88');
    plank(front,p,1,size,0,'#574949');if(size===3)plank(front-1,p+1,1,1,0,'#bcaa82');
   }
  }
  // Pegged joints, worn sill and a little brass catalogue plate on each case.
  for(const v of [1,th-2]){plank(1,v,1,1,0,'#564a40');plank(tw-3,v,1,1,0,'#67584a')}
  plank(1,th/2|0,2,4,0,'#806b4e');plank(1,(th/2|0)+1,2,2,0,'#baa781');
  shelfTiles.set(seed,tile);
 }
 g.save();g.globalAlpha=.12;rect(x+2,y+2,w,h,'#262322');g.globalAlpha=.22;rect(x+2,y+2,w-1,h-1,'#262322');g.globalAlpha=1;g.drawImage(tile,x,y);g.restore();
}
// Faded prints stay in the north wall band, clear of the playable floor.
function familyPhotos(){
 const frame=(x,y,w,h)=>{rect(x+1,y+1,w,h,'#484644');rect(x,y,w,h,'#655347');rect(x+1,y+1,w-2,h-2,'#b79e78');rect(x+2,y+2,w-4,h-4,'#d5c9ab');rect(x+3,y+3,w-6,h-6,'#777f7b')};
 const gild=(x,y,w,h)=>{rect(x+1,y+1,w-3,1,'#ccba96');rect(x+w-2,y+2,1,h-3,'#907957');rect(x+2,y+h-2,3,1,'#978365')};
 frame(168,50,24,16);frame(147,52,15,13);frame(198,53,13,12);
 gild(168,50,24,16);gild(147,52,15,13);gild(198,53,13,12);
 // Use a narrow mount so the face, not the frame, occupies the print.
 const ink={h:'#f3ead6',e:'#e4d7bc',s:'#b4a58e',q:'#3e4144',p:'#f1e4cd',d:'#70675e',c:'#c4beb0',j:'#607987',b:'#455f70',z:'#b8aa89',w:'#cccbbc',t:'#526459'};
 const print=(x,y,rows)=>rows.forEach((r,v)=>[...r].forEach((k,u)=>{if(ink[k])rect(x+u,y+v,1,1,ink[k])}));
 rect(170,52,20,12,'#7e8985');
 print(172,52,['     hhhhhh     ','   hhheeeeess   ',' heeeeeeeeeeees ',' eeqqqseeqqqqes ',' seqpqseeqpqqes ','  seeeesqeeees  ','  seqeeeeeeds   ','   seeqdddess   ','    seeeeess    ','  jbccsssscbbj  ',' jbbbcczzccbbbj ',' jbbjbczjcjbbbj ']);
 // Snow-day candid: winding snowbank, stepped evergreen and a raised mitten.
 rect(149,54,11,9,'#8d9999');rect(149,60,11,3,'#c4c7ba');print(149,55,[' t ','twt','ttt',' d ']);
 print(153,54,[' hhh ','heees','eqeqs',' sees',' jccj',' bjj ','  bs ',' b  b']);
 rect(204,56,1,7,'#5f6857');rect(201,57,3,2,'#829078');rect(205,56,3,2,'#97a187');rect(205,60,2,1,'#78846b');rect(202,62,4,1,'#baaa8b');rect(206,56,1,1,'#abaf90');rect(169,52,1,3,'#d9c9aa');
}
function studyRoots(){
 // Step along mortar joints before branching over a stone; static, not obstacles.
 const root=(x,y,side,steps)=>{for(const [dx,dy,n] of steps){for(let i=0;i<n;i++){rect(x+1,y+1,2,1,'#55564d');rect(x,y,2,1,'#69604c');x+=dx*side;y+=dy}}};
 root(96,67,1,[[0,1,9],[1,1,7],[1,0,5],[1,1,8],[0,1,6]]);root(102,82,1,[[0,1,8],[-1,1,5],[0,1,5]]);
 root(263,227,-1,[[0,1,12],[1,1,7],[0,1,9],[1,1,6],[1,0,7]]);root(258,244,-1,[[1,0,5],[1,1,5],[1,0,4]]);
 for(const [x,y,d] of [[97,73,1],[101,81,-1],[110,89,1],[105,86,-1],[263,233,-1],[260,241,-1],[255,251,1],[250,260,-1]]){rect(x,y,1,3,'#465748');rect(x+(d<0?-3:0),y-1,4,2,'#65745c');rect(x+(d<0?-4:2),y-2,3,2,'#798469');rect(x+d,y,2,1,'#586753')}
}
// One transparent, native-resolution layer keeps the weathering still and cheap on mobile.
let patina;
function studyPatina(){
 if(!patina){patina=document.createElement('canvas');patina.width=216;patina.height=338;
 const c=patina.getContext('2d');c.translate(-72,-48);
 const dot=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const line=(x,y,X,Y,col)=>{const n=Math.max(1,Math.abs(X-x),Math.abs(Y-y));for(let i=0;i<=n;i++)dot(x+(X-x)*i/n,y+(Y-y)*i/n,1,1,col)};
 const crack=(x,y,points)=>{for(const [dx,dy] of points){line(x,y+1,x+dx,y+dy+1,'#93938a');line(x,y,x+dx,y+dy,'#484c49');x+=dx;y+=dy}};
 // Dress the existing wall footprint with staggered ashlar and chipped capstones.
 for(let course=0;course<2;course++){const y=50+course*8;for(let a=87-course*9,k=0;a<273;a+=19,k++){
  const x=Math.max(a,87),w=Math.min(a+18,273)-x;if(w<1)continue;
  dot(x,y,w,7,['#797c7a','#747875','#818380'][(k+course)%3]);dot(x+1,y,w-1,1,'#9a9b95');dot(x,y+6,w,1,'#626663');if(w>8&&k%3===0)dot(x+3,y,3,1,'#656963');}}
 for(const side of [0,1])for(let j=0;j<19;j++){const x=side?266:88,y=68+j*16;dot(x,y,6,15,j%3?'#767a76':'#80837d');dot(x+(side?4:1),y+1,1,13,'#9b9e95');dot(x,y+14,6,1,'#585e59');if(j%4===0)dot(x+2,y+2,2,2,'#676c64')}
 const mouth=(x,y,d)=>{crack(x,y,[[-2*d,-2],[d,-2],[-3*d,-1]]);crack(x,y,[[3*d,-2],[3*d,0],[d,-2]]);dot(x-2,y-1,5,2,'#343a35');dot(x-1,y+1,3,1,'#9a9c90')};
 mouth(96,67,1);mouth(263,227,-1);
 for(const [x,y,d] of [[102,102,1],[248,137,-1],[134,267,1],[234,323,-1],[101,57,1],[258,56,-1]]){
 crack(x,y,[[4*d,3],[3*d,-1],[2*d,4],[5*d,2],[2*d,3]]);crack(x+7*d,y+2,[[1*d,-3],[4*d,-1]])}
 // Each runner follows its own floor seams. Branches fork across the direction
 // of travel instead of hanging vertically like vines seen from the side.
 const trails=[[[93,64],[101,78],[109,82],[116,92],[129,97]],[[117,54],[119,65],[132,73],[139,86]],[[265,61],[258,77],[246,83],[238,94],[221,97]],[[265,151],[249,155],[238,163],[224,166],[210,177],[194,179]],[[94,250],[113,248],[126,238],[139,234],[151,222]],[[263,264],[245,261],[232,251],[218,248],[205,239]],[[97,354],[109,343],[118,323],[132,312],[138,297]],[[230,55],[228,68],[217,76],[214,86]]];
 for(const pts of trails){const [sx,sy]=pts[0];mouth(sx,sy,Math.sign(180-sx));for(let j=1;j<pts.length;j++){
  const [a,b]=pts[j-1],[x,y]=pts[j],dx=Math.sign(x-a),dy=Math.sign(y-b),thick=j<pts.length-1;
  line(a+1,b+1,x+1,y+1,'#50534a');line(a,b,x,y,'#594e40');if(thick)line(a,b-1,x,y-1,'#98856b');
  if(j%2){const turn=j===1?1:-1,bx=x+dx*5-dy*turn*4,by=y+dy*4+dx*turn*6;line(x,y,bx,by,'#615a48');line(bx,by,bx+dx*5,by+dx*turn*3,'#6b6754');
   for(const [lx,ly] of [[bx,by],[x+dx*2,y+dy*2]]){dot(lx-1,ly,4,2,'#435748');dot(lx,ly-1,3,2,'#758469');dot(lx+1,ly-1,2,1,'#92a080')}}
 }}
 // Radial fronds viewed from above: short shaded leaflets, a common crown.
 for(const [x,y,n] of [[103,130,9],[253,98,10],[102,282,10],[249,289,9],[236,76,7]]){
 for(let j=0;j<7;j++){const angle=j*.898+x*.1,len=n-(j%3),dx=Math.cos(angle),dy=Math.sin(angle);for(let k=0;k<len;k++){const px=x+dx*k,py=y+dy*k;dot(px,py,1,1,'#465c49');if(k%2===1){dot(px-dy,py+dx,2,1,'#899579');dot(px+dy,py-dx,1,2,'#677b61')}}}dot(x-1,y-1,3,2,'#52674f')}
 // Damp mortar beneath the ferns: patches have a dark underside and a dry lip.
 for(const [mx,my,d] of [[96,126,1],[260,95,-1],[99,278,1],[258,285,-1],[233,74,1]]){
  for(let i=0;i<5;i++){const xx=mx+d*(i*2),yy=my+(i*i%3);dot(xx,yy,4,2,'#626c5c');dot(xx+1,yy-1,2,1,i%2?'#95977c':'#858a70')}
 }
 // The stopped brass clock: stepped bezel, four indices and a fork across the glass.
 const cx=249,cy=58;for(let v=-6;v<=6;v++)for(let u=-6;u<=6;u++){const r=u*u+v*v;if(r>37)continue;
 dot(cx+u,cy+v,1,1,r>27?(u+v<0?'#b59d75':'#514a40'):(u+v<0?'#e0d7c0':'#cabea3'))}
 for(const [u,v] of [[0,-4],[4,0],[0,4],[-4,0]])dot(cx+u,cy+v,1,1,'#80755e');line(cx,cy,cx-2,cy-2,'#464742');line(cx,cy,cx-1,cy+2,'#464742');
 // Recessed mounting lug and a glint on the bevel, separate from broken glass.
 dot(cx-1,cy-7,3,1,'#766951');dot(cx-4,cy-4,2,1,'#d3bf95');dot(cx,cy,1,1,'#a08b66');
 // Single impact at the lower rim; split glass facets catch light on one edge.
 line(247,63,249,61,'#4d4940');line(249,61,251,61,'#575248');line(251,61,250,59,'#494840');line(250,59,253,57,'#57534b');
 dot(248,63,1,1,'#ede6cc');dot(251,60,1,1,'#f7eed7');line(250,61,252,62,'#756c5b');
 c.save();c.translate(-113,0);dot(239,53,11,11,'#68685d');dot(238,52,11,11,'#b4a88c');line(240,59,244,55,'#817d68');line(244,55,246,59,'#817d68');dot(242,53,1,1,'#645b4b');dot(246,61,3,2,'#d2c5a7');dot(239,61,4,1,'#99896e');dot(245,54,2,1,'#ccbb96');c.restore();
 }
 g.drawImage(patina,72,48);
}
function studyDecor(){
 roomFurniture.slice(0,-1).forEach((v,i)=>studyShelf(...v,i*3+1));
 // Woven runner under the writing desk; the fringe stays walkable.
 rect(153,197,54,40,'#686064');rect(155,199,50,36,'#898084');rect(157,201,46,32,'#726c74');
 for(let i=155;i<206;i+=3){rect(i,195,1,2,'#a29790');rect(i,237,1,2,'#a29790')}
 // Paired stepped lozenges woven into the exposed borders, not random noise.
 for(const yy of [201,231])for(let xx=159;xx<204;xx+=7){rect(xx+1,yy-1,2,1,'#b2a393');rect(xx,yy,4,1,'#94808a');rect(xx+1,yy+1,2,1,'#ad9e90')}
 for(const xx of [155,203])for(let yy=206;yy<230;yy+=5)rect(xx,yy,2,2,'#a0908d');
 const [x,y,w,h]=roomFurniture[roomFurniture.length-1];furnitureBody(x,y,w,h,4,'#95816c');
 rect(152,201,55,29,'#796653');rect(153,202,53,27,'#a18a72');rect(154,202,52,1,'#b09a80');
 for(const [xx,yy,n] of [[154,205,9],[156,225,12],[191,225,10]])rect(xx,yy,n,1,'#948069');
 rect(175,231,10,1,'#645243');rect(178,231,4,1,'#b7a079');
 // Closed journal, pen and brass reading light flank the large bound letter.
 rect(154,217,12,8,'#594c40');rect(154,216,12,7,'#c0af92');rect(153,215,13,7,'#536967');rect(154,215,1,7,'#394d4b');rect(157,217,6,1,'#ad9e80');
 rect(195,222,8,1,'#5e5047');rect(203,221,2,1,'#d9cdb4');rect(157,209,5,4,'#47434b');rect(158,209,2,1,'#272b32');
 rect(196,211,8,3,'#806e51');rect(197,211,6,2,'#b49a73');rect(199,206,2,5,'#b49769');rect(196,203,7,5,'#967e59');rect(195,204,9,3,'#c2a574');rect(198,204,3,2,'#ebd5a1');
 // Miniature of the reader: overhanging russet boards, layered leaves,
 // a shaded sewn gutter and a notched ribbon at the foot of the spine.
 rect(166,205,28,19,'#382e29');rect(166,205,28,18,'#725447');rect(167,206,26,16,'#9d8168');
 for(let i=0;i<24;i++){const xx=168+i,d=Math.min(i,23-i),py=207-(d>=2&&d<=9?1:0);
 rect(xx,py+2,1,14,'#998771');rect(xx,py+1,1,14,'#cbbba0');rect(xx,py,1,14,d===11?'#b8a384':d===10?'#dbcaab':d<2?'#daccb0':i<12?'#efe4cc':'#eadcc1')}
 rect(170,208,2,3,'#78473e');rect(182,208,2,2,'#78473e');
 for(const [xx,yy,n] of [[173,209,4],[170,212,7],[170,214,6],[171,217,4],[185,209,4],[182,212,7],[182,214,5],[183,217,4]])rect(xx,yy,n,1,'#a89980');
 rect(179,220,2,5,'#8c4946');rect(179,225,1,1,'#784845');familyPhotos();
}
function chamber(doorAge=-1){
 rect(72,0,216,438,'#101112');rect(84,48,192,336,'#35393a');rect(87,50,186,19,'#54595a');
 for(let i=0;i<8;i++){const x=88+i*23;rect(x,52,22,11,'#818585');rect(x+1,52,20,1,'#a7aaa7');rect(x,62,22,2,'#656a6b')}
 for(const x of [88,265]){rect(x,66,7,306,'#666b6c');rect(x+2,66,2,306,'#969b99');for(let y=68;y<371;y+=32)rect(x,y,7,2,'#494e4f')}
 g.drawImage(roomFloor(),95,68);rect(94,68,1,304,'#414345');rect(265,68,1,304,'#414345');rect(95,66,170,2,'#414345');rect(88,372,184,4,'#848887');rect(88,376,184,5,'#515657');
 for(const x of [91,269])for(const y of [59,369])stoneStamp('plinth',x,y);
 g.save();g.translate(0,405);g.scale(1,-1);threshold(doorAge);g.restore();
 // Keep all root tips, leaves and crack highlights on the inward-facing masonry.
 g.save();g.beginPath();g.rect(88,50,184,18);g.rect(90,68,180,304);g.clip();studyPatina();studyRoots();g.restore();studyDecor();
 rect(hallX-3,hallY+3,7,2,'#494c4d');tinySoul(hallX,hallY-1,exploreInk);
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
 const beat=Math.floor(t*4.5),phase=t*4.5-beat,near=1-ease(((mode==='room'?405-hallY:hallY)-38)/95);
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
  // A stepped scan tear sweeps over the carving, then snaps back in two echoes.
  const head=(beat*7+Math.floor(phase*9))%21,lag=(head-row+21)%21;
  const impulse=phase<.30?4:phase<.48?-2:phase<.72?2:1;
  const tear=lag<3?(beat%2?-1:1)*Math.round(impulse*(1+near*.45)*(1-lag*.25)):0;
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
   const bevel=(side<0?155:204)+dx;rect(bevel,14+row,1,1,row%8===7?'#555959':'#c8cbc3');
   if(row===4||row===16)rect((side<0?158:197)+dx,14+row,5,1,'#969b95');
   if(tear&&lag===0)rect(seal+dx-side*2,14+row,2,1,side<0?'#c3d4cc':'#bfafbc');
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
 g.save();if(age>=0){g.beginPath();g.rect(HALL_LEFT,17,HALL_WIDTH,HALL_HEIGHT-17);g.clip()}g.globalAlpha=1-ease((age-2.12)/.36);tinySoul(px,ground-lift,exploreInk);g.restore();
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
 }g.restore();
 if(purple&&cracks===5&&(hit||breaking))finalSlashAsh(sceneAge+(breaking?1.05:0));else if(hit)slash(sceneAge*1.6,false);
}
// The actual stroke breaks up: every flake starts on its original ink pixel.
// Fixed seeds keep flight paths continuous across the hit/reconstruction handoff.
const slashCinders=Array.from({length:52},(_,i)=>{const f=i/51,w=1+Math.round(3*Math.sin(f*Math.PI));return Array.from({length:w*2+1},(_,k)=>{
 const n=(i*193+k*79+i*k*17)%251;return {i,k,w,x:154+i,y:Math.round(98-40*f-5*Math.sin(f*Math.PI))-w+k,
 release:.48+f*.34+(n%9)*.009,life:.66+(n%31)*.013,vx:((n%27)-8)*.85,vy:7+n%16,phase:n*.37}})}).flat();
function finalSlashAsh(age){if(age>=2.1)return;const u=Math.min(1,age/.45),reach=Math.ceil(52*u*u*(3-2*u));g.save();
 for(const p of slashCinders){if(p.i>=reach)continue;const a=age-p.release;if(a>=p.life)continue;
  if(a<0){const col=a>-.075?'#40393f':a>-.13?'#997e80':p.k===p.w?'#fffcea':p.k>0&&p.k<=p.w+1?'#ffdea0':'#cf765d';rect(p.x,p.y,1,1,col);continue}
  const f=a/p.life,xx=p.x+p.vx*a+3*a*Math.sin(p.phase+a*7),yy=p.y-p.vy*a+30*a*a;
  g.globalAlpha=1-ease((f-.53)/.47);rect(xx,yy,1,1,p.k%4===0?'#635963':p.k%3===0?'#332e35':'#141216');g.globalAlpha=1;
 }g.restore();}

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
