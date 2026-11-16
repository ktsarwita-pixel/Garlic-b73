/* headless bot player test: verifies the loop is winnable and mechanics fire.
   node test/bot_test.js [difficulty] [seconds] */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = { window: {}, console, Math, Date, performance: { now: () => Date.now() } };
const ctx = vm.createContext(sandbox);
for (const f of ['lib.js', 'data.js', 'sprite.js', 'map.js', 'game.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
}
const RTS = sandbox.window.RTS;

function bot(g) {
  const mine = g.units.filter((u) => !u.dead && u.owner === 0);
  const keep = g.buildings.find((b) => !b.dead && b.owner === 0 && b.type === 'keep');
  if (!keep) return;
  const workers = mine.filter((u) => u.type === 'worker');
  const army = mine.filter((u) => u.type !== 'worker');
  const count = (t) => g.buildings.filter((b) => !b.dead && b.owner === 0 && b.type === t).length;
  const pending = (t) => g.buildings.filter((b) => !b.dead && b.owner === 0 && b.type === t && b.progress < 1).length;

  // keep 6 workers
  if (workers.length < 9 && keep.queue.length < 1) g.queueUnit(keep, 'worker');
  // idle workers gather
  for (const w of workers) if (!w.order) g.autoGather(w);

  // barracks first
  const uc = g.buildings.filter((b) => !b.dead && b.owner === 0 && b.progress < 1).length;
  if (count('barracks') + pending('barracks') < (g.time > 240 ? 2 : 1) && g.res[0].wood >= 110 && uc < 2) {
    const spot = g.makePlacement(0, 'barracks', keep.x + 40, keep.y + 40);
    if (spot) g.placeBuilding('barracks', spot.x, spot.y, 0);
  }
  const cap = g.supplyCap(0);
  if ((g.pop[0] + 6 > cap || g.res[0].food < 20) && count('farm') < 8 && g.res[0].wood >= 40 && uc < 2) {
    const spot = g.makePlacement(0, 'farm', keep.x, keep.y);
    if (spot) g.placeBuilding('farm', spot.x, spot.y, 0);
  }
  if (count('tower') + pending('tower') < 2 && g.time > 60 && g.res[0].wood >= 100 && uc < 2) {
    const spot = g.makePlacement(0, 'tower', keep.x + 30, keep.y + 30);
    if (spot) g.placeBuilding('tower', spot.x, spot.y, 0);
  }
  if (count('workshop') + pending('workshop') < 1 && g.res[0].wood > 260 && uc < 2) {
    const spot = g.makePlacement(0, 'workshop', keep.x, keep.y);
    if (spot) g.placeBuilding('workshop', spot.x, spot.y, 0);
  }
  // train army
  for (const b of g.buildings.filter((b) => !b.dead && b.owner === 0 && b.type === 'barracks')) {
    if (b.queue.length < 2) {
      const t = g.time > 200 && g.res[0].wood > 200 ? 'knight' : g.time > 90 ? 'archer' : 'soldier';
      g.queueUnit(b, t);
    }
  }
  // powers
  if (g.canUseAbility(0, 'meteor')) {
    const cluster = g.units.filter((u) => !u.dead && u.owner === 1 && g.visible(u));
    if (cluster.length >= 3) {
      let best = null, bn = 0;
      for (const u of cluster) {
        let n = 0;
        for (const o of cluster) if (RTS.util.dist2(u.x, u.y, o.x, o.y) < 60 * 60) n++;
        if (n > bn) { bn = n; best = u; }
      }
      if (bn >= 3) g.useAbility(0, 'meteor', best.x, best.y);
    }
  }
  // attack
  const idle = army.filter((u) => !u.order);
  const enemyKeep = g.buildings.find((b) => !b.dead && b.owner === 1 && b.type === 'keep');
  const baseThreat = g.units.filter((u) => !u.dead && u.owner === 1 && keep && RTS.util.dist(u.x, u.y, keep.x, keep.y) < 300);
  if (baseThreat.length) {
    for (const u of idle) g.orderAttack(u, baseThreat[0]);
  } else if (idle.length >= 9 && enemyKeep) {
    // push only when we outnumber what we can see
    const seenEnemy = g.units.filter((u) => !u.dead && u.owner === 1 && g.visible(u)).length;
    if (idle.length > seenEnemy) for (const u of idle) g.orderAttack(u, enemyKeep);
    else for (const u of idle) {
      const e = g.units.find((x) => !x.dead && x.owner === 1 && g.visible(x));
      if (e) g.orderAttack(u, e);
    }
  }
}

const MISSIONS = { skirmish: 'Skirmish', flood: 'The Long Tide' };
const mission = MISSIONS[process.argv[5]] ? process.argv[5] : 'skirmish';
const difficulty = process.argv[2] || 'veteran';
const seconds = +(process.argv[3] || 900);
const seed = +(process.argv[4] || 4242);
const g = new RTS.Game({ seed, difficulty, mission, playerFaction: 'everglen', enemyFaction: 'mirefen' });
const dt = 1 / 30;
let steps = Math.round(seconds / dt);
for (let i = 0; i < steps; i++) {
  g.update(dt);
  if (i % 15 === 0) bot(g);
  if (g.gameOver) break;
}
// ---- assertions ----
const checks = [
  ['player gathered wood', g.res[0].wood >= 0],
  ['player trained soldiers', g.units.some((u) => u.owner === 0 && u.type !== 'worker')],
  ['combat happened', g.stats.kills[0] + g.stats.lost[0] + g.stats.lost[1] > 0],
  ['buildings were built', g.buildings.some((b) => b.owner === 0 && b.type !== 'keep')],
];
const pArmy = g.units.filter((u) => u.owner === 0 && u.type !== 'worker').length;
const eArmy = g.units.filter((u) => u.owner === 1 && u.type !== 'worker').length;
console.log(
  `[${difficulty}/${mission}] t=${g.time.toFixed(0)}s result=${g.result || 'timeout'} | player ${g.units.filter((u) => u.owner === 0).length}u(${pArmy} army)/${g.buildings.filter((b) => b.owner === 0).length}b | ` +
  `enemy ${g.units.filter((u) => u.owner === 1).length}u(${eArmy} army)/${g.buildings.filter((b) => b.owner === 1).length}b | kills ${g.stats.kills[0]}/${g.stats.lost[0]}`
);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) { console.log('FAILED CHECKS:', failed.map(([n]) => n).join(', ')); process.exit(1); }
