// Beyond the wall: hallway traversal and the two forms of the sixth opponent.
let distance=0,sceneAge=0,purple=false,cracks=0;
const walking=()=>mode==='hall'||mode==='portal';
const heartBusy=()=>['heartHit','reform','destroy'].includes(mode);
function enterHall(){encounter=6;resetBattle();distance=0;purple=false;cracks=0;mode='hall';msg('Move with ← / → or A / D. On touch, hold either side of your soul.');ui()}
function enterHeart(){encounter=6;resetBattle();cracks=0;purple=false;sceneAge=0;msg('A white heart beats on the other side.');ui()}
function tinySoul(cx,cy){[' rr rr ','rrrrrrr','rrrrrrr',' rrrrr ','  rrr  ','   r   '].forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='r')rect(cx+i-3,cy+j-3,1,1,'#ff626a')}))}
const hallCamera=()=>Math.round(Math.max(0,Math.min(330,distance-92)));
function hallway(){
 const cam=hallCamera(),port=mode==='portal',gate=650-cam;
 rect(0,0,360,180,'#191919');rect(0,28,360,78,'#888');rect(0,95,360,10,'#636363');rect(0,104,360,3,'#ccc');rect(0,107,360,46,'#464646');rect(0,151,360,2,'#747474');
 for(let i=0;i<10;i++){
  const a=i*80-cam;if(a < -80 || a>360)continue;
  // Tall recessed lancets, with a stone sill and a thin leaded crossbar.
  for(let j=0;j<25;j++){const h=4+Math.min(j,24-j,7);rect(a+22+j,48-h,1,34+h,'#565656');rect(a+22+j,51-h,1,27+h,'#cdcdcd')}
  rect(a+33,38,2,43,'#777');rect(a+22,57,25,2,'#777');rect(a+19,82,31,3,'#b7b7b7');
  rect(a+63,30,8,73,'#686868');rect(a+63,30,2,73,'#aaa');rect(a+60,30,14,4,'#c8c8c8');rect(a+61,99,12,5,'#aaa');
  rect(a,119,80,1,'#505050');rect(a+17,107,1,12,'#383838');rect(a+52,120,1,31,'#393939');
 }
 rect(gate,28,40,125,'#6b6b6b');for(let j=0;j<8;j++){const shift=(j*3+Math.floor(t*7))%9===0? -4:0;rect(gate+shift,28+j*16,40,14,'#979797');rect(gate+shift,28+j*16,2,14,'#dbdbdb')}
 if(port){const open=ease(sceneAge/.6);rect(gate-2,126-12*open,22,24*open,'#171717')}
 const px=34+distance-cam+(port?ease((sceneAge-.4)/1)*34:0);g.save();if(port)g.globalAlpha=1-ease((sceneAge-1)/.55);tinySoul(px,126+Math.sin(t*3));g.restore();
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
function chapterTick(dt){if(mode==='hall'){const dir=drag&&target?Math.sign(target[0]-(34+distance-hallCamera())):Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));distance=Math.max(0,Math.min(610,distance+dt*100*dir));if(distance>=610){mode='portal';sceneAge=0;msg('The wall skips a beat. Your soul slips through.');ui()}return true}
 if(mode==='portal'){sceneAge+=dt;if(sceneAge>=1.65)enterHeart();return true}
 if(!heartBusy())return false;sceneAge+=dt;
 if(mode==='heartHit'&&sceneAge>=1.05){if(boss>0)startWave(.5);else{mode=purple?'destroy':'reform';sceneAge=0;msg(purple?'The last eye closes.':'The pieces stop falling. Something pulls them back.')}ui()}
 else if(mode==='reform'&&sceneAge>=2.25){purple=true;cracks=0;boss=100;mode='ready';msg('The heart reforms in violet. Only FIGHT responds.');ui()}
 else if(mode==='destroy'&&sceneAge>=1.9){mode='end';msg('The violet heart is gone. Select an action to replay.');ui()}return true}
