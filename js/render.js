/* GARLIC WARS - renderer */
(function () {
  'use strict';
  const RTS = window.RTS;
  const U = RTS.util;
  const TILE = RTS.TILE;

  RTS.Renderer = function (app) {
    this.app = app;
    this.canvas = app.canvas;
    this.ctx = app.canvas.getContext('2d', { alpha: false });
    this.dpr = 1;
    this.groundCanvas = null;
    this.groundScale = 3; // px per tile in the baked layer
    this.fps = 0;
    this._fpsAcc = 0;
    this._fpsN = 0;
    this.showFps = false;
  };

  const R = RTS.Renderer.prototype;

  /* bake the terrain once per game (3px per tile, upscaled with nearest neighbour) */
  R.bakeGround = function (g) {
    const scale = this.groundScale;
    const w = g.MW * scale, h = g.MH * scale;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    const has = (tx, ty) => tx >= 0 && ty >= 0 && tx < g.MW && ty < g.MH;
    for (let ty = 0; ty < g.MH; ty++) {
      for (let tx = 0; tx < g.MW; tx++) {
        const tt = g.map.tiles[ty * g.MW + tx];
        const pr = U.hash2(tx, ty, 21);
        const pr2 = U.hash2(tx, ty, 57);
        const pal = GROUND_PAL[tt] || GROUND_PAL[0];
        const x0 = tx * scale, y0 = ty * scale;
        // base with two-tone noise
        cx.fillStyle = palettePick(pal.base, pr);
        cx.fillRect(x0, y0, scale, scale);
        // per-pixel texture
        if (pr < 0.34) {
          cx.fillStyle = pal.dark;
          cx.fillRect(x0 + (pr2 < 0.5 ? 0 : 2), y0 + (pr2 < 0.5 ? 2 : 0), 1, 1);
        } else if (pr > 0.72) {
          cx.fillStyle = pal.light;
          cx.fillRect(x0 + (pr2 < 0.5 ? 1 : 2), y0 + 1, 1, 1);
        }
        // dither biome borders with a neighbour's colour
        const n = has(tx + 1, ty) ? g.map.tiles[ty * g.MW + tx + 1] : tt;
        const d = has(tx, ty + 1) ? g.map.tiles[(ty + 1) * g.MW + tx] : tt;
        if (n !== tt && pr > 0.45 && tt !== 2) {
          const np = GROUND_PAL[n] || GROUND_PAL[0];
          cx.fillStyle = np.base;
          cx.fillRect(x0 + 2, y0 + (pr2 < 0.5 ? 0 : 2), 1, 1);
        }
        if (d !== tt && pr2 > 0.5 && tt !== 2) {
          const dp = GROUND_PAL[d] || GROUND_PAL[0];
          cx.fillStyle = dp.base;
          cx.fillRect(x0 + (pr < 0.5 ? 0 : 1), y0 + 2, 1, 1);
        }
        // biome details
        if (tt === 0 || tt === 4) {
          const patch = U.fbm(tx * 0.14, ty * 0.14, 909, 2);
          if (patch > 0.58) {
            cx.fillStyle = tt === 4 ? '#3c7733' : '#458437';
            cx.fillRect(x0 + (pr2 < 0.5 ? 0 : 2), y0 + (pr < 0.5 ? 0 : 2), 1, 1);
          } else if (patch < 0.38) {
            cx.fillStyle = tt === 4 ? '#4d8c3e' : '#57994a';
            cx.fillRect(x0 + 1, y0 + (pr2 < 0.5 ? 0 : 2), 1, 1);
          }
          if (pr > 0.94) {
            cx.fillStyle = tt === 4 ? '#5f9a44' : '#6fb057';
            cx.fillRect(x0 + 1, y0 + 1, 1, 2);
            cx.fillRect(x0 + 2, y0 + 1, 1, 1);
          } else if (pr < 0.018) {
            cx.fillStyle = pr2 > 0.6 ? '#f2e06a' : pr2 > 0.3 ? '#e8f0a0' : '#dcd6ff';
            cx.fillRect(x0 + 1, y0 + 1, 1, 1);
          }
        }
        if (tt === 3 && pr > 0.88) {
          cx.fillStyle = '#e0cfa8';
          cx.fillRect(x0 + 1, y0 + 1, 2, 1);
        }
        if (tt === 6) {
          if (pr > 0.8) { cx.fillStyle = '#7a6446'; cx.fillRect(x0 + 1, y0 + 1, 2, 1); }
          else if (pr < 0.2) { cx.fillStyle = '#a08a64'; cx.fillRect(x0 + 1, y0 + 1, 1, 1); }
        }
        if (tt === 5 && pr > 0.75) {
          cx.fillStyle = '#8a91a0';
          cx.fillRect(x0 + 1, y0 + 1, 2, 1);
        }
        // shoreline foam for water next to land
        if (tt === 2) {
          let land = false;
          if (has(tx - 1, ty) && g.map.tiles[ty * g.MW + tx - 1] !== 2) land = 'w';
          else if (has(tx + 1, ty) && g.map.tiles[ty * g.MW + tx + 1] !== 2) land = 'e';
          else if (has(tx, ty - 1) && g.map.tiles[(ty - 1) * g.MW + tx] !== 2) land = 'n';
          else if (has(tx, ty + 1) && g.map.tiles[(ty + 1) * g.MW + tx] !== 2) land = 's';
          if (land) {
            cx.fillStyle = '#a8d8f0';
            if (land === 'w') cx.fillRect(x0, y0, 1, scale);
            if (land === 'e') cx.fillRect(x0 + scale - 1, y0, 1, scale);
            if (land === 'n') cx.fillRect(x0, y0, scale, 1);
            if (land === 's') cx.fillRect(x0, y0 + scale - 1, scale, 1);
          }
          if (pr > 0.6) {
            cx.fillStyle = '#5aa6cf';
            cx.fillRect(x0 + 1, y0 + 1, 1, 1);
          }
          if (pr2 > 0.9) {
            cx.fillStyle = 'rgba(190,232,248,0.55)';
            cx.fillRect(x0 + 2, y0 + (pr < 0.5 ? 1 : 2), 1, 1);
          }
        }
        // forest floor shadow
        if (tt === 4 && pr > 0.5) {
          cx.fillStyle = '#356a2c';
          cx.fillRect(x0 + 1, y0 + 1, 1, 1);
        }
      }
    }
    this.groundCanvas = c;
  };

  function palettePick(pair, r) {
    return r > 0.5 ? pair[0] : pair[1];
  }

  const GROUND_PAL = {
    0: { base: ['#4f9142', '#488a3c'], light: '#6cae56', dark: '#3d7a33' },
    1: { base: ['#7d6442', '#735b3b'], light: '#8f7550', dark: '#5f4a2f' },
    // water leans blue-green so it does not read as a flat navy slab next to
    // the warm grass, and keeps more mid-tone detail than the old navy
    2: { base: ['#326f96', '#2d6689'], light: '#4b93bb', dark: '#255a7c' },
    3: { base: ['#cbb387', '#c2a97c'], light: '#dcc59a', dark: '#ab8f62' },
    4: { base: ['#407e35', '#3b7531'], light: '#548f3f', dark: '#2f6127' },
    5: { base: ['#6b7280', '#5f6675'], light: '#828a99', dark: '#4a5162' },
    6: { base: ['#8d7652', '#846e4a'], light: '#a3895f', dark: '#6e5a3a' },
  };

  R.resize = function () {
    const raw = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    // render fewer device pixels than CSS pixels on big screens for crunchy pixel art
    const budget = w * h;
    let scale = 1;
    if (budget > 1400000) scale = 0.6;
    else if (budget > 900000) scale = 0.72;
    else if (budget > 620000) scale = 0.85;
    const dpr = Math.max(0.5, raw * scale);
    this.dpr = dpr;
    this.canvas.width = Math.max(320, Math.floor(w * dpr));
    this.canvas.height = Math.max(240, Math.floor(h * dpr));
    this.dprEff = this.canvas.width / w;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.imageSmoothingEnabled = false;
    this.vw = w;
    this.vh = h;
    this.app.onResize && this.app.onResize();
  };

  R.frame = function (dt) {
    const app = this.app;
    const g = app.game;
    const ctx = this.ctx;
    const dpr = (this.dprEff = this.canvas.width / this.vw || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    this._fpsAcc += dt;
    this._fpsN++;
    if (this._fpsAcc > 0.5) {
      this.fps = Math.round(this._fpsN / this._fpsAcc);
      this._fpsAcc = 0;
      this._fpsN = 0;
    }

    if (!g) {
      ctx.fillStyle = '#0d0b12';
      ctx.fillRect(0, 0, this.vw, this.vh);
      return;
    }
    if (!this.groundCanvas) this.bakeGround(g);

    const cam = app.cam;
    const z = cam.zoom;
    ctx.fillStyle = '#1b2418';
    ctx.fillRect(0, 0, this.vw, this.vh);

    ctx.save();
    ctx.translate(Math.round(this.vw / 2), Math.round(this.vh / 2));
    ctx.scale(z, z);
    ctx.translate(-cam.x, -cam.y);

    const view = app.viewWorld();
    this.drawGround(ctx, g, view, cam, z);
    this.drawSelectionRings(ctx, g, app, view);
    this.drawResources(ctx, g, view);
    this.drawCorpses(ctx, g, view);
    this.drawBuildings(ctx, g, view, app);
    if (app.mode === 'place') this.drawPlacementGhost(ctx, g, app);
    this.drawUnits(ctx, g, view, app);
    this.drawProjectiles(ctx, g);
    this.drawEffects(ctx, g);
    this.drawFog(ctx, g, view, cam, z);
    if (app.mode === 'ability' && app.cursorWorld) this.drawAbilityPreview(ctx, app);
    this.drawDragBox(ctx, app);
    ctx.restore();

    this.drawScreenSpace(ctx, app, g);
  };

  /* ---------- ground ---------- */
  R.drawGround = function (ctx, g, view, cam, z) {
    const scale = this.groundScale;
    const src = this.groundCanvas;
    // nearest-neighbour upscale of the baked terrain
    const sx = view.x / TILE * scale;
    const sy = view.y / TILE * scale;
    const w = (view.w / TILE) * scale;
    const h = (view.h / TILE) * scale;
    ctx.imageSmoothingEnabled = false;
    // snap destination to device pixels so the terrain stays crisp
    const invZ = 1 / z;
    const px = Math.round(view.x * z) / z, py = Math.round(view.y * z) / z;
    const pw = Math.round(view.w * z) / z + invZ, ph = Math.round(view.h * z) / z + invZ;
    ctx.drawImage(src, sx, sy, w, h, px, py, pw, ph);

    // subtle animated details: water sparkle
    const t = performance.now() / 1000;
    const x0 = Math.max(0, Math.floor(view.x / TILE)), x1 = Math.min(g.MW - 1, Math.ceil((view.x + view.w) / TILE));
    const y0 = Math.max(0, Math.floor(view.y / TILE)), y1 = Math.min(g.MH - 1, Math.ceil((view.y + view.h) / TILE));
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (g.map.tiles[ty * g.MW + tx] !== 2) continue;
        const ph = U.hash2(tx, ty, 5);
        if ((t * 0.8 + ph * 6) % 4 < 1.2) {
          ctx.fillStyle = 'rgba(160,215,245,0.28)';
          ctx.fillRect(tx * TILE + 3 + ph * 6, ty * TILE + 4 + ph * 7, 5, 1.5);
        }
      }
    }
    // grass sway accents
    ctx.fillStyle = 'rgba(120,180,90,0.35)';
    for (let ty = y0; ty <= y1; ty += 2) {
      for (let tx = x0; tx <= x1; tx += 2) {
        if (g.map.tiles[ty * g.MW + tx] !== 0) continue;
        if (U.hash2(tx, ty, 33) > 0.72) {
          const off = Math.sin(t * 1.6 + tx * 0.7 + ty) * 1.1;
          ctx.fillRect(tx * TILE + 6 + off, ty * TILE + 9, 1, 3);
        }
      }
    }
  };

  /* ---------- resources ---------- */
  R.drawResources = function (ctx, g, view) {
    const t = performance.now() / 1000;
    for (const r of g.resources) {
      if (r.dead) continue;
      if (r.x < view.x - 40 || r.x > view.x + view.w + 40 || r.y < view.y - 60 || r.y > view.y + view.h + 40) continue;
      if (!g.visibleTile(r.tx, r.ty)) continue;
      if (r.kind === 'tree') RTS.drawTree(ctx, r.x, r.y, r.seed, r.s * (0.8 + 0.2 * (r.amount / r.maxAmount)));
      else RTS.drawGold(ctx, r.x, r.y, r.seed, t);
      if (r.amount < r.maxAmount * 0.6) {
        // stumps / depleted look
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(r.x - 5, r.y - 3, 10, 2);
      }
    }
    for (const r of g.rocks) {
      if (!g.visibleTile(r.tx, r.ty)) continue;
      if (r.x < view.x - 40 || r.x > view.x + view.w + 40 || r.y < view.y - 60 || r.y > view.y + view.h + 40) continue;
      RTS.drawRock(ctx, r.x, r.y, r.seed, r.s);
    }
  };

  R.drawCorpses = function (ctx, g, view) {
    for (const c of g.corpses) {
      if (c.x < view.x - 20 || c.x > view.x + view.w + 20) continue;
      RTS.drawCorpse(ctx, c.x, c.y, 0, c.t);
    }
  };

  /* ---------- buildings ---------- */
  R.drawBuildings = function (ctx, g, view, app) {
    const t = performance.now() / 1000;
    const list = g.buildings.slice().sort((a, b) => a.y - b.y);
    for (const b of list) {
      if (b.dead) continue;
      if (b.x < view.x - 80 || b.x > view.x + view.w + 80 || b.y < view.y - 120 || b.y > view.y + view.h + 80) continue;
      if (!g.explored(b) && b.owner !== 0) continue;
      const fac = g.factions[b.owner];
      // shadow
      ctx.fillStyle = 'rgba(10,8,16,0.25)';
      ctx.beginPath();
      ctx.ellipse(b.x, b.y + 2, b.w / 2 + 4, b.h / 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      if (b.progress < 1) {
        ctx.globalAlpha = 0.35 + 0.6 * b.progress;
      }
      RTS.drawBuildingSprite(ctx, b.type, fac, b.x, b.y + 2, b.w, b.h, b.progress, t);
      ctx.restore();

      // build progress
      if (b.progress < 1) {
        const w = b.w + 8;
        ctx.fillStyle = 'rgba(8,6,14,0.75)';
        ctx.fillRect(b.x - w / 2, b.y - b.h - 16, w, 4);
        ctx.fillStyle = '#6fb8ff';
        ctx.fillRect(b.x - w / 2 + 1, b.y - b.h - 15, (w - 2) * b.progress, 2);
        // scaffolding
        ctx.fillStyle = 'rgba(140,100,60,0.5)';
        ctx.fillRect(b.x - b.w / 2 - 3, b.y - b.h + 4, 2, b.h - 4);
        ctx.fillRect(b.x + b.w / 2 + 1, b.y - b.h + 4, 2, b.h - 4);
      }
      // damage flash
      if (b.flash > 0) {
        ctx.globalAlpha = b.flash * 4;
        ctx.fillStyle = '#ff5a5a';
        ctx.fillRect(b.x - b.w / 2, b.y - b.h, b.w, b.h);
        ctx.globalAlpha = 1;
      }
      // hp bar when damaged
      if (b.hp < b.maxHp && b.progress >= 1) {
        this.hpBar(ctx, b.x, b.y - b.h - 9, Math.max(20, b.w * 0.8), b.hp / b.maxHp, 3, b.owner);
      }
      // rally + training tick
      if (b.queue && b.queue.length && b.progress >= 1) {
        const q = b.queue[0];
        const frac = q.time / q.total;
        ctx.fillStyle = 'rgba(8,6,14,0.7)';
        ctx.fillRect(b.x - 11, b.y - b.h - 14, 22, 4);
        ctx.fillStyle = '#f5c542';
        ctx.fillRect(b.x - 10, b.y - b.h - 13, 20 * frac, 2);
      }
      if (b.owner === 0 && b.rally) {
        const p = (t * 1.5) % 1;
        ctx.fillStyle = 'rgba(245,197,66,' + (0.7 - p * 0.5).toFixed(2) + ')';
        ctx.fillRect(b.rally.x - 2, b.rally.y - 2, 4, 4);
      }
      if (b.owner === 0 && g.selectedBuildings().indexOf(b) >= 0) {
        this.selectionRing(ctx, b.x, b.y + b.h / 2 - 2, b.w * 0.72, t);
      }
    }
  };

  R.selectionRing = function (ctx, x, y, r, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(140,240,120,0.95)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(140,240,120,' + (0.35 + Math.sin(t * 4) * 0.15).toFixed(2) + ')';
    ctx.beginPath();
    ctx.ellipse(x, y, r + 2, r * 0.38 + 1, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  R.hpBar = function (ctx, x, y, w, frac, h, owner) {
    ctx.fillStyle = 'rgba(8,6,14,0.8)';
    ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    const col = owner === 0 ? (frac > 0.5 ? '#7fdc6a' : frac > 0.25 ? '#ffc45c' : '#ff5a5a') : '#ff5a5a';
    ctx.fillStyle = col;
    ctx.fillRect(x - w / 2, y, w * Math.max(0, frac), h);
  };

  /* ---------- units ---------- */
  R.drawUnits = function (ctx, g, view, app) {
    const t = performance.now() / 1000;
    const list = g.units.slice().sort((a, b) => a.y - b.y);
    for (const u of list) {
      if (u.dead) continue;
      if (u.x < view.x - 40 || u.x > view.x + view.w + 40 || u.y < view.y - 70 || u.y > view.y + view.h + 40) continue;
      if (u.owner !== 0 && !g.visible(u)) continue;
      const fac = g.factions[u.owner];
      const bob = u.moving ? Math.sin(u.walk * 11) * 0.7 : Math.sin(t * 2 + u.id) * 0.25;
      RTS.drawUnitSprite(ctx, u.type, fac, u.x, u.y + bob, {
        moving: u.moving,
        walk: u.walk,
        attacking: u.attacking,
        t: t + u.id,
        carry: u.carry > 0,
        scale: 1,
      });
      // status
      if (u.buff.poison > 0) {
        ctx.fillStyle = 'rgba(150,230,90,0.8)';
        ctx.fillRect(u.x - 2, u.y - 26, 4, 2);
      }
      if (u.buff.dmg > 0) {
        ctx.fillStyle = 'rgba(255,220,90,0.85)';
        ctx.fillRect(u.x - 6, u.y - 30, 3, 2);
        ctx.fillRect(u.x + 3, u.y - 30, 3, 2);
      }
      if (u.hp < u.maxHp) this.hpBar(ctx, u.x, u.y - (u.type === 'knight' ? 36 : u.type === 'siege' ? 32 : 30), u.type === 'knight' || u.type === 'siege' ? 22 : 16, u.hp / u.maxHp, 2.5, u.owner);
      if (u.owner === 0 && g.selectedUnits().indexOf(u) >= 0) {
        this.selectionRing(ctx, u.x, u.y + 1, u.radius + 6, t);
      }
      // enemy under attack indicator
      if (u.buff.poison <= 0 && u.flash > 0) {
        ctx.globalAlpha = Math.min(1, u.flash * 6);
        ctx.fillStyle = '#ff8080';
        ctx.fillRect(u.x - u.radius, u.y - 4, u.radius * 2, 6);
        ctx.globalAlpha = 1;
      }
    }
  };

  R.drawProjectiles = function (ctx, g) {
    for (const p of g.projectiles) {
      if (p.done) continue;
      RTS.drawProjectile(ctx, p.x, p.y, p.kind, p.ang);
    }
  };

  /* ---------- effects ---------- */
  R.drawEffects = function (ctx, g) {
    for (const e of g.effects) {
      const k = e.t / e.life;
      switch (e.type) {
        case 'hit': {
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = '#ffe9a8';
          const s = 2 + k * 4;
          ctx.fillRect(e.x - s / 2, e.y - s / 2, s, s);
          ctx.globalAlpha = 1;
          break;
        }
        case 'blood': {
          ctx.globalAlpha = (1 - k) * 0.8;
          ctx.fillStyle = '#a83a3a';
          for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + e.x;
            ctx.fillRect(e.x + Math.cos(a) * k * 14, e.y + Math.sin(a) * k * 8 - k * 6, 2, 2);
          }
          ctx.globalAlpha = 1;
          break;
        }
        case 'wood': {
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = '#d9a34e';
          ctx.fillRect(e.x + (k * 6), e.y - k * 12, 3, 3);
          ctx.fillStyle = '#a8752f';
          ctx.fillRect(e.x - (k * 5), e.y - k * 9, 2, 2);
          ctx.globalAlpha = 1;
          break;
        }
        case 'spark': {
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = '#9fe8ff';
          ctx.fillRect(e.x - 1, e.y - k * 10, 2, 2);
          ctx.fillStyle = '#e8c15a';
          ctx.fillRect(e.x + 2, e.y - k * 7, 2, 2);
          ctx.globalAlpha = 1;
          break;
        }
        case 'float': {
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = e.color || '#ffe9a8';
          ctx.font = 'bold 9px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(e.text, e.x, e.y - k * 16);
          ctx.globalAlpha = 1;
          break;
        }
        case 'poof': {
          ctx.globalAlpha = (1 - k) * 0.8;
          ctx.fillStyle = '#d8d0c0';
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const s = 2 + k * 5;
            ctx.fillRect(e.x + Math.cos(a) * k * 12, e.y + Math.sin(a) * k * 8 - k * 4, s, s);
          }
          ctx.globalAlpha = 1;
          break;
        }
        case 'boom': {
          const s = (e.s || 30) * (0.4 + k * 1.2);
          ctx.globalAlpha = (1 - k);
          ctx.fillStyle = '#ff9a3c';
          ctx.beginPath();
          ctx.arc(e.x, e.y, s * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffe9a8';
          ctx.beginPath();
          ctx.arc(e.x, e.y, s * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }
        case 'ring': {
          ctx.strokeStyle = 'rgba(245,197,66,' + (1 - k).toFixed(2) + ')';
          ctx.lineWidth = 3 * (1 - k) + 1;
          ctx.beginPath();
          ctx.ellipse(e.x, e.y, e.r * k, e.r * k * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'buff': {
          ctx.fillStyle = e.color || '#ffe066';
          ctx.globalAlpha = 1 - k;
          for (let i = 0; i < 3; i++) {
            const yy = e.y - k * 18 - i * 5;
            ctx.fillRect(e.x - 3 + i, yy, 2, 2);
            ctx.fillRect(e.x + 2 - i, yy - 3, 2, 2);
          }
          ctx.globalAlpha = 1;
          break;
        }
        case 'meteor': {
          // incoming rock + impact shockwave
          if (k < 0.72) {
            const p = k / 0.72;
            RTS.drawMeteor(ctx, e.x, e.y, 0, p);
            ctx.strokeStyle = 'rgba(255,180,80,0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, e.r * (0.4 + p * 0.6), e.r * 0.55 * (0.4 + p * 0.6), 0, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            const p = (k - 0.72) / 0.28;
            ctx.globalAlpha = 1 - p;
            ctx.fillStyle = '#ffb04a';
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r * (0.4 + p * 0.9), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff0b0';
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r * (0.2 + p * 0.3), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          break;
        }
        case 'spore': {
          ctx.globalAlpha = (1 - k) * 0.55;
          ctx.fillStyle = '#9be36a';
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const r = e.r * (0.3 + k * 0.8);
            ctx.beginPath();
            ctx.arc(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r * 0.6, 3 + k * 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }
        case 'warn': {
          const pulse = 1 - k;
          ctx.strokeStyle = 'rgba(255,110,90,' + (0.35 + pulse * 0.5).toFixed(2) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y - 30, 16 + Math.sin(e.t * 8) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,110,90,' + (0.5 + pulse * 0.4).toFixed(2) + ')';
          ctx.font = 'bold 10px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', e.x, e.y - 26);
          break;
        }
        case 'ping': {
          ctx.strokeStyle = e.color || '#fff';
          ctx.globalAlpha = 1 - k;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(e.x, e.y, 6 + k * 22, (6 + k * 22) * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          break;
        }
        default: break;
      }
    }
  };

  /* ---------- fog of war ----------
     Painting one fillRect per fogged tile is by far the most expensive thing in
     the frame (~1ms at 800x375, much worse on a phone at DPR 2), so the fog is
     baked into a small per-game mask canvas at 4px per tile and blitted in a
     single nearest-neighbour drawImage. The mask is rebuilt only when the fog
     actually changes.                                                        */
  const FOG_CELL = 4;

  R.bakeFog = function (g) {
    const w = g.MW * FOG_CELL, h = g.MH * FOG_CELL;
    let c = this.fogCanvas;
    if (!c) {
      c = document.createElement('canvas');
      this.fogCanvas = c;
    }
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const cx = c.getContext('2d');
    if (!cx) return;
    cx.clearRect(0, 0, w, h);
    // remembered (explored but not visible): cool dim wash
    cx.fillStyle = 'rgba(14,20,34,0.42)';
    for (let ty = 0; ty < g.MH; ty++) {
      for (let tx = 0; tx < g.MW; tx++) {
        if (g.fog[ty * g.MW + tx] === 1) cx.fillRect(tx * FOG_CELL, ty * FOG_CELL, FOG_CELL, FOG_CELL);
      }
    }
    // unexplored: near-black, drawn as horizontal runs to cut fill calls
    cx.fillStyle = 'rgba(5,6,12,0.96)';
    for (let ty = 0; ty < g.MH; ty++) {
      let run = -1;
      for (let tx = 0; tx <= g.MW; tx++) {
        const dark = tx < g.MW && g.fog[ty * g.MW + tx] === 0;
        if (dark && run < 0) run = tx;
        else if (!dark && run >= 0) {
          cx.fillRect(run * FOG_CELL, ty * FOG_CELL, (tx - run) * FOG_CELL, FOG_CELL);
          run = -1;
        }
      }
    }
    /* Sparse dust in the void so it isn't a flat slab. Hashed rather than
       modular: a modulo pattern lays the specks out on visible diagonal rows
       and reads as dither noise once the camera zooms out. */
    for (let ty = 0; ty < g.MH; ty++) {
      for (let tx = 0; tx < g.MW; tx++) {
        if (g.fog[ty * g.MW + tx] !== 0) continue;
        const h = U.hash2(tx, ty, 91);
        if (h < 0.93) continue;
        const onX = Math.round(tx * FOG_CELL + 1 + U.hash2(tx, ty, 17) * 2);
        const onY = Math.round(ty * FOG_CELL + 1 + U.hash2(tx, ty, 29) * 2);
        cx.fillStyle = h > 0.975 ? 'rgba(132,160,208,0.20)' : 'rgba(96,116,158,0.11)';
        cx.fillRect(onX, onY, 1, 1);
      }
    }
    this.fogKey = this.fogSignature(g);
  };

  R.fogSignature = function (g) {
    // cheap rolling checksum; fog changes in blobs so this is stable
    let h = 2166136261;
    const f = g.fog;
    for (let i = 0; i < f.length; i += 7) {
      h ^= f[i];
      h = Math.imul(h, 16777619);
    }
    return h;
  };

  R.drawFog = function (ctx, g, view, cam, z) {
    if (!this.fogKey || this.fogKey !== this.fogSignature(g)) this.bakeFog(g);
    const src = this.fogCanvas;
    if (!src) return;
    const s = FOG_CELL / TILE;              // mask px per world px
    const sx = Math.max(0, view.x * s);
    const sy = Math.max(0, view.y * s);
    const sw = Math.min(src.width - sx, view.w * s);
    const sh = Math.min(src.height - sy, view.h * s);
    if (sw <= 0 || sh <= 0) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, sx, sy, sw, sh, sx / s, sy / s, sw / s, sh / s);
  };

  /* ---------- selection ring helpers ---------- */
  R.drawSelectionRings = function (ctx, g, app) {
    // handled per entity
  };

  R.drawDragBox = function (ctx, app) {
    const d = app.input && app.input.drag;
    if (!d) return;
    if (Math.abs(d.x1 - d.x0) < 6 && Math.abs(d.y1 - d.y0) < 6) return;
    const a = app.screenToWorld(d.x0, d.y0);
    const b = app.screenToWorld(d.x1, d.y1);
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    const w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    ctx.fillStyle = 'rgba(140,240,120,0.12)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(160,255,140,0.85)';
    ctx.lineWidth = 1 / app.cam.zoom;
    ctx.strokeRect(x, y, w, h);
  };

  R.drawPlacementGhost = function (ctx, g, app) {
    const type = app.placeType;
    if (!type) return;
    const w = app.cursorWorld;
    if (!w) return;
    const def = RTS.BUILDINGS[type];
    const chk = g.canPlace(type, w.x, w.y, 0);
    const cx = Math.floor(w.x / TILE) * TILE + TILE / 2;
    const cy = Math.floor(w.y / TILE) * TILE + TILE / 2;
    ctx.globalAlpha = 0.62;
    RTS.drawBuildingSprite(ctx, type, g.playerFaction, cx, cy + 2, def.w, def.h, 1, performance.now() / 1000);
    ctx.globalAlpha = 1;
    ctx.fillStyle = chk.ok ? 'rgba(120,255,120,0.18)' : 'rgba(255,90,90,0.24)';
    ctx.fillRect(cx - def.w / 2 - 2, cy - def.h / 2 - 2, def.w + 4, def.h + 4);
    ctx.strokeStyle = chk.ok ? '#8ff07a' : '#ff6b6b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - def.w / 2 - 2, cy - def.h / 2 - 2, def.w + 4, def.h + 4);
    if (!chk.ok) {
      const label = chk.reason || 'Blocked';
      ctx.font = 'bold 6px ui-monospace, monospace';
      const tw = ctx.measureText ? ctx.measureText(label).width : label.length * 4;
      ctx.fillStyle = 'rgba(10,6,12,0.82)';
      ctx.fillRect(cx - tw / 2 - 3, cy - def.h / 2 - 18, tw + 6, 11);
      ctx.fillStyle = '#ffb3b3';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy - def.h / 2 - 10);
    }
  };

  R.drawAbilityPreview = function (ctx, app) {
    const ab = RTS.ABILITIES[app.abilityKey];
    if (!ab) return;
    const w = app.cursorWorld;
    if (!w) return;
    const t = performance.now() / 1000;
    const col = app.abilityKey === 'spore' ? '150,230,110' : app.abilityKey === 'rally' || app.abilityKey === 'rally2' ? '255,224,102' : '255,150,80';
    ctx.fillStyle = 'rgba(' + col + ',0.14)';
    ctx.beginPath();
    ctx.ellipse(w.x, w.y, ab.radius, ab.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + col + ',0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w.x, w.y, ab.radius + Math.sin(t * 4) * 2, (ab.radius + Math.sin(t * 4) * 2) * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  /* ---------- screen space overlays (fps) ---------- */
  R.drawScreenSpace = function (ctx, app, g) {
    if (this.showFps) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(this.vw - 74, 60, 66, 20);
      ctx.fillStyle = '#9fe8ff';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(this.fps + ' fps', this.vw - 68, 74);
    }
  };
})();
