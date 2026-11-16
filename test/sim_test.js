/* headless simulation test: node test/sim_test.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = { window: {}, console, Math, Date, performance: { now: () => Date.now() } };
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);
for (const f of ['lib.js', 'data.js', 'sprite.js', 'map.js', 'game.js']) {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
  vm.runInContext(code, ctx, { filename: f });
}
const RTS = sandbox.window.RTS;

function run(seed, difficulty, mission, seconds) {
  const g = new RTS.Game({ seed, difficulty, mission, playerFaction: 'everglen', enemyFaction: 'mirefen' });
  const dt = 1 / 30;
  let steps = Math.round(seconds / dt);
  const t0 = Date.now();
  let maxStepMs = 0;
  for (let i = 0; i < steps; i++) {
    const a = Date.now();
    g.update(dt);
    const ms = Date.now() - a;
    if (ms > maxStepMs) maxStepMs = ms;
    if (g.gameOver) break;
  }
  const took = Date.now() - t0;
  const p = g.units.filter((u) => u.owner === 0).length;
  const e = g.units.filter((u) => u.owner === 1).length;
  const pb = g.buildings.filter((b) => b.owner === 0).length;
  const eb = g.buildings.filter((b) => b.owner === 1).length;
  const ew = g.units.filter((u) => u.owner === 1 && u.type === 'worker').length;
  const pArmy = g.units.filter((u) => u.owner === 0 && u.type !== 'worker').length;
  const eArmy = g.units.filter((u) => u.owner === 1 && u.type !== 'worker').length;
  console.log(
    `seed=${seed} ${difficulty}/${mission} | t=${g.time.toFixed(0)}s result=${g.result || 'running'} | ` +
    `player ${p}u(${pArmy} army)/${pb}b | enemy ${e}u(${eArmy} army, ${ew} workers)/${eb}b | ` +
    `res p=${Math.round(g.res[0].wood)}w ${Math.round(g.res[0].food)}f ${Math.round(g.res[0].favor)}a e=${Math.round(g.res[1].wood)}w | ` +
    `step max ${maxStepMs}ms avg ${(took / steps).toFixed(2)}ms`
  );
  return g;
}

const g = run(1234, 'veteran', 'skirmish', 420);
run(1234, 'recruit', 'skirmish', 420);
run(99, 'warlord', 'flood', 600);
run(7, 'veteran', 'skirmish', 300);

// verify units actually gather: player wood should grow
const w0 = g.res[0].wood;
const pp = g.findPath(g.map.startP1.x, g.map.startP1.y, g.map.startP1.x + 120, g.map.startP1.y - 120); console.log('sanity: path ok?', pp ? pp.length : null);
console.log('sanity: tree count', g.resources.length, 'rocks', g.rocks.length);
console.log('sanity: player wood after sim', Math.round(w0), 'pop', g.pop, 'cap', g.supplyCap(0));
const stuck = g.units.filter((u) => u.owner === 1 && u.type === 'worker' && !u.order);
console.log('sanity: idle enemy workers', stuck.length);
