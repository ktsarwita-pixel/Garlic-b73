/* GARLIC WARS - terrain generation */
(function () {
  'use strict';
  const RTS = window.RTS;
  const U = RTS.util;

  const T = (RTS.TILE_TYPES = {
    GRASS: 0,
    DIRT: 1,
    WATER: 2,
    SAND: 3,
    FOREST_FLOOR: 4,
    ROCK: 5,
    PATH: 6,
  });

  /* props are grouped per tile for cheap culling */
  RTS.Grid = function (w, h, fill) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h);
    if (fill) this.data.fill(fill);
  };
  RTS.Grid.prototype.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[y * this.w + x];
  };
  RTS.Grid.prototype.set = function (x, y, v) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.data[y * this.w + x] = v;
  };
  RTS.Grid.prototype.solid = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return true;
    return this.data[y * this.w + x] === 1;
  };

  RTS.generateMap = function (seed) {
    const MW = RTS.MAP_W, MH = RTS.MAP_H, N = MW * MH;
    const tiles = new Uint8Array(N);
    const rnd = U.mulberry32(seed);

    const startP1 = { x: 15, y: MH - 16 };
    const startP2 = { x: MW - 16, y: 15 };

    const baseDist = (tx, ty) => {
      const d1 = Math.hypot(tx - startP1.x, ty - startP1.y);
      const d2 = Math.hypot(tx - startP2.x, ty - startP2.y);
      return Math.min(d1, d2);
    };

    // -- base terrain from noise --
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        const n = U.fbm(x * 0.09, y * 0.09, seed, 3);
        const n2 = U.fbm(x * 0.35 + 11, y * 0.35 - 7, seed + 91, 2);
        // central lake
        const lake = Math.hypot(x - MW * 0.5 + 6, y - MH * 0.5 - 4);
        const lakeN = U.fbm(x * 0.16, y * 0.16, seed + 555, 3);
        let t = T.GRASS;
        if (n > 0.62 && baseDist(x, y) > 12) t = T.FOREST_FLOOR;
        if (n < 0.34) t = T.DIRT;
        if (lake < 9 + lakeN * 7 && baseDist(x, y) > 11) t = T.WATER;
        if (n2 > 0.80 && t === T.GRASS) t = T.DIRT;
        tiles[y * MW + x] = t;
      }
    }

    // sand around water
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        if (tiles[y * MW + x] !== T.WATER) {
          let near = false;
          for (let dy = -1; dy <= 1 && !near; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < MW && ny < MH && tiles[ny * MW + nx] === T.WATER) { near = true; break; }
            }
          if (near) tiles[y * MW + x] = T.SAND;
        }
      }
    }

    // dirt road between the two keeps
    const steps = 260;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const cx = U.lerp(startP1.x, startP2.x, p) + Math.sin(p * Math.PI * 3 + 1) * 6;
      const cy = U.lerp(startP1.y, startP2.y, p) + Math.cos(p * Math.PI * 2.5) * 5;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const tx = Math.round(cx) + dx, ty = Math.round(cy) + dy;
          if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
          const cur = tiles[ty * MW + tx];
          if (cur !== T.WATER) tiles[ty * MW + tx] = T.PATH;
        }
    }

    // clear base areas
    const clearArea = (cx, cy, r, tt) => {
      for (let y = -r; y <= r; y++)
        for (let x = -r; x <= r; x++) {
          const tx = cx + x, ty = cy + y;
          if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
          if (Math.hypot(x, y) <= r) tiles[ty * MW + tx] = tt;
        }
    };
    clearArea(startP1.x, startP1.y, 7, T.GRASS);
    clearArea(startP2.x, startP2.y, 7, T.GRASS);
    // clear road of water hazards near bases
    clearArea(Math.round((startP1.x + startP2.x) / 2), Math.round((startP1.y + startP2.y) / 2), 4, T.PATH);

    // -- props --
    const trees = [];
    const rocks = [];
    const golds = [];
    const occupied = new Set();

    const tryAdd = (list, tx, ty, data) => {
      const k = ty * MW + tx;
      if (occupied.has(k)) return false;
      occupied.add(k);
      list.push(data);
      return true;
    };

    // trees: forest floor + dense noise patches, plus a few lone trees on grass
    for (let y = 1; y < MH - 1; y++) {
      for (let x = 1; x < MW - 1; x++) {
        const k = y * MW + x;
        if (tiles[k] === T.WATER || tiles[k] === T.SAND || tiles[k] === T.PATH) continue;
        const d = baseDist(x, y);
        if (d < 8) continue;
        const cluster = U.fbm(x * 0.22 + 3, y * 0.22 - 5, seed + 43, 2);
        let want = 0;
        if (tiles[k] === T.FOREST_FLOOR) want = 0.62;
        else if (cluster > 0.63 && d > 13) want = 0.55;
        else if (tiles[k] === T.GRASS && cluster > 0.48 && d > 18 && rnd() < 0.10) want = 1;
        if (rnd() < want) {
          tryAdd(trees, x, y, {
            x: x * RTS.TILE + 8 + (rnd() - 0.5) * 6,
            y: y * RTS.TILE + 10 + (rnd() - 0.5) * 5,
            seed: (rnd() * 999) | 0,
            s: 0.85 + rnd() * 0.45,
            amount: 90 + ((rnd() * 40) | 0),
            maxAmount: 130,
            kind: 'tree',
            tx: x,
            ty: y,
          });
        }
      }
    }

    // rocks
    for (let i = 0; i < 300; i++) {
      const x = 1 + ((rnd() * (MW - 2)) | 0);
      const y = 1 + ((rnd() * (MH - 2)) | 0);
      const k = y * MW + x;
      if (tiles[k] === T.WATER || tiles[k] === T.SAND) continue;
      if (baseDist(x, y) < 8) continue;
      if (occupied.has(k)) continue;
      if (rnd() < 0.55) continue;
      tryAdd(rocks, x, y, {
        x: x * RTS.TILE + 8, y: y * RTS.TILE + 11,
        seed: (rnd() * 999) | 0, s: 0.8 + rnd() * 0.5, kind: 'rock', tx: x, ty: y,
      });
    }

    // gold veins: mirrored near each base + contested center
    const addGoldCluster = (cx, cy, count) => {
      for (let i = 0; i < count; i++) {
        const tx = cx + ((rnd() * 3) | 0) - 1;
        const ty = cy + ((rnd() * 3) | 0) - 1;
        if (tx < 1 || ty < 1 || tx >= MW - 1 || ty >= MH - 1) continue;
        const k = ty * MW + tx;
        if (tiles[k] === T.WATER) continue;
        if (occupied.has(k)) continue;
        tryAdd(golds, tx, ty, {
          x: tx * RTS.TILE + 8, y: ty * RTS.TILE + 12,
          seed: (rnd() * 999) | 0, s: 0.9 + rnd() * 0.3,
          amount: 420, maxAmount: 420, kind: 'gold', tx, ty,
        });
      }
    };
    addGoldCluster(startP1.x + 4, startP1.y - 3, 4);
    addGoldCluster(startP2.x - 4, startP2.y + 3, 4);
    addGoldCluster(Math.round(MW / 2) + 10, Math.round(MH / 2) + 8, 5);
    addGoldCluster(Math.round(MW / 2) - 14, Math.round(MH / 2) - 10, 5);

    // ensure start areas have accessible wood: guarantee trees near bases
    const addTreeAt = (tx, ty) => {
      const k = ty * MW + tx;
      if (tx < 1 || ty < 1 || tx >= MW - 1 || ty >= MH - 1) return;
      if (tiles[k] === T.WATER) return;
      if (occupied.has(k)) return;
      tryAdd(trees, tx, ty, {
        x: tx * RTS.TILE + 8, y: ty * RTS.TILE + 10,
        seed: (rnd() * 999) | 0, s: 0.9 + rnd() * 0.3,
        amount: 110, maxAmount: 130, kind: 'tree', tx, ty,
      });
    };
    for (const base of [startP1, startP2]) {
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2;
        const r = 9 + (i % 4);
        addTreeAt(Math.round(base.x + Math.cos(a) * r), Math.round(base.y + Math.sin(a) * r));
      }
    }

    return {
      seed,
      tiles,
      trees,
      rocks,
      golds,
      startP1: { x: startP1.x * RTS.TILE + 8, y: startP1.y * RTS.TILE + 8 },
      startP2: { x: startP2.x * RTS.TILE + 8, y: startP2.y * RTS.TILE + 8 },
    };
  };

  /* ground layer is expensive to draw every frame -> bake per-chunk */
  RTS.drawGroundTile = function (ctx, tiles, MW, tx, ty, t, palette) {
    const x = tx * RTS.TILE, y = ty * RTS.TILE;
    const k = ty * MW + tx;
    const tt = tiles[k];
    const h1 = RTS.util.hash2(tx, ty, 7);
    const h2 = RTS.util.hash2(tx, ty, 13);
    let base = '#4c8c3f', base2 = '#469038', det = '#579c45';
    switch (tt) {
      case T.DIRT: base = '#7a6140'; base2 = '#6e5638'; det = '#87694a'; break;
      case T.WATER: base = '#2f6ea8'; base2 = '#2a6499'; det = '#4a8cc4'; break;
      case T.SAND: base = '#c9b083'; base2 = '#bfa678'; det = '#d8c096'; break;
      case T.FOREST_FLOOR: base = '#3f7a34'; base2 = '#3a7131'; det = '#4c8c3f'; break;
      case T.ROCK: base = '#6b7280'; base2 = '#61687a'; det = '#7a8190'; break;
      case T.PATH: base = '#8b7350'; base2 = '#826a48'; det = '#98805c'; break;
      default: break;
    }
    ctx.fillStyle = h1 > 0.5 ? base : base2;
    ctx.fillRect(x, y, RTS.TILE, RTS.TILE);

    if (tt === T.WATER) {
      // animated ripples
      const wp = (t * 0.6 + h2 * 4) % 4;
      if (wp < 2) {
        ctx.fillStyle = 'rgba(150,205,240,0.35)';
        ctx.fillRect(x + 3 + ((h1 * 6) | 0), y + 5 + ((h2 * 6) | 0), 4, 1);
        ctx.fillRect(x + 9, y + 11, 3, 1);
      }
      const edge = RTS.util.hash2(tx, ty, 3);
      if (edge > 0.8) {
        ctx.fillStyle = 'rgba(30,70,110,0.35)';
        ctx.fillRect(x, y, RTS.TILE, 2);
      }
      return;
    }
    // speckles
    const sp = (h1 * 7 + h2 * 11) % 3;
    ctx.fillStyle = det;
    if (sp < 1) ctx.fillRect(x + 2 + ((h2 * 8) | 0), y + 3 + ((h1 * 9) | 0), 2, 1);
    else if (sp < 2) ctx.fillRect(x + 11, y + 12, 1, 2);
    else {
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(x + 1, y + 1, 2, 1);
    }
    if (tt === T.GRASS) {
      const g = (h1 * 5 + h2 * 13) % 6;
      if (g < 1) {
        ctx.fillStyle = '#6fb057';
        ctx.fillRect(x + 5, y + 8, 1, 3);
        ctx.fillRect(x + 8, y + 7, 1, 3);
        ctx.fillRect(x + 11, y + 9, 1, 2);
      }
    }
    if (tt === T.PATH) {
      ctx.fillStyle = 'rgba(90,72,48,0.5)';
      if (h2 < 0.4) ctx.fillRect(x + 4, y + 10, 3, 2);
      if (h1 < 0.3) ctx.fillRect(x + 10, y + 4, 2, 2);
    }
  };
})();
