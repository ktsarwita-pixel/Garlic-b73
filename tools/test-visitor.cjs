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
  for(let i=0;i<700&&mode==='dodge';i++){t+=.02;sevenTick(.02)}
  assert.equal(mode,'ready');swings++;flash=1.45;mode='strike';
  for(let i=0;i<75&&mode==='strike';i++)sevenTick(.02);
}
assert.equal(mode,'sevenHold');assert.equal(slamCount,3);
for(const [nx,ny] of [[1,0],[-1,0],[0,1],[0,-1]]){
  startSeven(6);const b=sevenBox();x=nx>0?b.r-5:nx<0?b.l+5:180;y=ny>0?b.d-5:ny<0?b.u+5:(b.u+b.d)/2;
  for(let i=0;i<156;i++){wallSequence(.02,b);if(i<85)assert.equal(shots.length,0);
    if(i===99)assert(shots.length>0);
    for(const s of shots){assert.equal(s.kind,'corrupt boke');assert.equal(s.damage,10);assert(!s.glitch&&!s.red&&!s.blue);assert.equal(s.vx,0);assert.equal(s.vy,0);
      assert(nx<0?s.x===b.l:nx>0?s.x+s.h===b.r:ny<0?s.y===b.u:s.y+s.h===b.d);}
  }assert.equal(shots.length,0);
}
for(const moving of [false,true]){startSeven(6);testGod=false;hp=20;inv=0;if(moving)keys.add('arrowdown');
 for(let i=0;i<120&&hp===20;i++)sevenTick(.02);assert.equal(hp,10);keys.clear();}
`,context);
console.log('Visitor: gate geometry, six waves, final hold and all four anchored spike racks passed.');
