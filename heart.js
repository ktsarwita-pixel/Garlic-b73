// Beyond the wall: hallway traversal and the two forms of the sixth opponent.
let distance=0,sceneAge=0,purple=false,cracks=0;
const walking=()=>mode==='hall'||mode==='portal';
const heartBusy=()=>['heartHit','reform','destroy'].includes(mode);
function enterHall(){encounter=6;resetBattle();distance=0;purple=false;cracks=0;mode='hall';msg('Walk forward: hold ↑ / W, or touch and hold the hallway.');ui()}
function enterHeart(){encounter=6;resetBattle();cracks=0;purple=false;sceneAge=0;msg('A white heart beats on the other side.');ui()}
function tinySoul(cx,cy){[' rr rr ','rrrrrrr','rrrrrrr',' rrrrr ','  rrr  ','   r   '].forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='r')rect(cx+i-3,cy+j-3,1,1,'#ff626a')}))}
function hallway(){
 const port=mode==='portal',p=distance/260,zoom=port?ease(sceneAge/1.55):0;
 g.save();g.translate(180,78);g.scale(1+zoom*3,1+zoom*3);g.translate(-180,-78);
 rect(0,0,360,180,'#3c3c3c');poly([[0,0],[360,0],[180,76]],'#747474');poly([[0,180],[180,76],[360,180]],'#868686');
 for(let i=0;i<10;i++){const z=((i+distance/35)%10)/10,s=.04+z*z;const w=Math.round(202*s),h=Math.round(104*s);rect(180-w,76-h,2,h*2,'#525252');rect(178+w,76-h,2,h*2,'#525252');rect(180-w,76+h,w*2,1,'#666');rect(180-w,76-h,w*2,1,'#969696');if(i%2===0)rect(180-w,76-h+4,3,Math.max(1,h/3|0),'#dedede')}
 const w=18+Math.round(45*p*p),h=17+Math.round(32*p*p);rect(180-w,76-h,2*w,2*h,'#a4a4a4');for(let k=0;k<5;k++){rect(180-w,77-h+k*(2*h/5|0),w*2,1,'#898989');rect(180+(k%2?-1:1)*w/3,78-h+k*(2*h/5|0),1,2*h/5|0,'#909090')}
 if(p>.65){for(let k=0;k<9;k++){const s=Math.sin(Math.floor(t*12)*2+k*8);if(s>.2||port)rect(180-w+s*4,76-h+((k*13)% (2*h)),w*(1+s*.6),port?3:1,k%2?'#ececec':'#484848')}}
 if(port){rect(177-zoom*8,76-h,5+zoom*16,2*h,'#151515')}
 tinySoul(180,138-zoom*60);g.restore();
}
function heartOpponent(){
 if(mode==='end'&&boss===0)return;
 if(purple){for(let i=0;i<20;i++){const ex=16+(i*59)%328,ey=16+(i*37)%88,blink=Math.sin(t*1.7+i);rect(ex-5,ey,11,1,'#4f365d');if(blink>-.86){rect(ex-3,ey-2,7,4,'#785989');rect(ex+(x>180?1:-1),ey-2,2,4,'#27132e')}}}
 const burst=mode==='reform'||mode==='destroy';const spread=burst?(mode==='destroy'?ease(sceneAge/1.25):ease(sceneAge/.7)*(1-ease((sceneAge-1.05)/.9))):0;
 const tint=purple||(mode==='reform'&&sceneAge>1.25),shades=tint?['#d69aff','#a15ad7','#754398']:['#fffdf4','#e3e0da','#a8a8a7'];
 const rows=['  xxxx   xxxx  ',' xxxxxx xxxxxx ','xxxxxxxxxxxxxxx','xxxxxxxxxxxxxxx',' xxxxxxxxxxxxx ','  xxxxxxxxxxx  ','   xxxxxxxxx   ','    xxxxxxx    ','     xxxxx     ','      xxx      ','       x       '];
 const count=mode==='reform'&&sceneAge>1.45?0:cracks;g.save();if(mode==='destroy')g.globalAlpha=1-ease((sceneAge-.65)/1.0);
 rows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v!=='x')return;const mid=7+[0,0,1,1,0,-1,0,0,1,0,0][j];const seam=count&&((i===mid&&j<2+count*2)||(count>=2&&i===mid-j+5&&j>=5&&j<=5+count)||(count>=3&&i===mid+j-3&&j>=3&&j<3+count)||(count>=4&&j===6&&i>mid));const chunk=(i<mid?-1:1)*(j<5?2:1);rect(158+i*3+spread*chunk*12,52+j*3+Math.sin(t*2)*1.5+spread*(j-4)*4,3,3,seam?'#332637':shades[j>7?2:i+j<7?0:1])}));g.restore();if(mode==='heartHit')slash(sceneAge*1.6,false);
}
function heartAction(a){if(mode!=='ready')return;if(a==='fight'){cracks++;boss=Math.max(0,100-100*cracks/(purple?5:4));mode='heartHit';sceneAge=0;beep(205);msg(`Fracture ${cracks} / ${purple?5:4}.`)}else{if(purple)return;if(a==='item'){if(!food){msg('No pie left.');return}food--;hp=Math.min(20,hp+8);msg(`Pie restores your soul. ${food} left.`)}else msg(a==='act'?'You call out. No answer.':'You offer mercy. Its pulse stays steady.');startWave(.55)}ui()}
function chapterTick(dt){if(mode==='hall'){const walk=drag||['w','arrowup','d','arrowright'].some(k=>keys.has(k));if(walk)distance=Math.min(260,distance+dt*60);if(distance>=260){mode='portal';sceneAge=0;msg('The wall skips a beat. Your soul slips through.');ui()}return true}
 if(mode==='portal'){sceneAge+=dt;if(sceneAge>=1.65)enterHeart();return true}
 if(!heartBusy())return false;sceneAge+=dt;
 if(mode==='heartHit'&&sceneAge>=1.05){if(boss>0)startWave(.5);else{mode=purple?'destroy':'reform';sceneAge=0;msg(purple?'The last eye closes.':'The pieces stop falling. Something pulls them back.')}ui()}
 else if(mode==='reform'&&sceneAge>=2.25){purple=true;cracks=0;boss=100;mode='ready';msg('The heart reforms in violet. Only FIGHT responds.');ui()}
 else if(mode==='destroy'&&sceneAge>=1.9){mode='end';msg('The violet heart is gone. Select an action to replay.');ui()}return true}
