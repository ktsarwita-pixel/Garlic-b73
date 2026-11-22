// Run with node tools/test-visitor.cjs. The simulation uses game time, not RAF.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({assert, keys:new Set(), drag:false, target:null,
  testGod:true, hp:20, x:180, y:148, t:0, round:1, swings:0, inv:0, shots:[],
  lastPaint:{}, ink:'#111', mode:'ready', msg(){}, ui(){}, sfx(){}, sampleCue(){},
  ease(n){return Math.max(0,Math.min(1,n))}, resetBattle(){},
  startWave(delay){Object.assign(context,{mode:'dodge',elapsed:0,spawn:delay,patternStep:0,shots:[]})}
});
vm.runInContext(fs.readFileSync(require.resolve('../visitor.js'),'utf8'),context);
vm.runInContext(`
for(const side of [-1,1])for(const [nx,ny] of [[-1,0],[1,0],[0,-1],[0,1]])for(let i=0;i<=355;i++){
  const p=armRig(side,{age:i/100,nx,ny});assert(Math.abs(Math.hypot(p.sx-p.ex,p.sy-p.ey)-9)<1e-10);assert(Math.abs(Math.hypot(p.ex-p.px,p.ey-p.py)-8)<1e-10);
}
startSeven();
for(let r=1;r<=6;r++){
  assert.equal(round,r);
  if(r<6){for(patternStep=0;patternStep<gateScores[r-1].length;patternStep++){
    const gate=nextGate();assert(gate.cut>0&&gate.span-gate.gap-gate.cut>0);
  }patternStep=0;}
  for(let i=0;i<1200&&mode==='dodge';i++){t+=.02;sevenTick(.02)}
  assert.equal(mode,'ready');swings++;flash=1.45;mode='strike';
  for(let i=0;i<75&&mode==='strike';i++)sevenTick(.02);
}
assert.equal(mode,'sevenHold');assert.equal(slamCount,6);for(let i=0;i<500;i++)sevenTick(.02);assert.equal(encounter,7);for(let i=0;i<110;i++)sevenTick(.02);assert.equal(encounter,8);assert.equal(mode,'dodge');
for(let r=1;r<=5;r++){const sizes=[];for(let i=0;i<2000&&mode==='dodge';i++){const prev=sent;t+=.02;sevenTick(.02);if(sent>prev)sizes.push(cannons.at(-1).big);if(r===5)assert.equal(shots.length,0)}assert.equal(mode,'ready');assert.equal(sizes.length,[5,3,2,10,22][r-1]);assert.equal(sizes.filter(Boolean).length,[0,0,2,0,2][r-1]);swings++;flash=1.45;mode='strike';for(let i=0;i<75&&mode==='strike';i++)sevenTick(.02)}assert.equal(mode,'farewell');assert.equal(ring.length,15);assert.equal(ring.filter(c=>c.big).length,5);const hpBefore=hp;for(let i=0;i<560;i++)sevenTick(.02);assert.equal(mode,'departed');assert.equal(hp,hpBefore);
// The narration clock starts on black, fires each line at its requested time,
// and gives the final line time to be read before the house reveal.
beginEpilogue();for(const [threshold,line] of epilogueLines){epilogueTick(threshold-epilogueAge-.001);assert(epilogueAge<threshold);epilogueTick(.002);assert(epilogueAge>=threshold)}
assert.equal(mode,'departed');epilogueTick(10.49-epilogueAge);assert.equal(mode,'departed');epilogueTick(.02);assert.equal(mode,'home');
const homeStart=x;keys.add('d');homeTick(.5);keys.clear();assert(x>homeStart);assert.equal(homeFacing,'right');
drag=true;target=[20,170];homeTick(.5);assert.equal(homeFacing,'left');drag=false;target=null;
// A player following the visible sights can clear the square with ordinary inputs.
for(const dt of [1/30,1/60]){startEight();round=4;eightWave();testGod=false;hp=20;inv=0;
 for(let i=0;i<20/dt&&mode==='dodge';i++){keys.clear();const c=cannons.at(-1);
  if(c&&c.age>.20){const pos=c.vertical?x:y,mid=c.vertical?180:160,goal=mid+(c.pos>=mid?-9:9);
   if(Math.abs(goal-pos)>1.6)keys.add(c.vertical?(pos<goal?'d':'a'):(pos<goal?'s':'w'));}
  t+=dt;sevenTick(dt);assert.equal(hp,20);}
 assert.equal(mode,'ready');assert.equal(sent,10);keys.clear();}
// Six accelerating, alternating slams must remain escapable with normal directional input.
for(const dt of [1/30,1/60,1/120]){startSeven(6);testGod=false;hp=20;inv=0;let count=0,axis=null;
 for(let k=0;k<25/dt&&mode==='dodge';k++){keys.clear();const w=wallPull;if(w){if(count!==slamCount){assert.notEqual(axis,!!w.nx);axis=!!w.nx;count=slamCount}if(w.age>.92+.025*w.tempo)keys.add(w.nx<0?'d':w.nx>0?'a':w.ny<0?'s':'w')}sevenTick(dt);assert.equal(hp,20)}assert.equal(mode,'ready');assert.equal(count,6);keys.clear();console.log('Escape bot: six no-hit slams at '+Math.round(1/dt)+' FPS');
 startSeven(6);testGod=false;inv=0;hp=20;for(let k=0;k<5/dt&&hp===20;k++){keys.clear();const w=wallPull;if(w&&w.age>.92+.18*w.tempo)keys.add(w.nx<0?'d':w.nx>0?'a':w.ny<0?'s':'w');sevenTick(dt)}assert.equal(hp,10);keys.clear()}
testGod=true;
for(const [nx,ny] of [[1,0],[-1,0],[0,1],[0,-1]]){
  startSeven(6);const b=sevenBox();x=nx>0?b.r-5:nx<0?b.l+5:180;y=ny>0?b.d-5:ny<0?b.u+5:(b.u+b.d)/2;
  for(let i=0;i<156;i++){wallSequence(.02,b);if((i+1)*.02<spikeAt(wallPull)-.00001)assert.equal(shots.length,0);
    if(i===99)assert(shots.length>0);
    for(const s of shots){assert.equal(s.kind,'corrupt boke');assert.equal(s.damage,10);assert(!s.glitch&&!s.red&&!s.blue);assert.equal(s.vx,0);assert.equal(s.vy,0);
      assert(nx<0?s.x===b.l:nx>0?s.x+s.h===b.r:ny<0?s.y===b.u:s.y+s.h===b.d);}
  }assert.equal(shots.length,0);
}
for(const moving of [false,true]){startSeven(6);testGod=false;hp=20;inv=0;if(moving)keys.add('arrowdown');
 for(let i=0;i<120&&hp===20;i++)sevenTick(.02);assert.equal(hp,10);keys.clear();}
`,context);
console.log('Visitor: gate geometry, six waves, final hold and all four anchored spike racks passed.');
