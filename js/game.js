/* GARLIC WARS - simulation */
(function () {
  'use strict';
  const RTS = window.RTS;
  const U = RTS.util;
  const TILE = RTS.TILE;

  let nextId = 1;
  const uid = () => nextId++;

  /* ---------------- A* pathfinding ---------------- */
  function Heap() {
    this.a = [];
  }
  Heap.prototype.push = function (n) {
    const a = this.a;
    a.push(n);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      const t = a[p]; a[p] = a[i]; a[i] = t; i = p;
    }
  };
  Heap.prototype.pop = function () {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        const t = a[m]; a[m] = a[i]; a[i] = t; i = m;
      }
    }
    return top;
  };
  Heap.prototype.size = function () { return this.a.length; };

  /* ---------------- Game ---------------- */
  RTS.Game = function (opts) {
    opts = opts || {};
    this.seed = opts.seed || 1234;
    this.mission = opts.mission || 'skirmish';
    this.difficultyId = opts.difficulty || 'recruit';
    this.diff = RTS.DIFFICULTY[this.difficultyId] || RTS.DIFFICULTY.veteran;
    const field = RTS.FIELDS[opts.field] || RTS.FIELDS.medium;
    const size = field.tiles;
    this.field = opts.field || 'medium';
    this.map = RTS.generateMap(this.seed, size);
    this.MW = size;
    this.MH = size;
    this.worldW = this.MW * TILE;
    this.worldH = this.MH * TILE;

    const pf = RTS.factionById(opts.playerFaction || 'everglen');
    const ef = RTS.factionById(opts.enemyFaction || 'mirefen');
    this.factions = [pf, ef];
    this.playerFaction = pf;
    this.enemyFaction = ef;

    this.time = 0;
    this.units = [];
    this.buildings = [];
    this.resources = [];
    this.projectiles = [];
    this.effects = [];
    this.sfx = [];
    this.floaters = [];
    this.corpses = [];
    this.selected = [];
    this.selection = { kind: 'none' };
    this.player = 0;
    this.enemy = 1;
    this.gameOver = false;
    this.result = null;
    this.paused = false;
    this.speed = 1;
    this.pop = [0, 0];
    this.res = [
      { wood: this.mission === 'flood' ? 190 : 170, food: 110, favor: 14 },
      { wood: 150, food: 100, favor: 12 },
    ];
    this.stats = { kills: [0, 0], lost: [0, 0], built: [0, 0] };
    this.abilityCd = [0, 0];
    this.unlocks = [new Set(), new Set()];
    this.ups = [new Set(), new Set()];
    this.fog = new Uint8Array(this.MW * this.MH);
    this.fogTimer = 0;
    this.alertTimer = 0;
    this.missionTimer = 0;

    // static blockers for movement
    this.solid = new Uint8Array(this.MW * this.MH);
    this.rocks = this.map.rocks;
    this.rebuildSolid();

    // ground cache for minimap
    this.minimapDirty = true;
    this.minimapCanvas = null;

    // resources from map
    for (const t of this.map.trees) this.resources.push(this.makeResource('tree', t));
    for (const g of this.map.golds) this.resources.push(this.makeResource('crystal', g));

    // starting bases
    this.spawnBuilding('keep', this.player, this.map.startP1.x, this.map.startP1.y, true);
    this.spawnBuilding('keep', this.enemy, this.map.startP2.x, this.map.startP2.y, true);

    const p1 = this.map.startP1, p2 = this.map.startP2;
    this.spawnBuilding('farm', this.player, p1.x + 40, p1.y + 18, true);
    this.spawnBuilding('farm', this.enemy, p2.x - 40, p2.y - 18, true);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      this.spawnUnit('worker', this.player, p1.x + Math.cos(a) * 30, p1.y + Math.sin(a) * 30);
      this.spawnUnit('worker', this.enemy, p2.x + Math.cos(a) * 30, p2.y + Math.sin(a) * 30);
    }
    this.spawnUnit('soldier', this.player, p1.x - 26, p1.y + 26);
    this.spawnUnit('soldier', this.enemy, p2.x + 26, p2.y - 26);

    // AI workers auto gather
    for (const u of this.units) if (u.owner === 1 && u.type === 'worker') this.autoGather(u);
    for (const u of this.units) if (u.owner === 0 && u.type === 'worker') this.autoGather(u);

    this.ai = this.makeAI();
    this.updateFog(true);
    this.log('Your Keep stands. Gather wood and raise an army.');
  };

  /* ---------------- helpers ---------------- */
  RTS.Game.prototype.res0 = function (owner) { return this.res[owner]; };

  RTS.Game.prototype.log = function (text, kind) {
    this.effects.push({ type: 'log', text, kind: kind || 'info', t: 0, life: 4.5 });
  };
  RTS.Game.prototype.playSfx = function (name) { this.sfx.push(name); };

  RTS.Game.prototype.makeResource = function (kind, t) {
    return {
      id: uid(), kind, x: t.x, y: t.y, seed: t.seed, s: t.s,
      amount: t.amount, maxAmount: t.maxAmount, tx: t.tx, ty: t.ty, dead: false,
    };
  };

  RTS.Game.prototype.makeAI = function () {
    return {
      t: 0, think: 0, waveTimer: 0, attack: [], mode: 'grow',
      buildQueue: [], target: null, aggression: 0,
    };
  };

  /* ---------------- spawn ---------------- */
  RTS.Game.prototype.unitDef = function (type, owner) {
    const base = RTS.UNITS[type];
    const mods = this.factions[owner].mods;
    return {
      type,
      hp: Math.round(base.hp * mods.hp),
      dmg: base.dmg * mods.dmg,
      armor: base.armor,
      range: base.range * mods.range,
      cd: base.cd,
      speed: base.speed * mods.speed,
      cost: this.unitCost(type, owner),
      time: base.time,
      supply: base.supply,
      vision: base.vision,
      role: base.role,
      projectile: base.projectile || null,
      siegeBonus: base.siegeBonus || 1,
      name: base.name,
    };
  };

  RTS.Game.prototype.unitCost = function (type, owner) {
    const c = RTS.UNITS[type].cost;
    const m = this.factions[owner].mods.cost;
    return { food: Math.ceil(c.food * m), wood: Math.ceil(c.wood * m) };
  };

  RTS.Game.prototype.spawnUnit = function (type, owner, x, y) {
    const d = this.unitDef(type, owner);
    const u = {
      id: uid(), owner, type, def: d,
      x, y, vx: 0, vy: 0,
      hp: d.hp, maxHp: d.hp,
      cd: 0, attackTimer: 0,
      order: null, path: null, pathI: 0, repath: 0,
      target: null, acquire: Math.random() * 0.4,
      walk: 0, moving: false, attacking: false,
      carry: 0, carryKind: null, gatherTimer: 0, gatherState: null,
      res: null, homeRes: null, dropoff: null,
      buff: { speed: 0, dmg: 0, regen: 0, poison: 0 },
      bonusDmg: 0, bonusArmor: 0, bonusRange: 0,
      radius: type === 'siege' ? 13 : type === 'knight' ? 11 : type === 'worker' ? 6 : 7,
      dead: false, rally: null, hidden: false,
      stuckTimer: 0,
    };
    this.units.push(u);
    this.refreshPop();
    return u;
  };

  RTS.Game.prototype.spawnBuilding = function (type, owner, x, y, complete) {
    const def = RTS.BUILDINGS[type];
    const b = {
      id: uid(), owner, type, def, isBuilding: true,
      x, y, w: def.w, h: def.h,
      hp: complete ? def.hp : Math.max(12, def.hp * 0.12),
      maxHp: def.hp,
      progress: complete ? 1 : 0,
      queue: [], rally: null,
      cd: 0, attackTimer: 0,
      dead: false, flash: 0,
      hw: Math.ceil(def.w / 2 / TILE), hh: Math.ceil(def.h / 2 / TILE),
      selectedForBuild: false,
    };
    b.builders = [];
    this.buildings.push(b);
    this.rebuildSolid();
    this.refreshPop();
    return b;
  };

  RTS.Game.prototype.rebuildSolid = function () {
    this.solid.fill(0);
    const MW = this.MW, MH = this.MH;
    const mark = (cx, cy, hw, hh) => {
      for (let y = cy - hh; y <= cy + hh; y++)
        for (let x = cx - hw; x <= cx + hw; x++) {
          if (x >= 0 && y >= 0 && x < MW && y < MH) this.solid[y * MW + x] = 1;
        }
    };
    for (const r of this.rocks) mark(r.tx, r.ty, 0, 0);
  };

  RTS.Game.prototype.refreshPop = function () {
    const p = [0, 0];
    for (const u of this.units) if (!u.dead) p[u.owner] += u.def.supply;
    this.pop = p;
  };

  RTS.Game.prototype.supplyCap = function (owner) {
    let cap = 0;
    for (const b of this.buildings) if (!b.dead && b.owner === owner && b.progress >= 1) cap += b.def.supply || 0;
    return Math.min(cap, RTS.MAX_POP);
  };

  /* ---------------- walkability / path ---------------- */
  RTS.Game.prototype.blockedTile = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.MW || ty >= this.MH) return true;
    if (this.map.tiles[ty * this.MW + tx] === RTS.TILE_TYPES.WATER) return true;
    if (this.solid[ty * this.MW + tx]) return true;
    return false;
  };

  RTS.Game.prototype.blockedPoint = function (x, y) {
    return this.blockedTile(Math.floor(x / TILE), Math.floor(y / TILE));
  };

  RTS.Game.prototype.lineClear = function (ax, ay, bx, by) {
    const steps = Math.ceil(U.dist(ax, ay, bx, by) / 8);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (this.blockedPoint(U.lerp(ax, bx, t), U.lerp(ay, by, t))) return false;
    }
    return true;
  };

  RTS.Game.prototype.findPath = function (sx, sy, tx, ty) {
    const MW = this.MW, MH = this.MH;
    const s = { x: Math.floor(sx / TILE), y: Math.floor(sy / TILE) };
    let g = { x: Math.floor(tx / TILE), y: Math.floor(ty / TILE) };
    if (this.blockedTile(g.x, g.y)) {
      // find nearest walkable
      let best = null, bd = 1e9;
      for (let r = 1; r <= 4 && !best; r++) {
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const nx = g.x + dx, ny = g.y + dy;
            if (!this.blockedTile(nx, ny)) {
              const d = dx * dx + dy * dy;
              if (d < bd) { bd = d; best = { x: nx, y: ny }; }
            }
          }
      }
      if (!best) return null;
      g = best;
    }
    const N = MW * MH;
    const gScore = new Float32Array(N).fill(Infinity);
    const came = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    const heap = new Heap();
    const si = s.y * MW + s.x, gi = g.y * MW + g.x;
    gScore[si] = 0;
    const hfn = (x, y) => {
      const dx = Math.abs(x - g.x), dy = Math.abs(y - g.y);
      return (dx + dy) + (1.4142 - 2) * Math.min(dx, dy);
    };
    heap.push({ x: s.x, y: s.y, f: hfn(s.x, s.y), i: si });
    let iter = 0;
    const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
    while (heap.size()) {
      if (++iter > 9000) break;
      const cur = heap.pop();
      if (closed[cur.i]) continue;
      closed[cur.i] = 1;
      if (cur.i === gi) break;
      for (let d = 0; d < 8; d++) {
        const nx = cur.x + DIRS[d][0], ny = cur.y + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
        const ni = ny * MW + nx;
        if (closed[ni] || this.blockedTile(nx, ny)) continue;
        if (d >= 4) {
          // avoid corner cutting
          if (this.blockedTile(cur.x + DIRS[d][0], cur.y) || this.blockedTile(cur.x, cur.y + DIRS[d][1])) continue;
        }
        const ng = gScore[cur.i] + DIRS[d][2];
        if (ng < gScore[ni]) {
          gScore[ni] = ng;
          came[ni] = cur.i;
          heap.push({ x: nx, y: ny, f: ng + hfn(nx, ny), i: ni });
        }
      }
    }
    if (came[gi] === -1 && gi !== si) return null;
    // reconstruct
    const path = [];
    let ci = gi;
    let guard = 0;
    while (ci !== si && ci !== -1 && guard++ < 4000) {
      path.push({ x: (ci % MW) * TILE + TILE / 2, y: Math.floor(ci / MW) * TILE + TILE / 2 });
      ci = came[ci];
    }
    path.reverse();
    // smooth: skip waypoints in line of sight
    const out = [];
    let i = 0;
    while (i < path.length) {
      let j = path.length - 1;
      let found = -1;
      for (; j > i; j--) {
        if (this.lineClear(i === 0 ? sx : out[out.length - 1].x, i === 0 ? sy : out[out.length - 1].y, path[j].x, path[j].y)) { found = j; break; }
      }
      if (found === -1) found = i;
      out.push(path[found]);
      i = found + 1;
      if (out.length > 60) break;
    }
    return out.length ? out : null;
  };

  /* ---------------- selection API ---------------- */
  RTS.Game.prototype.selectUnits = function (units) {
    this.selected = units.slice();
    if (units.length) this.selection = { kind: 'units', units: this.selected };
    else this.selection = { kind: 'none' };
  };
  RTS.Game.prototype.selectBuilding = function (b) {
    this.selected = b ? [b] : [];
    this.selection = b ? { kind: 'building', building: b } : { kind: 'none' };
  };
  RTS.Game.prototype.clearSelection = function () {
    this.selected = [];
    this.selection = { kind: 'none' };
  };
  RTS.Game.prototype.selectedUnits = function () {
    return this.selected.filter((e) => this.units.indexOf(e) >= 0 && !e.dead);
  };
  RTS.Game.prototype.selectedBuildings = function () {
    return this.selected.filter((e) => this.buildings.indexOf(e) >= 0 && !e.dead);
  };

  /* ---------------- orders ---------------- */
  RTS.Game.prototype.unitAt = function (x, y, owner, pad) {
    pad = pad || 0;
    let best = null, bd = 1e9;
    for (const u of this.units) {
      if (u.dead) continue;
      if (owner != null && u.owner !== owner) continue;
      const r = u.radius + pad + 6;
      const d = U.dist2(x, y, u.x, u.y - 8);
      if (d <= r * r && d < bd) { bd = d; best = u; }
    }
    return best;
  };

  RTS.Game.prototype.buildingAt = function (x, y, owner) {
    for (const b of this.buildings) {
      if (b.dead) continue;
      if (owner != null && b.owner !== owner) continue;
      if (Math.abs(x - b.x) <= b.w / 2 + 3 && Math.abs(y - b.y) <= b.h / 2 + 5) return b;
    }
    return null;
  };

  RTS.Game.prototype.resourceAt = function (x, y, pad) {
    pad = pad || 8;
    let best = null, bd = 1e9;
    for (const r of this.resources) {
      if (r.dead) continue;
      const d = U.dist2(x, y, r.x, r.y - 8);
      if (d < (pad + 10) * (pad + 10) && d < bd) { bd = d; best = r; }
    }
    return best;
  };

  RTS.Game.prototype.nearestDropoff = function (owner, x, y) {
    let best = null, bd = 1e9;
    for (const b of this.buildings) {
      if (b.dead || b.owner !== owner || b.progress < 1) continue;
      const d = U.dist2(x, y, b.x, b.y);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  };

  RTS.Game.prototype.nearestResource = function (kind, x, y) {
    let best = null, bd = 1e9;
    for (const r of this.resources) {
      if (r.dead || r.kind !== kind) continue;
      const d = U.dist2(x, y, r.x, r.y);
      if (d < bd) { bd = d; best = r; }
    }
    return best;
  };

  RTS.Game.prototype.autoGather = function (u) {
    const kind = u.homeRes || (Math.random() < 0.72 ? 'tree' : 'crystal');
    const r = this.nearestResource(kind, u.x, u.y) || this.nearestResource('tree', u.x, u.y);
    if (r) this.orderGather(u, r);
  };

  RTS.Game.prototype.orderGather = function (u, res) {
    if (!res || res.dead) return;
    u.order = { type: 'gather', res };
    u.res = res;
    u.target = null;
    u.gatherState = 'seek';
    u.homeRes = res.kind;
    u.path = null;
    u.repath = 0;
  };

  RTS.Game.prototype.orderMove = function (u, x, y, keepOrder) {
    u.order = { type: 'move', x, y };
    u.target = null;
    u.gatherState = null;
    u.res = null;
    u.path = null;
    u.repath = 0;
    return u.order;
  };

  RTS.Game.prototype.orderAttack = function (u, target) {
    u.order = { type: 'attack', target };
    u.target = target;
    u.gatherState = null;
    u.res = null;
    u.path = null;
    u.repath = 0;
  };

  RTS.Game.prototype.orderStop = function (u) {
    u.order = null;
    u.target = null;
    u.path = null;
    u.gatherState = null;
    u.res = null;
    u.defending = false;
  };

  RTS.Game.prototype.orderBuild = function (u, b) {
    u.order = { type: 'build', target: b };
    u.target = b;
    u.gatherState = null;
    u.res = null;
    u.path = null;
    u.repath = 0;
    if (b.builders.indexOf(u) < 0) b.builders.push(u);
  };

  /* issue command from inputs */
  RTS.Game.prototype.commandMove = function (x, y) {
    const sel = this.selectedUnits().filter((u) => u.owner === this.player);
    if (!sel.length) return false;
    const n = sel.length;
    const cols = Math.ceil(Math.sqrt(n));
    let idx = 0;
    const sp = 26;
    for (const u of sel) {
      const cx = idx % cols, cy = Math.floor(idx / cols);
      const ox = (cx - (cols - 1) / 2) * sp;
      const oy = (cy - (Math.ceil(n / cols) - 1) / 2) * sp;
      let tx = x + ox, ty = y + oy;
      if (this.blockedPoint(tx, ty)) { tx = x; ty = y; }
      this.orderMove(u, tx, ty);
      idx++;
    }
    this.playSfx('order');
    return true;
  };

  RTS.Game.prototype.commandSmart = function (x, y) {
    const sel = this.selectedUnits().filter((u) => u.owner === this.player);
    if (!sel.length) return false;
    const enemyUnit = this.unitAt(x, y, this.enemy, 4);
    const enemyB = this.buildingAt(x, y, this.enemy);
    const res = this.resourceAt(x, y, 6);
    const ownB = this.buildingAt(x, y, this.player);
    // any visible requirement
    if (enemyUnit && this.visible(enemyUnit)) {
      for (const u of sel) this.orderAttack(u, enemyUnit);
      this.playSfx('order');
      this.effects.push({ type: 'ping', x, y, color: '#ff5a5a', t: 0, life: 0.5 });
      return true;
    }
    if (enemyB && this.visibleBuilding(enemyB)) {
      for (const u of sel) this.orderAttack(u, enemyB);
      this.playSfx('order');
      this.effects.push({ type: 'ping', x, y, color: '#ff5a5a', t: 0, life: 0.5 });
      return true;
    }
    if (res) {
      const workers = sel.filter((u) => u.type === 'worker');
      if (workers.length) {
        for (const u of workers) this.orderGather(u, res);
        const rest = sel.filter((u) => u.type !== 'worker');
        for (const u of rest) this.orderMove(u, x, y);
        this.playSfx('order');
        this.effects.push({ type: 'ping', x, y, color: '#8fe36a', t: 0, life: 0.5 });
        return true;
      }
    }
    if (ownB && ownB.progress < 1) {
      const workers = sel.filter((u) => u.type === 'worker');
      if (workers.length) {
        for (const u of workers) this.orderBuild(u, ownB);
        this.playSfx('order');
        return true;
      }
    }
    if (ownB && ownB.queue.length && ownB.def.trains) {
      ownB.rally = { x, y };
      this.effects.push({ type: 'ping', x, y, color: '#ffe066', t: 0, life: 0.6 });
      return true;
    }
    return this.commandMove(x, y);
  };

  /* ---------------- visibility ---------------- */
  RTS.Game.prototype.visibleTile = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.MW || ty >= this.MH) return 0;
    return this.fog[ty * this.MW + tx];
  };
  RTS.Game.prototype.visible = function (e) {
    return this.visibleTile(Math.floor(e.x / TILE), Math.floor(e.y / TILE)) === 2;
  };
  RTS.Game.prototype.visibleBuilding = function (b) {
    return this.visibleTile(Math.floor(b.x / TILE), Math.floor(b.y / TILE)) === 2;
  };
  RTS.Game.prototype.explored = function (e) {
    return this.visibleTile(Math.floor(e.x / TILE), Math.floor(e.y / TILE)) >= 1;
  };

  RTS.Game.prototype.updateFog = function (full) {
    const MW = this.MW, MH = this.MH;
    const fog = this.fog;
    if (full) fog.fill(0);
    // downgrade visible -> explored
    for (let i = 0; i < fog.length; i++) if (fog[i] === 2) fog[i] = 1;
    const stamp = (cx, cy, rad) => {
      const r = rad / TILE;
      const x0 = Math.max(0, Math.floor(cx / TILE - r)), x1 = Math.min(MW - 1, Math.ceil(cx / TILE + r));
      const y0 = Math.max(0, Math.floor(cy / TILE - r)), y1 = Math.min(MH - 1, Math.ceil(cy / TILE + r));
      const r2 = r * r;
      for (let y = y0; y <= y1; y++) {
        const dy = y - Math.floor(cy / TILE);
        for (let x = x0; x <= x1; x++) {
          const dx = x - Math.floor(cx / TILE);
          if (dx * dx + dy * dy <= r2) fog[y * MW + x] = 2;
        }
      }
    };
    for (const u of this.units) if (!u.dead && u.owner === this.player) stamp(u.x, u.y, u.def.vision);
    for (const b of this.buildings) if (!b.dead && b.owner === this.player) stamp(b.x, b.y, b.def.vision || 120);
  };

  /* ---------------- damage ---------------- */
  RTS.Game.prototype.damage = function (target, amount, source, isBuildingHit) {
    if (!target || target.dead) return;
    const baseArmor = target.isBuilding ? target.def.armor : target.def.armor + (target.bonusArmor || 0);
    let dmg = Math.max(1, amount - baseArmor);
    target.hp -= dmg;
    target.flash = 0.12;
    if (target === this.buildings.find((b) => b === target)) target.flash = 0.12;
    if (target.hp <= 0) this.killEntity(target, source);
    else if (source && !isBuildingHit) {
      // retaliation: idle defenders
      if (!target.order && target.owner !== 0 - 1) {
        // do nothing automatically here; acquire handles it
      }
    }
    return dmg;
  };

  RTS.Game.prototype.killEntity = function (e, source) {
    if (e.dead) return;
    e.dead = true;
    if (e.isBuilding) {
      // building
      this.effects.push({ type: 'boom', x: e.x, y: e.y - e.h / 2, t: 0, life: 0.9, s: e.w });
      this.playSfx('boom');
      this.stats.built[e.owner] = this.stats.built[e.owner];
    } else {
      this.corpses.push({ x: e.x, y: e.y, t: 0 });
      this.effects.push({ type: 'blood', x: e.x, y: e.y - 6, t: 0, life: 0.5 });
      if (this.corpses.length > 60) this.corpses.shift();
      this.stats.lost[e.owner]++;
      if (source) this.stats.kills[source.owner]++;
    }
    if (e.owner === this.player && this.buildings.indexOf(e) >= 0) this.log('Your ' + e.def.name + ' was destroyed!', 'bad');
    if (e.owner === this.enemy && this.buildings.indexOf(e) >= 0) this.log('Enemy ' + e.def.name + ' destroyed!', 'good');
    // remove from selection
    const si = this.selected.indexOf(e);
    if (si >= 0) this.selected.splice(si, 1);
    if (this.selection.kind === 'building' && this.selection.building === e) this.clearSelection();
    if (this.selection.kind === 'units') {
      this.selection.units = this.selectedUnits();
      if (!this.selection.units.length) this.clearSelection();
    }
  };

  /* ---------------- training / building ---------------- */
  RTS.Game.prototype.canAfford = function (owner, cost) {
    const r = this.res[owner];
    return r.wood >= (cost.wood || 0) && r.food >= (cost.food || 0);
  };
  RTS.Game.prototype.pay = function (owner, cost) {
    const r = this.res[owner];
    r.wood -= cost.wood || 0;
    r.food -= cost.food || 0;
  };

  RTS.Game.prototype.queueUnit = function (b, type) {
    if (b.dead || !b.def.trains || b.def.trains.indexOf(type) < 0) return false;
    const owner = b.owner;
    const cost = this.unitCost(type, owner);
    if (!this.canAfford(owner, cost)) {
      if (owner === this.player) { this.log('Not enough resources.', 'bad'); this.playSfx('deny'); }
      return false;
    }
    const supplyNeed = RTS.UNITS[type].supply;
    if (this.pop[owner] + supplyNeed > this.supplyCap(owner)) {
      if (owner === this.player) { this.log('Not enough housing - build a Farm.', 'bad'); this.playSfx('deny'); }
      return false;
    }
    if (b.queue.length >= 5) return false;
    this.pay(owner, cost);
    b.queue.push({ type, time: 0, total: RTS.UNITS[type].time });
    if (owner === this.player) { this.playSfx('train'); this.log('Training ' + RTS.UNITS[type].name + '...'); }
    return true;
  };

  RTS.Game.prototype.cancelQueue = function (b, index) {
    const item = b.queue[index];
    if (!item) return;
    b.queue.splice(index, 1);
    const cost = this.unitCost(item.type, b.owner);
    this.res[b.owner].wood += cost.wood || 0;
    this.res[b.owner].food += cost.food || 0;
    this.playSfx('click');
  };

  RTS.Game.prototype.canPlace = function (type, x, y, owner) {
    const def = RTS.BUILDINGS[type];
    if (!def || !def.buildable) return { ok: false, reason: 'Cannot build' };
    const cx = Math.floor(x / TILE), cy = Math.floor(y / TILE);
    const hw = Math.max(1, Math.ceil(def.w / 2 / TILE));
    const hh = Math.max(1, Math.ceil(def.h / 2 / TILE));
    if (cx - hw < 0 || cy - hh < 0 || cx + hw >= this.MW || cy + hh >= this.MH) return { ok: false, reason: 'Out of bounds' };
    for (const b of this.buildings) {
      if (b.dead) continue;
      if (Math.abs(x - b.x) < (def.w + b.w) / 2 + 8 && Math.abs(y - b.y) < (def.h + b.h) / 2 + 8) {
        return { ok: false, reason: 'Too close to a building' };
      }
    }
    for (let ty = cy - hh; ty <= cy + hh; ty++)
      for (let tx = cx - hw; tx <= cx + hw; tx++) {
        if (ty < 0 || tx < 0 || ty >= this.MH || tx >= this.MW) return { ok: false, reason: 'Out of bounds' };
        if (this.map.tiles[ty * this.MW + tx] === RTS.TILE_TYPES.WATER) return { ok: false, reason: 'Cannot build on water' };
        if (this.solid[ty * this.MW + tx]) return { ok: false, reason: 'Occupied' };
        const r = this.resourceAt(tx * TILE + 8, ty * TILE + 8, 8);
        if (r && U.dist(r.x, r.y, tx * TILE + 8, ty * TILE + 8) < 14) return { ok: false, reason: 'Blocked by resource' };
      }
    if (owner === this.player && !this.visibleTile(cx, cy)) return { ok: false, reason: 'Unexplored' };
    if (!this.canAfford(owner, def.cost)) return { ok: false, reason: 'Not enough wood' };
    return { ok: true };
  };

  RTS.Game.prototype.placeBuilding = function (type, x, y, owner) {
    const chk = this.canPlace(type, x, y, owner);
    if (!chk.ok) {
      if (owner === this.player) { this.log(chk.reason, 'bad'); this.playSfx('deny'); }
      return null;
    }
    const def = RTS.BUILDINGS[type];
    this.pay(owner, def.cost);
    const b = this.spawnBuilding(type, owner, x, y, false);
    b.builders = [];
    // auto assign builders
    const workers = this.units.filter((u) => !u.dead && u.owner === owner && u.type === 'worker');
    workers.sort((a, c) => U.dist2(a.x, a.y, x, y) - U.dist2(c.x, c.y, x, y));
    const wanted = Math.min(owner === this.player ? 2 : 3, workers.length);
    for (let i = 0; i < wanted; i++) this.orderBuild(workers[i], b);
    if (owner === this.player) {
      this.stats.built[owner]++;
      this.playSfx('build');
      this.log('Construction started: ' + def.name);
    }
    return b;
  };

  RTS.Game.prototype.research = function (owner, key) {
    const up = RTS.UPGRADES[key];
    if (!up || this.ups[owner].has(key)) return false;
    if (!this.canAfford(owner, up.cost)) {
      if (owner === this.player) { this.log('Not enough resources to research.', 'bad'); this.playSfx('deny'); }
      return false;
    }
    const hasBuilding = this.buildings.some((b) => !b.dead && b.owner === owner && b.type === up.need && b.progress >= 1);
    if (!hasBuilding) {
      if (owner === this.player) { this.log('Requires a ' + RTS.BUILDINGS[up.need].name + '.', 'bad'); this.playSfx('deny'); }
      return false;
    }
    this.pay(owner, up.cost);
    this.ups[owner].add(key);
    this.applyUpgrades(owner);
    if (owner === this.player) { this.log(up.name + ' researched!', 'good'); this.playSfx('done'); }
    return true;
  };

  RTS.Game.prototype.applyUpgrades = function (owner) {
    const ups = this.ups[owner];
    for (const u of this.units) {
      if (u.dead || u.owner !== owner) continue;
      u.bonusArmor = ups.has('plate') ? 2 : 0;
      let bd = 0, br = 0;
      if (ups.has('tools')) {
        if (u.def.role === 'melee') bd += 3;
        if (u.def.role === 'siege') bd += 10;
      }
      if (ups.has('fletch') && u.def.role === 'ranged') { bd += 4; br += 20; }
      u.bonusDmg = bd;
      u.bonusRange = br;
    }
  };

  /* ---------------- abilities ---------------- */
  RTS.Game.prototype.abilitiesOf = function (owner) {
    return RTS.ABILITY_SETS[this.factions[owner].id] || [];
  };

  RTS.Game.prototype.canUseAbility = function (owner, key) {
    const ab = RTS.ABILITIES[key];
    if (!ab) return false;
    if (this.abilityCd[owner] > 0) return false;
    return this.res[owner].favor >= ab.cost;
  };

  RTS.Game.prototype.useAbility = function (owner, key, x, y) {
    const ab = RTS.ABILITIES[key];
    if (!ab) return false;
    if (this.res[owner].favor < ab.cost) {
      if (owner === this.player) { this.log('Not enough Aether.', 'bad'); this.playSfx('deny'); }
      return false;
    }
    if (this.abilityCd[owner] > 0) return false;
    if (ab.needsUnits) {
      const units = owner === this.player ? this.selectedUnits() : this.units.filter((u) => !u.dead && u.owner === owner);
      if (!units.length) {
        if (owner === this.player) this.log('Select units first.', 'bad');
        return false;
      }
      for (const u of units) {
        u.x = x + (Math.random() - 0.5) * 20;
        u.y = y + (Math.random() - 0.5) * 20;
        this.effects.push({ type: 'poof', x: u.x, y: u.y, t: 0, life: 0.6 });
        u.order = null; u.path = null; u.target = null;
      }
      this.playSfx('done');
    }
    if (key === 'rally' || key === 'rally2') {
      for (const u of this.units) {
        if (u.dead || u.owner !== owner) continue;
        if (U.dist(u.x, u.y, x, y) <= ab.radius) {
          u.buff.dmg = 9;
          u.buff.regen = 9;
          u.buff.speed = key === 'rally2' ? 9 : 0;
          u.hp = Math.min(u.maxHp, u.hp + 12);
          this.effects.push({ type: 'buff', x: u.x, y: u.y - 10, t: 0, life: 0.9, color: '#ffe066' });
        }
      }
      this.effects.push({ type: 'ring', x, y, r: ab.radius, color: '#ffe066', t: 0, life: 0.8 });
      this.playSfx('done');
    } else if (key === 'meteor' || key === 'shrapnel') {
      const dmg = key === 'meteor' ? 70 : 52;
      for (const u of this.units) {
        if (u.dead || u.owner === owner) continue;
        if (U.dist(u.x, u.y, x, y) <= ab.radius) {
          this.damage(u, dmg * (1 - U.dist(u.x, u.y, x, y) / (ab.radius * 2)), { owner, x, y, def: {} }, false);
        }
      }
      for (const b of this.buildings) {
        if (b.dead || b.owner === owner) continue;
        if (U.dist(b.x, b.y, x, y) <= ab.radius + b.w / 2) this.damage(b, dmg * 0.7, { owner, def: {} }, true);
      }
      this.effects.push({ type: 'meteor', x, y, t: 0, life: 1.1, r: ab.radius });
      this.playSfx('boom');
    } else if (key === 'spore') {
      for (const u of this.units) {
        if (u.dead || u.owner === owner) continue;
        if (U.dist(u.x, u.y, x, y) <= ab.radius) {
          u.buff.poison = 6;
          u.buff.poisonDmg = 8;
          this.effects.push({ type: 'poison', x: u.x, y: u.y - 8, t: 0, life: 1.2 });
        }
      }
      this.effects.push({ type: 'spore', x, y, r: ab.radius, t: 0, life: 1.4 });
      this.playSfx('boom');
    }
    this.res[owner].favor -= ab.cost;
    this.abilityCd[owner] = ab.cd;
    return true;
  };

  /* ---------------- unit update ---------------- */
  RTS.Game.prototype.stepTowards = function (u, tx, ty, dt, speedMul) {
    const dx = tx - u.x, dy = ty - u.y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return true;
    const sp = u.def.speed * (1 + (u.buff.speed > 0 ? 0.5 : 0)) * (speedMul || 1);
    const step = Math.min(d, sp * dt);
    u.x += (dx / d) * step;
    u.y += (dy / d) * step;
    u.moving = true;
    u.walk += dt * (sp / 40);
    return d - step < 2;
  };

  RTS.Game.prototype.followPath = function (u, tx, ty, dt) {
    if (this.lineClear(u.x, u.y, tx, ty)) {
      u.path = null;
      return this.stepTowards(u, tx, ty, dt);
    }
    u.repath -= dt;
    if (!u.path || u.repath <= 0) {
      u.path = this.findPath(u.x, u.y, tx, ty);
      u.pathI = 0;
      u.repath = 1.4 + Math.random() * 0.6;
    }
    if (!u.path || !u.path.length) {
      return this.stepTowards(u, tx, ty, dt);
    }
    let wp = u.path[u.pathI];
    while (wp && U.dist(u.x, u.y, wp.x, wp.y) < 7) {
      u.pathI++;
      wp = u.path[u.pathI];
    }
    if (!wp) {
      u.path = null;
      return this.stepTowards(u, tx, ty, dt);
    }
    return this.stepTowards(u, wp.x, wp.y, dt);
  };

  RTS.Game.prototype.targetRadius = function (t) {
    return t.radius || Math.max(t.w, t.h) / 2;
  };

  RTS.Game.prototype.attackRangeOf = function (u) {
    return u.def.range + (u.bonusRange || 0);
  };

  /* distance from a unit to the target's *body edge* */
  RTS.Game.prototype.edgeDist = function (u, t) {
    if (t.isBuilding) {
      const dx = Math.max(0, Math.abs(u.x - t.x) - t.w / 2);
      const dy = Math.max(0, Math.abs(u.y - t.y) - t.h / 2);
      return Math.hypot(dx, dy);
    }
    const dx = u.x - t.x, dy = u.y - t.y;
    return Math.max(0, Math.hypot(dx, dy) - (t.radius || 7));
  };

  /* a point just outside the target's wall, along the unit's approach vector */
  RTS.Game.prototype.attackGoal = function (u, t) {
    if (!t.isBuilding) {
      const dx = u.x - t.x, dy = u.y - t.y;
      const d = Math.hypot(dx, dy) || 1;
      const want = (t.radius || 7) + u.radius + Math.max(2, this.attackRangeOf(u) * 0.35);
      if (d <= want) return { x: u.x, y: u.y };
      return { x: t.x + (dx / d) * want, y: t.y + (dy / d) * want };
    }
    const cx = U.clamp(u.x, t.x - t.w / 2, t.x + t.w / 2);
    const cy = U.clamp(u.y, t.y - t.h / 2, t.y + t.h / 2);
    let dx = u.x - cx, dy = u.y - cy;
    let d = Math.hypot(dx, dy);
    if (d < 0.001) {
      dx = u.x < t.x ? -1 : 1;
      dy = u.y < t.y ? -0.15 : 0.15;
      d = Math.hypot(dx, dy);
    }
    const want = u.radius + Math.max(5, this.attackRangeOf(u) * 0.55);
    return { x: cx + (dx / d) * want, y: cy + (dy / d) * want };
  };

  RTS.Game.prototype.tryAttack = function (u, target, dt) {
    const range = this.attackRangeOf(u);
    const d = this.edgeDist(u, target);
    const allow = target.isBuilding ? u.radius : u.radius * 0.5;
    if (d > range + allow + 2) return false;
    u.attacking = true;
    if (u.cd > 0) return true;
    const cdMul = u.buff.dmg > 0 ? 0.62 : 1;
    u.cd = u.def.cd * cdMul;
    const isB = !!target.isBuilding;
    let dmg = u.def.dmg + (u.bonusDmg || 0);
    if (isB && u.def.siegeBonus > 1) dmg *= u.def.siegeBonus;
    if (u.def.projectile) {
      const ang = Math.atan2(target.y - 8 - (u.y - 8), target.x - u.x);
      this.projectiles.push({
        x: u.x, y: u.y - 10, tx: target.x, ty: target.y - 8,
        speed: 300, dmg, owner: u.owner, target, kind: u.def.projectile, ang, life: 1.6,
      });
    } else {
      this.damage(target, dmg, u, isB);
      this.effects.push({ type: 'hit', x: target.x + (Math.random() - 0.5) * 8, y: target.y - 8, t: 0, life: 0.3 });
      if (Math.random() < 0.6) this.playSfx('hit');
    }
    return true;
  };

  RTS.Game.prototype.acquireTarget = function (u, radius) {
    const enemyOwner = 1 - u.owner;
    let best = null, bd = 1e9;
    const rad = radius || 190;
    for (const o of this.units) {
      if (o.dead || o.owner !== enemyOwner) continue;
      const d = U.dist2(u.x, u.y, o.x, o.y);
      if (d < rad * rad && d < bd) { bd = d; best = o; }
    }
    if (best) return best;
    // then buildings (prioritise military ones)
    for (const b of this.buildings) {
      if (b.dead || b.owner !== enemyOwner) continue;
      const d = U.dist2(u.x, u.y, b.x, b.y);
      const maxD = (rad + b.w / 2) * (rad + b.w / 2);
      if (d < maxD && d < bd) { bd = d; best = b; }
    }
    return best;
  };

  RTS.Game.prototype.validTarget = function (u, t) {
    if (!t || t.dead) return false;
    if (t.owner === u.owner) return false;
    return true;
  };

  RTS.Game.prototype.updateUnit = function (u, dt) {
    if (u.dead) return;
    u.moving = false;
    u.attacking = false;
    u.flash = Math.max(0, (u.flash || 0) - dt);
    if (u.cd > 0) u.cd -= dt;
    // buffs
    if (u.buff.dmg > 0) u.buff.dmg -= dt;
    if (u.buff.speed > 0) u.buff.speed -= dt;
    if (u.buff.regen > 0) {
      u.buff.regen -= dt;
      u.hp = Math.min(u.maxHp, u.hp + 6 * dt);
    }
    if (u.buff.poison > 0) {
      u.buff.poison -= dt;
      u.hp -= (u.buff.poisonDmg || 8) * dt;
      if (Math.random() < dt * 3) this.effects.push({ type: 'poison', x: u.x + (Math.random() - 0.5) * 8, y: u.y - 6, t: 0, life: 0.4 });
      if (u.hp <= 0) { this.killEntity(u, null); return; }
    }
    if (u.hp < u.maxHp && u.buff.regen <= 0 && !u.attacking && u.buff.poison <= 0) {
      // slow passive regen near own buildings
      const b = this.nearestDropoff(u.owner, u.x, u.y);
      if (b && U.dist2(b.x, b.y, u.x, u.y) < 200 * 200) u.hp = Math.min(u.maxHp, u.hp + 1.2 * dt);
    }

    const order = u.order;

    if (order && order.type === 'gather' && u.type === 'worker') {
      this.updateGather(u, dt);
    } else if (order && order.type === 'build' && u.type === 'worker') {
      const b = order.target;
      if (!b || b.dead || b.progress >= 1) {
        if (b && !b.dead && b.progress >= 1) {
          // finished; if player owned and idle, gather
          const bi = b.builders.indexOf(u);
          if (bi >= 0) b.builders.splice(bi, 1);
        }
        u.order = null;
        if (u.owner === 1) this.autoGather(u);
      } else {
        const reach = u.radius + 12;
        const d = this.edgeDist(u, b);
        if (d > reach) {
          if (b.builders.indexOf(u) < 0) b.builders.push(u);
          // aim for the nearest point on the building's expanded box
          const goal = this.attackGoal(u, b);
          const before = U.dist2(u.x, u.y, goal.x, goal.y);
          this.followPath(u, goal.x, goal.y, dt);
          const after = U.dist2(u.x, u.y, goal.x, goal.y);
          if (before - after < 0.4) {
            u.stuckTimer = (u.stuckTimer || 0) + dt;
            if (u.stuckTimer > 1.1) {
              u.stuckTimer = 0;
              u.buildTry = (u.buildTry || 0) + 1;
              const ang = Math.random() * Math.PI * 2;
              const ox = b.x + Math.cos(ang) * (b.w / 2 + 22);
              const oy = b.y + Math.sin(ang) * (b.h / 2 + 22);
              if (!this.blockedPoint(ox, oy)) { u.x = ox; u.y = oy; u.path = null; }
              else { u.path = null; u.repath = 0; }
            }
          } else {
            u.stuckTimer = 0;
            u.buildTry = 0;
          }
        } else {
          u.attacking = true;
          u.walk += dt * 2;
          u.stuckTimer = 0;
          if (b.builders.indexOf(u) < 0) b.builders.push(u);
        }
      }
    } else if (order && order.type === 'attack') {
      const t = order.target;
      if (!this.validTarget(u, t)) {
        // retarget nearby or stop
        const nt = this.acquireTarget(u, 200);
        if (nt) { order.target = nt; u.target = nt; }
        else u.order = null;
      } else {
        u.target = t;
        if (!this.tryAttack(u, t, dt)) {
          const goal = this.attackGoal(u, t);
          this.followPath(u, goal.x, goal.y, dt);
        }
      }
    } else if (order && order.type === 'move') {
      const done = this.followPath(u, order.x, order.y, dt);
      if (done) {
        u.order = null;
        u.path = null;
      }
    } else {
      // idle: auto attack
      u.acquire -= dt;
      if (u.acquire <= 0) {
        u.acquire = 0.45 + Math.random() * 0.3;
        const radius = u.owner === 0 ? 150 : 170;
        const t = this.acquireTarget(u, radius);
        if (t) {
          // don't chase too far: only engage if reasonably near
          if (U.dist2(u.x, u.y, t.x, t.y) < radius * radius) {
            u.order = { type: 'attack', target: t };
            u.target = t;
          }
        }
      }
      if (!u.order) {
        // idle workers keep gathering if they finished
        if (u.type === 'worker' && u.owner === 1 && !u.gatherState) this.autoGather(u);
        u.walk += dt * 0.5;
      }
    }

    // separation from other units
    this.separate(u, dt);

    // clamp to world & avoid water by pushing back
    u.x = U.clamp(u.x, 8, this.worldW - 8);
    u.y = U.clamp(u.y, 8, this.worldH - 8);
    if (this.blockedPoint(u.x, u.y)) {
      // nudge out
      let best = null, bd = 1e9;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const nx = u.x + Math.cos(ang) * 12, ny = u.y + Math.sin(ang) * 12;
        if (!this.blockedPoint(nx, ny)) {
          const d = U.dist2(nx, ny, u.x, u.y);
          if (d < bd) { bd = d; best = { x: nx, y: ny }; }
        }
      }
      if (best) { u.x = best.x; u.y = best.y; }
    }
  };

  RTS.Game.prototype.separate = function (u, dt) {
    const list = this.units;
    const len = list.length;
    let px = 0, py = 0, n = 0;
    for (let i = 0; i < len; i++) {
      const o = list[i];
      if (o === u || o.dead) continue;
      const dx = u.x - o.x, dy = u.y - o.y;
      const rr = (u.radius + o.radius) * 0.9;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rr * rr) {
        // engaged melee units can overlap a little so fronts stay readable
        const engaged = u.target === o || o.target === u;
        const k = engaged ? 0.35 : 1;
        const d = Math.sqrt(d2);
        const push = ((rr - d) / rr) * k;
        px += (dx / d) * push;
        py += (dy / d) * push;
        n++;
      }
    }
    if (n) {
      const k = 30 * dt;
      u.x += px * k;
      u.y += py * k;
    }
    // push out of buildings (attackers may hug walls)
    for (const b of this.buildings) {
      if (b.dead) continue;
      const hug = u.attacking && u.target === b ? -(u.radius * 0.7) : 0;
      const halfW = b.w / 2 + u.radius + hug, halfH = b.h / 2 + u.radius + hug;
      const dx = u.x - b.x, dy = u.y - b.y;
      if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {
        const ox = halfW - Math.abs(dx);
        const oy = halfH - Math.abs(dy);
        if (ox < oy) u.x += (dx > 0 ? ox : -ox);
        else u.y += (dy > 0 ? oy : -oy);
      }
    }
  };

  RTS.Game.prototype.updateGather = function (u, dt) {
    const res = u.order.res;
    if (!res || res.dead) {
      // find another of same kind
      const nr = this.nearestResource(u.homeRes || 'tree', u.x, u.y);
      if (nr) { this.orderGather(u, nr); return; }
      u.order = null;
      return;
    }
    if (u.gatherState === 'seek') {
      const d = U.dist(u.x, u.y, res.x, res.y);
      if (d < 22 + u.radius) {
        u.gatherState = 'harvest';
        u.gatherTimer = 0;
        u.path = null;
      } else {
        this.followPath(u, res.x, res.y, dt);
      }
    } else if (u.gatherState === 'harvest') {
      if (res.dead) { u.gatherState = null; u.order = null; return; }
      u.attacking = true;
      u.walk += dt * 3;
      u.gatherTimer += dt;
      if (u.gatherTimer >= 0.55) {
        u.gatherTimer = 0;
        const take = Math.min(6, res.amount) * (u.owner === 1 && this.diff.gather ? this.diff.gather : 1);
        res.amount -= take;
        u.carry += take;
        u.carryKind = res.kind;
        this.effects.push({ type: res.kind === 'tree' ? 'wood' : 'spark', x: res.x, y: res.y - 14, t: 0, life: 0.5 });
        if (res.amount <= 0) {
          res.dead = true;
          this.effects.push({ type: 'poof', x: res.x, y: res.y - 8, t: 0, life: 0.6 });
          const nr = this.nearestResource(res.kind, u.x, u.y);
          if (nr) { this.orderGather(u, nr); return; }
        }
        if (u.carry >= 12) {
          u.gatherState = 'return';
          const drop = this.nearestDropoff(u.owner, u.x, u.y);
          u.dropoff = drop;
          u.path = null;
          if (!drop) { u.carry = 0; u.gatherState = 'harvest'; }
        }
      }
    } else if (u.gatherState === 'return') {
      let drop = u.dropoff;
      if (!drop || drop.dead) drop = u.dropoff = this.nearestDropoff(u.owner, u.x, u.y);
      if (!drop) { u.carry = 0; u.gatherState = 'seek'; return; }
      const d = U.dist(u.x, u.y, drop.x, drop.y);
      if (d < Math.max(drop.w, drop.h) / 2 + 18) {
        if (u.carryKind === 'crystal') {
          this.res[u.owner].favor = Math.min(100, this.res[u.owner].favor + u.carry * 0.7);
          this.res[u.owner].wood += Math.floor(u.carry * 0.25);
        } else {
          this.res[u.owner].wood += u.carry;
        }
        if (u.owner === 0) this.effects.push({ type: 'float', x: drop.x, y: drop.y - drop.h / 2 - 6, text: '+' + Math.floor(u.carry), color: u.carryKind === 'crystal' ? '#9fe8ff' : '#e8c15a', t: 0, life: 0.9 });
        u.carry = 0;
        u.gatherState = 'seek';
        if (u.order.res && u.order.res.dead) {
          const nr = this.nearestResource(u.homeRes, u.x, u.y);
          if (nr) this.orderGather(u, nr);
        }
      } else {
        this.followPath(u, drop.x, drop.y, dt);
      }
    }
  };

  /* ---------------- buildings update ---------------- */
  RTS.Game.prototype.updateBuilding = function (b, dt) {
    if (b.dead) return;
    b.flash = Math.max(0, (b.flash || 0) - dt);
    if (b.progress < 1) {
      // count builders present
      let builders = 0;
      for (const u of b.builders) {
        if (u.dead) continue;
        if (U.dist(u.x, u.y, b.x, b.y) < Math.max(b.w, b.h) / 2 + 30) builders++;
      }
      if (builders > 0) {
        const rate = (1 / b.def.time) * builders * 1.1;
        b.progress = Math.min(1, b.progress + rate * dt);
        b.hp = Math.max(b.hp, b.maxHp * (0.12 + 0.88 * b.progress));
        if (b.progress >= 1) {
          b.hp = b.maxHp;
          b.builders.length = 0;
          this.rebuildSolid();
          if (b.owner === this.player) {
            this.playSfx('done');
            this.log(b.def.name + ' complete.', 'good');
          }
        }
      }
    }
    // training
    if (b.queue.length && b.progress >= 1) {
      const item = b.queue[0];
      const speed = b.owner === 1 ? this.diff.apm : 1;
      item.time += dt * speed;
      if (item.time >= item.total) {
        b.queue.shift();
        const cap = this.supplyCap(b.owner);
        if (this.pop[b.owner] + RTS.UNITS[item.type].supply <= cap) {
          const ang = b.rally ? Math.atan2(b.rally.y - b.y, b.rally.x - b.x) : Math.PI * 0.5;
          const dist = Math.max(b.w, b.h) / 2 + 16;
          const u = this.spawnUnit(item.type, b.owner, b.x + Math.cos(ang) * dist, b.y + Math.sin(ang) * dist);
          u.order = b.rally ? { type: 'move', x: b.rally.x, y: b.rally.y } : null;
          if (b.owner === 1) {
            if (item.type === 'worker') this.autoGather(u);
            else { u.homePos = { x: b.x, y: b.y }; }
          } else {
            this.playSfx('done');
          }
        } else if (b.owner === this.player) {
          this.log('Housing full - build a Farm.', 'bad');
        }
      }
    }
    // tower attack
    if (b.def.attack && b.progress >= 1) {
      b.cd -= dt;
      const at = b.def.attack;
      if (b.cd <= 0) {
        let best = null, bd = at.range * at.range;
        for (const u of this.units) {
          if (u.dead || u.owner === b.owner) continue;
          const d = U.dist2(u.x, u.y, b.x, b.y);
          if (d < bd) { bd = d; best = u; }
        }
        if (best) {
          b.cd = at.cd;
          this.projectiles.push({
            x: b.x, y: b.y - b.h / 2, tx: best.x, ty: best.y - 8, speed: 340,
            dmg: at.dmg + (this.ups[b.owner].has('fletch') ? 4 : 0), owner: b.owner, target: best,
            kind: 'arrow', ang: 0, life: 1.4,
          });
        }
      }
    }
    // farm production
    if (b.def.produces === 'food' && b.progress >= 1) {
      const mul = this.ups[b.owner].has('crop') ? 1.6 : 1;
      this.res[b.owner].food += b.def.rate * mul * dt;
    }
  };

  /* ---------------- projectiles / effects ---------------- */
  RTS.Game.prototype.updateProjectiles = function (dt) {
    for (const p of this.projectiles) {
      if (p.done) continue;
      p.life -= dt;
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      p.ang = Math.atan2(dy, dx);
      const step = p.speed * dt;
      if (d <= step || p.life <= 0) {
        p.done = true;
        const t = p.target;
        if (t && !t.dead) {
          const isB = !!t.isBuilding;
          this.damage(t, p.dmg, { owner: p.owner, x: p.x, y: p.y, def: {} }, isB);
          this.effects.push({ type: 'hit', x: p.tx, y: p.ty, t: 0, life: 0.3 });
        }
      } else {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
      }
    }
    if (this.projectiles.length > 240) this.projectiles = this.projectiles.filter((p) => !p.done);
    else if (this.projectiles.some((p) => p.done)) this.projectiles = this.projectiles.filter((p) => !p.done);
  };

  RTS.Game.prototype.updateEffects = function (dt) {
    for (const e of this.effects) e.t += dt;
    this.effects = this.effects.filter((e) => e.t < e.life);
    for (const c of this.corpses) c.t += dt;
    this.corpses = this.corpses.filter((c) => c.t < 16);
  };

  /* ---------------- AI ---------------- */
  RTS.Game.prototype.makePlacement = function (owner, type, nearX, nearY) {
    const rnd = Math.random;
    // 1) tidy rings around the keep
    for (let r = 4; r < 14; r++) {
      const n = 8 + r * 2;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + r * 0.37;
        const x = nearX + Math.cos(ang) * r * TILE;
        const y = nearY + Math.sin(ang) * r * TILE;
        if (this.canPlace(type, x, y, owner).ok) return { x, y };
      }
    }
    // 2) random scatter in a wider ring (crowded bases)
    for (let i = 0; i < 90; i++) {
      const ang = rnd() * Math.PI * 2;
      const r = (5 + rnd() * 13) * TILE;
      const x = nearX + Math.cos(ang) * r;
      const y = nearY + Math.sin(ang) * r;
      if (this.canPlace(type, x, y, owner).ok) return { x, y };
    }
    return null;
  };

  RTS.Game.prototype.updateAI = function (dt) {
    const ai = this.ai;
    if (this.gameOver) return;
    ai.t += dt;
    ai.waveTimer += dt;
    ai.think -= dt;
    const owner = 1;
    const res = this.res[owner];
    const keep = this.buildings.find((b) => !b.dead && b.owner === owner && b.type === 'keep');
    if (!keep) return;

    // continuous: keep production running
    if (ai.think <= 0) {
      ai.think = 0.6 / this.diff.apm;

      const myUnits = this.units.filter((u) => !u.dead && u.owner === owner);
      const workers = myUnits.filter((u) => u.type === 'worker');
      const army = myUnits.filter((u) => u.type !== 'worker');

      // 1. keep training peasants up to target
      const workerTarget = this.diff.workers || 8;
      if (workers.length < workerTarget && keep.queue.length < 2) {
        if (this.pop[owner] + 1 <= this.supplyCap(owner)) this.queueUnit(keep, 'worker');
      }

      // 2. assign idle workers
      for (const w of workers) {
        if (!w.order) {
          if (w.gatherState) continue;
          this.autoGather(w);
        }
      }
      // rebalance some to crystal
      if (this.time > 45 && Math.random() < 0.15) {
        const miners = workers.filter((w) => w.homeRes === 'crystal').length;
        if (miners < 2) {
          const w = workers[0];
          if (w) {
            const r = this.nearestResource('crystal', w.x, w.y);
            if (r) this.orderGather(w, r);
          }
        }
      }

      // 3. buildings
      const count = (t) => this.buildings.filter((b) => !b.dead && b.owner === owner && b.type === t).length;
      const pending = (t) => this.buildings.filter((b) => !b.dead && b.owner === owner && b.type === t && b.progress < 1).length;
      const underConstruction = this.buildings.filter((b) => !b.dead && b.owner === owner && b.progress < 1).length;
      const canStartNew = underConstruction < 2;
      const capNow = this.supplyCap(owner);
      const capSoon = capNow + pending('farm') * RTS.BUILDINGS.farm.supply;
      if (canStartNew && capSoon - this.pop[owner] < 6 && count('farm') + pending('farm') < 6 && res.wood >= 40) {
        const spot = this.makePlacement(owner, 'farm', keep.x, keep.y);
        if (spot) this.placeBuilding('farm', spot.x, spot.y, owner);
      }
      const barracksN = count('barracks') + pending('barracks');
      const wantBarracks = this.time > 150 ? 2 : 1;
      // military first: early barracks before extra farms
      if (canStartNew && barracksN < wantBarracks && res.wood >= 105) {
        if (this.pop[owner] + 8 <= this.supplyCap(owner) + pending('farm') * 5 || count('barracks') > 0) {
          const spot = this.makePlacement(owner, 'barracks', keep.x, keep.y);
          if (spot) this.placeBuilding('barracks', spot.x, spot.y, owner);
        }
      }
      if (canStartNew && count('workshop') + pending('workshop') < 1 && res.wood >= 165 && this.time > 90) {
        const spot = this.makePlacement(owner, 'workshop', keep.x, keep.y);
        if (spot) this.placeBuilding('workshop', spot.x, spot.y, owner);
      }
      if (canStartNew && res.wood > 500 && count('farm') + pending('farm') < 6) {
        const spot = this.makePlacement(owner, 'farm', keep.x, keep.y);
        if (spot) this.placeBuilding('farm', spot.x, spot.y, owner);
      }
      if (canStartNew && count('tower') < 2 && res.wood >= 220 && this.time > 110) {
        const spot = this.makePlacement(owner, 'tower', keep.x, keep.y);
        if (spot) this.placeBuilding('tower', spot.x, spot.y, owner);
      }

      // 4. army production
      const barracks = this.buildings.filter((b) => !b.dead && b.owner === owner && b.type === 'barracks');
      for (const b of barracks) {
        if (b.queue.length < 2) {
          const roll = Math.random();
          let type = 'soldier';
          if (this.time > 120 && roll < 0.28) type = 'archer';
          else if (this.time > 200 && roll < 0.18) type = 'knight';
          this.queueUnit(b, type);
        }
      }
      const workshop = this.buildings.filter((b) => !b.dead && b.owner === owner && b.type === 'workshop');
      for (const b of workshop) {
        if (b.queue.length < 1 && this.time > 160 && res.wood > 60) this.queueUnit(b, 'siege');
        if (this.time > 200 && !this.ups[owner].has('tools') && res.wood > 220) this.research(owner, 'tools');
        if (this.time > 260 && !this.ups[owner].has('plate') && res.wood > 260) this.research(owner, 'plate');
      }

      // 5. military behaviour
      const idleArmy = army.filter((u) => !u.order);
      const threat = this.units.filter((u) => !u.dead && u.owner === 0 && U.dist(u.x, u.y, keep.x, keep.y) < 320);
      if (threat.length > 0) {
        ai.mode = 'defend';
        for (const u of idleArmy) {
          const t = threat[(Math.random() * threat.length) | 0];
          if (t) this.orderAttack(u, t);
        }
      } else {
        if (ai.mode === 'defend') ai.mode = 'grow';
        const waveInterval = this.diff.firstWave || 140;
        const waveSize = Math.min(10, Math.round((3 + Math.floor(this.time / 180)) * this.diff.wave));
        const timed = idleArmy.length >= waveSize && ai.waveTimer > waveInterval;
        const strong = idleArmy.length >= 7 + Math.round(this.diff.wave * 2) && ai.waveTimer > waveInterval * 0.55;
        const ready = timed || strong;
        if (ready) {
          ai.waveTimer = 0;
          // leave a small garrison at home
          ai.garrison = idleArmy.slice(0, 1);
          idleArmy.splice(0, 1);
          ai.mode = 'attack';
          const targetB = this.buildings.find((b) => !b.dead && b.owner === 0 && b.type === 'keep') || this.buildings.find((b) => !b.dead && b.owner === 0);
          if (targetB) {
            for (const u of idleArmy) {
              this.orderAttack(u, targetB);
              u.stuckTimer = 0;
            }
            if (idleArmy.length > 0) {
              this.log('Enemy warband is marching!', 'bad');
              this.effects.push({ type: 'warn', x: targetB.x, y: targetB.y, t: 0, life: 2.4 });
              this.playSfx('deny');
              ai.mode = 'marching';
            }
          }
        }
      }

      // 6. abilities: use meteor/shrapnel on player clusters
      const abil = this.abilitiesOf(owner);
      const canCast = (this.diff.powers || 0) > 0 && Math.random() < (this.diff.powers >= 2 ? 0.35 : 0.14);
      if (canCast && this.canUseAbility(owner, abil[1])) {
        const pUnits = this.units.filter((u) => !u.dead && u.owner === 0);
        if (pUnits.length >= 3) {
          // find densest cluster
          let best = null, bestN = 0;
          for (const u of pUnits) {
            let n = 0;
            for (const o of pUnits) if (U.dist2(u.x, u.y, o.x, o.y) < 60 * 60) n++;
            if (n > bestN) { bestN = n; best = u; }
          }
          if (best && bestN >= 4 && Math.random() < 0.25) {
            this.useAbility(owner, abil[1], best.x, best.y);
            this.log('The enemy unleashes dark power!', 'bad');
          }
        }
      }
      if (canCast && this.canUseAbility(owner, abil[0]) && Math.random() < 0.2) {
        const army2 = this.units.filter((u) => !u.dead && u.owner === owner && u.type !== 'worker');
        if (army2.length >= 3) {
          const c = army2[(Math.random() * army2.length) | 0];
          this.useAbility(owner, abil[0], c.x, c.y);
        }
      }
    }

    if (this.mission === 'flood' && this.time > 540 && !this.aiRushed) {
      this.aiRushed = true;
      const army = this.units.filter((u) => !u.dead && u.owner === owner && u.type !== 'worker');
      const t = this.buildings.find((b) => !b.dead && b.owner === 0 && b.type === 'keep');
      if (t) for (const u of army) this.orderAttack(u, t);
    }
  };

  /* ---------------- main update ---------------- */
  RTS.Game.prototype.update = function (dt) {
    if (this.gameOver || this.paused) return;
    dt = Math.min(dt, 0.05) * this.speed;
    this.time += dt;

    // resources: passive
    for (let o = 0; o < 2; o++) {
      if (this.buildings.some((b) => !b.dead && b.owner === o && b.type === 'keep')) {
        this.res[o].food += 0.5 * dt;
      }
    }
    this.res[0].favor = Math.min(100, this.res[0].favor + 0.42 * dt);
    this.res[1].favor = Math.min(100, this.res[1].favor + 0.42 * dt);
    this.res[0].food = Math.min(9999, this.res[0].food);
    for (let o = 0; o < 2; o++) if (this.abilityCd[o] > 0) this.abilityCd[o] = Math.max(0, this.abilityCd[o] - dt);

    this.updateAI(dt);
    for (const u of this.units) this.updateUnit(u, dt);
    for (const b of this.buildings) this.updateBuilding(b, dt);
    this.updateProjectiles(dt);
    this.updateEffects(dt);

    // cleanup dead
    if (this.units.some((u) => u.dead)) {
      this.units = this.units.filter((u) => !u.dead);
      for (const b of this.buildings) b.builders = b.builders.filter((u) => !u.dead);
      this.refreshPop();
    }
    if (this.buildings.some((b) => b.dead)) {
      this.buildings = this.buildings.filter((b) => !b.dead);
      this.rebuildSolid();
      this.refreshPop();
    }

    this.fogTimer -= dt;
    if (this.fogTimer <= 0) {
      this.fogTimer = 0.25;
      this.updateFog(false);
    }

    // win / lose
    const pKeep = this.buildings.some((b) => !b.dead && b.owner === 0 && b.type === 'keep');
    const eKeep = this.buildings.some((b) => !b.dead && b.owner === 1 && b.type === 'keep');
    if (!eKeep && !this.gameOver) {
      this.gameOver = true;
      this.result = 'win';
      this.playSfx('win');
    } else if (!pKeep && !this.gameOver) {
      this.gameOver = true;
      this.result = 'lose';
      this.playSfx('lose');
    }
    // mission timer for flood
    if (this.mission === 'flood' && !this.gameOver && this.time > 900) {
      this.gameOver = true;
      this.result = 'lose';
    }
  };

  RTS.Game.prototype.destroyAllPlayerBuildings = function () {
    for (const b of this.buildings) if (b.owner === 0) this.killEntity(b, null);
  };

  RTS.Game.prototype.formatTime = function () {
    const t = Math.floor(this.time);
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };

  RTS.Game.prototype.selectedInfo = function () {
    const units = this.selectedUnits();
    const bs = this.selectedBuildings();
    if (units.length === 1) {
      const u = units[0];
      return { kind: 'unit', unit: u, count: 1, name: u.def.name, hp: u.hp, maxHp: u.maxHp };
    }
    if (units.length > 1) {
      const counts = {};
      for (const u of units) counts[u.type] = (counts[u.type] || 0) + 1;
      const names = Object.keys(counts).map((k) => RTS.UNITS[k].name + '×' + counts[k]);
      return { kind: 'group', units, count: units.length, name: 'Army', detail: names.join(', ') };
    }
    if (bs.length === 1) {
      const b = bs[0];
      return { kind: 'building', building: b, name: b.def.name, hp: b.hp, maxHp: b.maxHp };
    }
    return { kind: 'none' };
  };
})();
