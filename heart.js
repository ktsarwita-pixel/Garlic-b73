// Beyond the wall: hallway traversal and the two forms of the sixth opponent.
let hallX=180,hallY=398,sceneAge=0,purple=false,cracks=0;
const walking=()=>mode==='hall'||mode==='portal';
const heartBusy=()=>['heartHit','reform','destroy'].includes(mode);
function enterHall(){encounter=6;resetBattle();hallX=180;hallY=398;sceneAge=0;keys.clear();purple=false;cracks=0;mode='hall';msg('Follow the stone inlay north. Move with arrows / WASD, or hold and drag.');ui()}
function enterHeart(){encounter=6;resetBattle();cracks=0;purple=false;sceneAge=0;msg('A white heart beats on the other side.');ui()}
function tinySoul(cx,cy){[' rr rr ','rrrrrrr','rrrrrrr',' rrrrr ','  rrr  ','   r   '].forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='r')rect(cx+i-3,cy+j-3,1,1,'#ff626a')}))}
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
 const width=hallWidth(hallY);hallX=hallClamp(hallX+dx/len*step,180-width+4,180+width-4);
 const next=hallClamp(hallY+dy/len*step,HALL_NORTH,HALL_SOUTH);
 if(Math.abs(hallX-180)<=hallWidth(next)-4)hallY=next;
 if(hallY<=HALL_NORTH+1&&Math.abs(hallX-180)<23){mode='portal';sceneAge=0;drag=false;target=null;msg('The stone slips out of place. Beyond it, a heartbeat.');ui()}
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
   let a=78+i*32-(j%2)*16,b=j*16;rect(a,b,31,15,['#777979','#747676','#797b7a'][(i+j*2)%3]);rect(a+1,b,29,1,'#818382')}
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
 // Only the sealed central slab tears, leaving stable masonry on both sides.
 const gap=port?ease(sceneAge/.75):0;rect(153,14,54,21,'#1c1e20');
 for(let k=0;k<7;k++){
  const d=Math.round(3*Math.sin(k*2+Math.floor(t*6))),a=155+d,b=14+k*3,split=Math.round(2+gap*20);
  rect(a,b,24-split,3,k%3?'#b4b5b1':'#e0e1dc');rect(a+24+split,b,26-split,3,k%2?'#989a99':'#c9cbc7');
 }
 const p=port?ease((sceneAge-.3)/1.2):0,px=hallX+(180-hallX)*p,py=hallY+(12-hallY)*p;
 g.globalAlpha=1-p*p;rect(px-3,py+4,7,2,'#555758');tinySoul(px,py);g.restore();
}
const watchers=[[19,43,9],[51,78,17],[85,29,12],[127,53,9],[95,105,8],[16,102,6],[142,95,6],[221,34,7],[239,94,10],[263,57,18],[305,29,10],[337,78,15],[301,106,7],[350,41,5]];
function watchingEyes(){watchers.forEach(([cx,cy,r],i)=>{
 const phase=(t+i*.71)%(3.3+i*.09),lid=Math.min(1,Math.abs(phase-.23)*5), gaze=Math.round(Math.max(-1,Math.min(1,(x-cx)/80))*r*.31);
 for(let u=-r;u<=r;u++){
 const h=Math.round((1-(Math.abs(u)/r)**1.6)*r*.43*lid),v=Math.round(u*(i%2?.12:-.12));
 rect(cx+u,cy+v-h-1,1,1,'#81578c');rect(cx+u,cy+v-h,1,h*2+1,'#4e365a');if(h<2)continue;
 for(let k=1-h;k<h;k++){const d=(u-gaze)**2+(k-1)**2;if(d<(r*.34)**2)rect(cx+u,cy+v+k,1,1,Math.abs(u-gaze)<2?'#190f23':'#ae82be')}
 if(u===gaze-2&&h>3)rect(cx+u,cy+v-2,2,1,'#e6cdef');
 }
})}
// Each letter is a fitted shard. Separating actual pieces exposes the void between them.
const shell=['  AAAA   BBBB  ',' AAAAAA BBBBBB ','AAAAAAACBBBBBBB','DAAAAACCCBBBBBE',' DDAAACCCCBBEE ','  DDDACCCCEEE  ','   DDDCCCEEE   ','    DDCCCEE    ','     FFFCE     ','      FFF      ','       F       '];
const drift={A:[-7,-6],B:[6,-8],C:[0,-1],D:[-9,4],E:[8,5],F:[1,10]};
function heartOpponent(){
 if(mode==='end'&&boss===0)return;if(purple)watchingEyes();
 const bind=mode==='reform'?1-ease((sceneAge-1)/1):1,burst=mode==='destroy'?ease(sceneAge/1.45):mode==='reform'?ease(sceneAge/.75)*bind:0;
 const violet=purple||mode==='reform'&&sceneAge>1.4,palette=violet?['#f6dfff','#cb91f3','#a165c8','#713e93']:['#fffefa','#e3e0d9','#c5c1bb','#9c9996'];
 const order=purple?'BAFEDC':'ADEBFC',n=cracks=== (purple?5:4)?6:cracks;
 g.save();if(mode==='destroy')g.globalAlpha=1-ease((sceneAge-.8)/.95);
 shell.forEach((row,j)=>[...row].forEach((id,i)=>{if(id===' ')return;const index=order.indexOf(id),loose=index<n;
 const gap=loose?(.24+.13*(n-index))*bind:0,[dx,dy]=drift[id],offset=gap+burst*3;
 const px=158+i*3+dx*offset,py=52+j*3+dy*offset+Math.sin(t*2)*1.5;
 const shade=j<3&&i<6?0:j>7||i>12?3:i+j>13?2:1;rect(px,py,3,3,palette[shade]);
 if(loose&&shell[j-1]?.[i]!==id)rect(px,py,3,1,palette[0]);
 }));g.restore();if(mode==='heartHit')slash(sceneAge*1.6,false);
}
function heartAction(a){if(mode!=='ready')return;if(a==='fight'){cracks++;boss=Math.max(0,100-100*cracks/(purple?5:4));mode='heartHit';sceneAge=0;beep(205);msg(`Fracture ${cracks} / ${purple?5:4}.`)}else{if(purple)return;if(a==='item'){if(!food){msg('No pie left.');return}food--;hp=Math.min(20,hp+8);msg(`Pie restores your soul. ${food} left.`)}else msg(a==='act'?'You call out. No answer.':'You offer mercy. Its pulse stays steady.');startWave(.55)}ui()}
function chapterTick(dt){if(mode==='hall'){moveInHall(dt);return true}
 if(mode==='portal'){sceneAge+=dt;if(sceneAge>=1.65)enterHeart();return true}
 if(!heartBusy())return false;sceneAge+=dt;
 if(mode==='heartHit'&&sceneAge>=1.05){if(boss>0)startWave(.5);else{mode=purple?'destroy':'reform';sceneAge=0;msg(purple?'The last eye closes.':'The pieces stop falling. Something pulls them back.')}ui()}
 else if(mode==='reform'&&sceneAge>=2.25){purple=true;cracks=0;boss=100;mode='ready';msg('The heart reforms in violet. Only FIGHT responds.');ui()}
 else if(mode==='destroy'&&sceneAge>=1.9){mode='end';msg('The violet heart is gone. Select an action to replay.');ui()}return true}
