/* GARLIC WARS - procedural pixel art */
(function () {
  'use strict';
  const RTS = window.RTS;

  const C = {
    line: '#181022',
    line2: '#2c2038',
    skin: '#e8b78d',
    skin2: '#c48f66',
    steel: '#c3ccd6',
    steel2: '#8b97a6',
    steel3: '#5f6b7a',
    wood: '#8a5f39',
    wood2: '#63421f',
    wood3: '#402a14',
    straw: '#dcb957',
    straw2: '#a8873a',
    stone: '#939aa8',
    stone2: '#6c7383',
    stone3: '#4a5162',
    gold: '#f5c542',
    leaf: '#4f9d43',
    leaf2: '#3b7a34',
    leaf3: '#28562a',
    leaf4: '#68bd50',
    white: '#f3f0ea',
    red: '#c8323f',
    bone: '#e8e0cc',
    roof: '#b8563f',
    roof2: '#8c3a2b',
    black: '#10090f',
    aether: '#7fe0ff',
  };
  RTS.palette = C;

  let ctxRef = null;
  function P(color, x, y, w, h) {
    ctxRef.fillStyle = color;
    ctxRef.fillRect(x, y, w, h);
  }
  /* polygon helper */
  function poly(color, pts) {
    ctxRef.fillStyle = color;
    ctxRef.beginPath();
    ctxRef.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctxRef.lineTo(pts[i], pts[i + 1]);
    ctxRef.closePath();
    ctxRef.fill();
  }

  function tint(hex, amt) {
    // amt > 0 lighten, < 0 darken
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt > 0) {
      r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
    } else {
      r *= 1 + amt; g *= 1 + amt; b *= 1 + amt;
    }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }
  RTS.tint = tint;

  /* ================= UNITS ================= */
  /* 3-frame walk cycle: -1 = back stride, 0 = passing, 1 = forward stride */
  function stride(o) {
    if (!o.moving) return 0;
    const ph = Math.floor(o.walk * 6) % 3;
    return ph === 0 ? 1 : ph === 1 ? 0 : -1;
  }

  function legs(o, dark, light) {
    const ph = stride(o);
    const l1 = ph, l2 = -ph;
    // back leg first (darker) for depth
    P(dark, -4 + l1 * 2, -5, 3, 5);
    P(light, 1 + l2 * 2, -5, 3, 5);
    if (ph === 0) {
      // passing pose: lift the rear foot a pixel
      P(dark, -4, -6, 3, 2);
    }
  }

  function shadow(w, h) {
    ctxRef.fillStyle = 'rgba(10,8,18,0.30)';
    ctxRef.beginPath();
    ctxRef.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctxRef.fill();
    ctxRef.fillStyle = 'rgba(10,8,18,0.16)';
    ctxRef.beginPath();
    ctxRef.ellipse(-1, 0, w * 0.62, h * 0.7, 0, 0, Math.PI * 2);
    ctxRef.fill();
  }

  const UNIT_ART = {
    worker(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      shadow(8, 2.6);
      legs(o, C.wood2, C.wood);
      // --- body: tunic with lit left edge / shadowed right ---
      P(C.line, -5, -12, 11, 9);
      P(c2, -4, -11, 9, 7);
      P(c, -4, -11, 5, 7);          // lit half
      P(tint(c, 0.18), -4, -11, 2, 6); // rim light
      P(C.straw2, -4, -6, 9, 2);    // belt
      P(C.gold, 0, -6, 2, 2);       // buckle
      // --- head ---
      P(C.line, -4, -19, 9, 8);
      P(C.skin2, -3, -18, 7, 6);
      P(C.skin, -3, -18, 5, 5);
      P(tint(C.skin, 0.25), -3, -18, 2, 2);
      P(C.line2, -3, -17, 6, 1);    // brow shadow
      P(C.line2, 1, -16, 1, 2);     // eye
      P(C.skin2, 2, -13, 2, 1);     // nose/cheek
      // --- straw hat with brim shadow ---
      P(C.line, -7, -21, 15, 3);
      P(C.straw, -6, -21, 13, 2);
      P(C.straw2, -6, -19, 13, 1);
      P(tint(C.straw, 0.3), -5, -21, 5, 1);
      P(C.line2, -2, -24, 5, 3);    // crown
      P(C.straw2, -2, -24, 4, 2);
      // --- arms / tool ---
      const sw = o.attacking ? Math.sin(o.t * 14) * 2 : Math.round(Math.sin(o.walk * 6) * 1);
      P(C.skin2, -7, -10, 2, 5);
      P(C.skin, 5, -10 + sw, 2, 5);
      P(C.wood3, 6, -17 + sw, 2, 9);
      P(C.steel3, 4, -18 + sw, 7, 2);
      P(C.steel, 4, -18 + sw, 6, 1);
      if (o.carry) {
        P(C.line, -10, -16, 5, 5);
        P(C.wood, -9, -15, 4, 4);
        P(C.wood2, -9, -14, 4, 2);
        P(tint(C.wood, 0.25), -9, -15, 4, 1);
      }
    },

    soldier(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      shadow(10, 2.8);
      legs(o, C.steel3, C.steel2);
      // --- torso armour with plate highlights ---
      P(C.line, -7, -14, 15, 10);
      P(C.steel3, -6, -13, 13, 8);
      P(C.steel, -6, -13, 8, 7);
      P(C.white, -6, -13, 6, 1);       // top bevel
      P(c2, -6, -9, 13, 3);            // tabard
      P(c, -6, -9, 7, 3);
      P(ac, -5, -8, 3, 1);             // sigil
      P(C.steel2, -6, -13, 1, 8);      // side shade
      // --- head + great helm ---
      P(C.line, -4, -20, 9, 7);
      P(C.skin2, -3, -19, 7, 4);
      P(C.skin, -3, -19, 5, 3);
      P(C.line2, 1, -18, 1, 2);        // eye slit
      P(C.line, -5, -23, 11, 4);
      P(C.steel, -5, -23, 10, 3);
      P(C.steel2, -5, -21, 10, 2);
      P(C.white, -4, -23, 5, 1);       // helm shine
      P(C.line2, 5, -22, 1, 3);
      P(c, -1, -25, 3, 2);             // crest
      P(ac, 0, -26, 2, 1);
      // --- sword (raised on attack) ---
      const sw = o.attacking ? Math.sin(o.t * 16) * 4 : 0;
      const sh = o.attacking ? -2 : 0;
      P(C.line2, 5, -12 + sw, 2, 4);
      P(C.steel2, 5, -20 + sw + sh, 2, 9);
      P(C.steel, 5, -20 + sw + sh, 1, 8);
      P(C.white, 5, -20 + sw + sh, 1, 3);
      // --- shield (front, catching light) ---
      P(C.line, -11, -14, 6, 9);
      P(C.steel2, -10, -13, 4, 7);
      P(c, -10, -13, 4, 6);
      P(ac, -9, -11, 2, 2);
      P(tint(c, 0.3), -10, -13, 1, 5);
    },

    archer(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      shadow(9, 2.6);
      legs(o, C.wood3, C.wood2);
      // --- leaf cloak ---
      P(C.line, -7, -14, 13, 10);
      P(c2, -6, -13, 11, 8);
      P(c, -6, -13, 6, 7);
      P(tint(c, 0.2), -6, -13, 2, 5);
      P(C.wood2, -6, -6, 11, 2);
      P(C.gold, -2, -6, 2, 2);
      // ragged hem
      P(c2, -6, -4, 3, 2);
      P(c2, 2, -4, 3, 2);
      // --- hood + face in shadow ---
      P(C.line, -5, -20, 12, 8);
      P(c2, -4, -19, 10, 6);
      P(tint(c2, 0.15), -4, -19, 2, 4);
      P(C.skin2, -2, -17, 6, 4);
      P(C.skin, -2, -17, 4, 3);
      P(C.black, 1, -16, 2, 2);        // shaded eye
      P(C.white, 2, -16, 1, 1);
      P(ac, -4, -16, 2, 1);
      // hood tip
      poly(C.line, [-5, -20, 4, -22, 2, -18]);
      poly(c2, [-4, -20, 3, -21, 1, -19]);
      // --- bow, drawn back while attacking ---
      const draw = o.attacking ? Math.abs(Math.sin(o.t * 9)) : 0;
      P(C.line2, -10, -17, 1, 11);
      P(C.wood3, -10, -17, 1, 10);
      P(C.wood, -11, -18, 1, 2);
      P(C.wood, -11, -8, 1, 2);
      P(C.bone, -10 + draw * 2, -16, 1, 7);  // string
      if (draw > 0.4) {
        P(C.white, -8 + draw * 2, -13, 4, 1); // arrow nocked
      }
      // --- quiver ---
      P(C.line, 4, -14, 4, 7);
      P(C.wood2, 4, -14, 3, 6);
      P(C.white, 4, -17, 1, 3);
      P(C.white, 6, -17, 1, 3);
      P(C.red, 4, -16, 1, 1);
      P(C.red, 6, -16, 1, 1);
    },

    knight(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      shadow(14, 3.8);
      const ph = stride(o);
      // --- horse: lit top, dark belly ---
      P(C.line, -12, -14, 24, 11);
      P(c2, -11, -13, 22, 8);
      P(tint(c2, 0.22), -11, -13, 22, 2);  // back highlight
      P(tint(c2, -0.3), -11, -8, 22, 3);   // belly shade
      P(ac, -9, -11, 8, 2);                // barding
      P(C.gold, -3, -11, 3, 2);
      // legs: 3-frame gallop
      P(C.line2, -9 + ph * 2, -4, 3, 5);
      P(C.line2, -4 - ph * 2, -4, 3, 5);
      P(C.line2, 2 + ph * 2, -4, 3, 5);
      P(C.line2, 7 - ph * 2, -4, 3, 5);
      // neck + head
      P(C.line, 8, -21, 8, 10);
      P(c2, 9, -20, 6, 7);
      P(C.line, 10, -25, 7, 6);
      P(c2, 11, -24, 5, 4);
      P(tint(c2, 0.2), 11, -24, 5, 1);
      P(C.black, 14, -23, 1, 1);
      P(C.line2, 16, -21, 1, 2);
      // mane
      P(c, 8, -22, 2, 6);
      // tail
      P(C.line2, -14, -13, 3, 7);
      P(c2, -14, -12, 2, 5);
      // --- rider ---
      const bob = o.moving ? Math.round(Math.sin(o.walk * 12)) : 0;
      P(C.line, -4, -24 - bob, 9, 11);
      P(C.steel2, -3, -23 - bob, 7, 9);
      P(C.steel, -3, -23 - bob, 4, 8);
      P(C.white, -3, -23 - bob, 3, 1);
      P(c, -3, -20 - bob, 7, 3);
      P(ac, -2, -19 - bob, 3, 1);
      P(C.skin, -1, -28 - bob, 5, 4);
      P(C.line2, 3, -27 - bob, 1, 2);
      P(C.line, -2, -31 - bob, 8, 4);
      P(C.steel, -2, -31 - bob, 7, 3);
      P(C.steel2, -2, -29 - bob, 7, 2);
      P(c, 1, -34 - bob, 3, 3);
      P(ac, 2, -35 - bob, 1, 2);
      // --- lance, couched when attacking ---
      const lu = o.attacking ? 6 : 0;
      P(C.line2, 6 + lu, -27 - bob, 2, 17);
      P(C.wood2, 6 + lu, -26 - bob, 1, 15);
      P(C.steel2, 6 + lu, -32 - bob, 2, 6);
      P(C.white, 6 + lu, -32 - bob, 1, 4);
      P(c, 5 + lu, -19 - bob, 4, 2);
      if (o.attacking) {
        P(C.white, 8 + lu, -30 - bob, 3, 1); // motion streak
        P(C.white, 8 + lu, -24 - bob, 2, 1);
      }
    },

    siege(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2;
      const bounce = o.moving ? Math.round(Math.sin(o.walk * 14)) : 0;
      shadow(15, 4);
      // wheels with spokes
      for (const wx of [-9, 6]) {
        P(C.line, wx, -9, 9, 9);
        P(C.wood2, wx + 1, -8, 7, 7);
        P(C.wood3, wx + 2, -7, 5, 5);
        P(C.wood, wx + 3, -6, 3, 3);
        P(C.line2, wx + 4, -8, 1, 7);
        P(C.line2, wx + 1, -5, 7, 1);
      }
      // frame
      P(C.line, -12, -20 + bounce, 24, 12);
      P(C.wood, -11, -19 + bounce, 22, 9);
      P(C.wood2, -11, -13 + bounce, 22, 3);
      P(tint(C.wood, 0.22), -11, -19 + bounce, 22, 2);
      P(C.wood3, -11, -17 + bounce, 22, 1);
      // iron bands
      P(C.steel3, -7, -19 + bounce, 2, 9);
      P(C.steel3, 3, -19 + bounce, 2, 9);
      // ram log + iron head
      P(C.line2, 3, -17 + bounce, 11, 6);
      P(C.wood3, 4, -16 + bounce, 9, 4);
      P(C.steel3, 12, -18 + bounce, 4, 8);
      P(C.steel2, 12, -18 + bounce, 4, 2);
      // pennant
      P(c, -9, -18 + bounce, 4, 7);
      P(c2, -9, -18 + bounce, 4, 2);
      // crew
      P(C.line, -3, -26 + bounce, 7, 8);
      P(c, -2, -25 + bounce, 5, 5);
      P(C.skin2, -1, -30 + bounce, 5, 4);
      P(C.skin, -1, -30 + bounce, 3, 3);
      P(C.line2, 2, -29 + bounce, 1, 1);
      P(C.line, -2, -32 + bounce, 7, 3);
      P(C.straw, -1, -32 + bounce, 5, 2);
    },
  };

  /* ================= SPRITE CACHE =================
     Drawing ~40 vector-ish sprites per frame with dozens of fillRects each is
     the single biggest per-frame cost in the game. Every (unit type, faction,
     pose) combination is rasterised once into an offscreen canvas and after
     that a unit costs exactly one drawImage.
     Pose key = stride phase + attack flag + carry flag (worker only).            */
  const CACHE = new Map();
  const PAD = 6;              // room for shadows / lance tips / streaks
  const OUTLINE = 'rgba(12,9,20,0.92)';
  const SPR_W = { worker: 26, soldier: 28, archer: 26, knight: 40, siege: 38 };
  const SPR_H = { worker: 34, soldier: 36, archer: 34, knight: 46, siege: 40 };
  const SPR_BASE = { worker: 4, soldier: 4, archer: 4, knight: 5, siege: 5 };

  function cacheCanvas(w, h) {
    const c = (typeof OffscreenCanvas !== 'undefined')
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement('canvas'), { width: w, height: h });
    if (!c.width) { c.width = w; c.height = h; }
    return c;
  }

  function unitSprite(type, fac, o) {
    const moving = !!o.moving;
    const ph = moving ? Math.floor(o.walk * 6) % 3 : 0;
    const atk = o.attacking ? 1 : 0;
    const carry = o.carry ? 1 : 0;
    const key = type + '|' + fac.color + '|' + ph + '|' + atk + '|' + carry;
    let s = CACHE.get(key);
    if (s) return s;

    const w = (SPR_W[type] || 28) + PAD * 2;
    const h = (SPR_H[type] || 36) + PAD * 2;
    const c = cacheCanvas(w, h);
    const cx = c.getContext('2d');
    if (!cx) return null;
    cx.imageSmoothingEnabled = false;
    const baseY = h - PAD - (SPR_BASE[type] || 4);
    const art = UNIT_ART[type] || UNIT_ART.soldier;
    const pose = {
      moving: moving && ph !== 1,
      walk: ph === 0 ? 0.1 : ph === 2 ? 0.35 : 0.25,
      attacking: !!o.attacking,
      t: atk ? 0.22 : 0,
      carry: carry === 1,
      scale: 1,
    };

    // 1. paint the art onto a scratch canvas
    const scratch = cacheCanvas(w, h);
    const sx2 = scratch.getContext('2d');
    if (!sx2) return null;
    const prev = ctxRef;
    ctxRef = sx2;
    sx2.save();
    sx2.translate(w / 2, baseY);
    art(sx2, fac, pose);
    sx2.restore();
    ctxRef = prev;

    // 2. turn a copy into a flat silhouette, then stamp it around the edges.
    //    A 1px dark rim is what keeps 20px soldiers legible in a crowd.
    const sil = cacheCanvas(w, h);
    const sc = sil.getContext('2d');
    if (sc) {
      sc.drawImage(scratch, 0, 0);
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = OUTLINE;
      sc.fillRect(0, 0, w, h);
      sc.globalCompositeOperation = 'source-over';
      const R = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (let i = 0; i < R.length; i++) cx.drawImage(sil, R[i][0], R[i][1]);
    }
    // 3. the sprite itself on top
    cx.drawImage(scratch, 0, 0);
    s = { canvas: c, w, h, ox: w / 2, oy: baseY };
    CACHE.set(key, s);
    return s;
  }

  RTS.drawUnitSprite = function (ctx, type, fac, x, y, o) {
    const spr = unitSprite(type, fac, o || {});
    if (!spr) return;
    const s = o.scale || 1;
    const dx = Math.round(x - spr.ox * s);
    const dy = Math.round(y - spr.oy * s);
    if (s === 1) ctx.drawImage(spr.canvas, dx, dy);
    else {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spr.canvas, dx, dy, spr.w * s, spr.h * s);
    }
  };

  /* costs of rendering a sprite the old way, kept for the headless tests and
     for the loading screen preview */
  RTS.drawUnitSpriteDirect = function (ctx, type, fac, x, y, o) {
    ctxRef = ctx;
    ctx.save();
    ctx.translate(x, y);
    const art = UNIT_ART[type] || UNIT_ART.soldier;
    art(ctx, fac, o);
    ctx.restore();
  };
  RTS.clearSpriteCache = function () { CACHE.clear(); };

  /* ================= BUILDINGS ================= */
  function stoneChunk(x, y, w, h, seed) {
    P(C.line, x, y, w, h);
    P(C.stone2, x + 1, y + 1, w - 2, h - 2);
    P(C.stone, x + 1, y + 1, w - 2, Math.max(1, h - 3));
    // brick lines
    if (h > 5) P(C.stone3, x + 1, y + Math.floor(h / 2), w - 2, 1);
    if (w > 8) P(C.stone3, x + Math.floor(w / 2), y + 1, 1, Math.floor(h / 2) - 1);
  }

  function banner(cx, topY, fac) {
    P(C.wood3, cx, topY, 2, 14);
    P(C.line, cx - 1, topY - 1, 4, 2);
    // cloth
    const c = fac.color, ac = fac.accent;
    P(C.line, cx + 2, topY + 1, 8, 8);
    P(c, cx + 2, topY + 1, 7, 7);
    P(ac, cx + 4, topY + 3, 3, 3);
    poly(C.line, [cx + 2, topY + 9, cx + 9, topY + 9, cx + 5, topY + 12]);
    poly(c, [cx + 2, topY + 9, cx + 8, topY + 9, cx + 5, topY + 11]);
  }

  const BUILDING_ART = {
    keep(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      const lit = tint(C.stone, 0.16), dark = tint(C.stone3, -0.15);
      // ---- main hall: lit face on the left third, shadow on the right ----
      stoneChunk(-w / 2, -h + 10, w, h - 10);
      P(lit, -w / 2 + 1, -h + 11, Math.round(w * 0.34), h - 14);
      P(dark, w / 2 - Math.round(w * 0.16), -h + 11, Math.round(w * 0.16) - 1, h - 14);
      // stone courses
      for (let y = -h + 16; y < -4; y += 5) P(C.stone3, -w / 2 + 1, y, w - 2, 1);
      // faction band under the battlements
      P(c2, -w / 2 + 2, -h + 12, w - 4, 4);
      P(c, -w / 2 + 2, -h + 12, w - 4, 2);
      P(ac, -w / 2 + 4, -h + 12, 3, 1);
      P(ac, w / 2 - 7, -h + 12, 3, 1);
      // ---- battlement crenellations ----
      for (let i = 0; i < 4; i++) {
        P(C.line, -w / 2 + i * 11, -h + 5, 8, 7);
        P(C.stone, -w / 2 + 1 + i * 11, -h + 6, 6, 5);
        P(lit, -w / 2 + 1 + i * 11, -h + 6, 2, 4);
        P(dark, -w / 2 + 6 + i * 11, -h + 6, 1, 4);
      }
      // ---- arched door with portcullis ----
      P(C.line, -7, -15, 14, 15);
      poly(C.wood2, [-6, 0, -6, -11, 0, -15, 6, -11, 6, 0]);
      P(C.wood, -5, -12, 11, 12);
      P(tint(C.wood, 0.2), -5, -12, 3, 10);
      for (let i = 0; i < 3; i++) P(C.wood3, -5, -10 + i * 4, 11, 1);
      P(C.steel3, -6, -9, 12, 1);
      P(C.gold, -1, -6, 2, 2);
      // ---- windows, glowing with faction light ----
      for (const wx of [-17, 11]) {
        P(C.line, wx - 1, -32, 7, 9);
        P(C.black, wx, -31, 5, 7);
        P(i2(t) ? ac : '#f7e08a', wx, -31, 5, 3);
        P(C.line2, wx + 2, -31, 1, 7);
      }
      // ---- corner tower ----
      P(C.line, -15, -h - 13, 22, 24);
      P(C.stone2, -14, -h - 12, 20, 22);
      P(lit, -14, -h - 12, 7, 21);
      P(dark, 4, -h - 12, 2, 21);
      for (let y = -h - 8; y < -h + 8; y += 5) P(C.stone3, -14, y, 20, 1);
      // slit
      P(C.black, -5, -h - 6, 3, 7);
      // crenellations on the tower
      for (let i = 0; i < 3; i++) {
        P(C.line, -15 + i * 8, -h - 17, 6, 5);
        P(C.stone, -14 + i * 8, -h - 16, 4, 3);
      }
      // ---- conical roof ----
      P(C.line, -16, -h - 18, 24, 3);
      poly(C.line, [-15, -h - 18, 8, -h - 18, -4, -h - 31]);
      poly(C.roof, [-13, -h - 19, 6, -h - 19, -4, -h - 28]);
      poly(C.roof2, [-4, -h - 28, 3, -h - 21, -4, -h - 19]);
      P(tint(C.roof, 0.2), -10, -h - 20, 4, 3);
      // finial pennant
      P(C.wood3, -4, -h - 34, 1, 5);
      P(ac, -3, -h - 34, 4, 3);
      banner(w / 2 - 4, -h - 6, fac);
    },

    farm(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2;
      // ---- fence ring with posts ----
      P(C.wood3, -w / 2, -17, w, 2);
      P(C.wood2, -w / 2, -15, w, 1);
      for (let i = 0; i < 5; i++) {
        P(C.line2, -w / 2 + 1 + i * 8, -21, 2, 7);
        P(C.wood2, -w / 2 + 2 + i * 8, -21, 1, 6);
      }
      // ---- tilled soil, furrowed ----
      P(C.line, -w / 2 + 1, -14, w - 2, 14);
      P('#5b4029', -w / 2 + 2, -13, w - 4, 12);
      P('#6f4f33', -w / 2 + 2, -12, w - 4, 2);
      for (let i = 0; i < 4; i++) {
        P('#4a3320', -w / 2 + 3, -10 + i * 3, w - 6, 1);
        P('#7d5a3a', -w / 2 + 3, -9 + i * 3, w - 6, 1);
      }
      // ---- wheat rows, swaying ----
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 8; i++) {
          const cx = -w / 2 + 4 + i * 3;
          const cy = -11 + row * 3;
          const sway = Math.round(Math.sin(t * 1.8 + i * 0.7 + row) * 0.8);
          P('#7a5c22', cx + sway, cy, 1, 3);
          P(i % 2 ? '#e8c15a' : '#dcb957', cx + sway, cy - 1, 1, 2);
          P(tint('#e8c15a', 0.3), cx + sway, cy - 1, 1, 1);
        }
      }
      // ---- farmhouse with chimney ----
      const hx = w / 2 - 14;
      P(C.line, hx, -24, 14, 14);
      P(C.wood2, hx + 1, -23, 12, 12);
      P(tint(C.wood2, 0.18), hx + 1, -23, 4, 11);
      P(C.wood3, hx + 1, -23, 12, 1);
      for (let i = 0; i < 3; i++) P(C.wood3, hx + 1, -19 + i * 4, 12, 1);
      poly(C.line, [hx - 3, -23, hx + 16, -23, hx + 7, -31]);
      poly(C.roof, [hx - 1, -24, hx + 14, -24, hx + 7, -30]);
      poly(C.roof2, [hx + 7, -30, hx + 14, -24, hx + 7, -24]);
      // door + window
      P(C.wood3, hx + 3, -17, 4, 6);
      P(C.black, hx + 8, -20, 3, 3);
      P('#f7e08a', hx + 8, -20, 3, 2);
      // chimney smoke
      P(C.stone2, hx + 9, -33, 4, 4);
      for (let i = 0; i < 2; i++) {
        const pp = (t * 0.4 + i * 0.5) % 1;
        ctxRef.fillStyle = 'rgba(200,196,208,' + (0.3 * (1 - pp)).toFixed(2) + ')';
        ctxRef.fillRect(hx + 9 + Math.sin(pp * 6) * 2, -34 - pp * 10, 2 + pp * 2, 2 + pp * 2);
      }
      // ---- scarecrow ----
      P(C.wood3, -w / 2 + 6, -28, 2, 14);
      P(C.wood3, -w / 2 + 3, -25, 9, 2);
      P(C.line, -w / 2 + 3, -24, 8, 5);
      P(C.straw, -w / 2 + 4, -23, 6, 4);
      P(C.straw2, -w / 2 + 4, -20, 6, 1);
      P(C.line, -w / 2 + 2, -30, 9, 4);
      P(C.straw, -w / 2 + 3, -30, 7, 3);
      P(C.line2, -w / 2 + 5, -26, 1, 1);
      P(C.line2, -w / 2 + 7, -26, 1, 1);
      P(c, -w / 2 + 4, -22, 2, 1);
    },

    barracks(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      // ---- timber hall ----
      P(C.line, -w / 2, -h + 8, w, h - 8);
      P(C.wood2, -w / 2 + 1, -h + 9, w - 2, h - 9);
      P(tint(C.wood2, 0.2), -w / 2 + 1, -h + 9, Math.round(w * 0.3), h - 10);
      P(tint(C.wood2, -0.22), w / 2 - 5, -h + 9, 4, h - 10);
      for (let i = 0; i < 4; i++) P(C.wood3, -w / 2 + 1, -h + 13 + i * 5, w - 2, 1);
      // vertical beams
      P(C.wood3, -w / 2 + 1, -h + 9, 2, h - 9);
      P(C.wood3, w / 2 - 3, -h + 9, 2, h - 9);
      // ---- steep roof with shingles ----
      poly(C.line, [-w / 2 - 2, -h + 10, w / 2 + 2, -h + 10, w / 2 - 2, -h - 8, -w / 2 + 2, -h - 8]);
      poly(C.roof, [-w / 2, -h + 9, w / 2, -h + 9, w / 2 - 3, -h - 6, -w / 2 + 3, -h - 6]);
      poly(C.roof2, [0, -h - 7, w / 2 - 2, -h + 9, w / 2 - 3, -h - 6]);
      for (let i = 0; i < 4; i++) {
        P(tint(C.roof2, 0.12), -w / 2 + 4 + i * 2, -h + 5 - i * 4, w - 8 - i * 4, 1);
      }
      P(tint(C.roof, 0.22), -w / 2 + 5, -h - 4, 6, 2);
      // ridge
      P(C.line, -w / 2 + 2, -h - 7, w - 4, 1);
      // ---- door ----
      P(C.line, -6, -13, 12, 13);
      P(C.wood3, -5, -12, 10, 12);
      P(C.wood, -5, -12, 10, 2);
      for (let i = 0; i < 2; i++) P(C.wood3, -5, -8 + i * 4, 10, 1);
      P(C.steel3, -4, -7, 1, 7);
      P(C.steel3, 3, -7, 1, 7);
      // faction plank above the door
      P(c2, -7, -16, 14, 3);
      P(c, -7, -16, 14, 2);
      P(ac, -2, -16, 4, 1);
      // ---- weapon rack ----
      for (let i = 0; i < 3; i++) {
        P(C.line2, -w / 2 + 4 + i * 4, -22, 1, 11);
        P(C.steel2, -w / 2 + 4 + i * 4, -23, 1, 3);
      }
      P(C.wood2, -w / 2 + 3, -13, 12, 2);
      // ---- banner ----
      P(C.wood3, w / 2 - 8, -h - 6, 2, 16);
      P(C.line, w / 2 - 7, -h - 5, 10, 9);
      P(c, w / 2 - 6, -h - 4, 8, 7);
      P(tint(c, 0.25), w / 2 - 6, -h - 4, 3, 5);
      P(ac, w / 2 - 4, -h - 2, 4, 4);
      poly(C.line, [w / 2 - 7, -h + 3, w / 2 + 3, -h + 3, w / 2 - 2, -h + 7]);
      poly(c, [w / 2 - 7, -h + 3, w / 2 + 1, -h + 3, w / 2 - 2, -h + 5]);
    },

    tower(ctx, fac, w, h, prog, t) {
      const c = fac.color, ac = fac.accent;
      const lit = tint(C.stone, 0.18), dark = tint(C.stone3, -0.1);
      // ---- shaft ----
      P(C.line, -w / 2, -h + 6, w, h - 6);
      P(C.stone2, -w / 2 + 1, -h + 7, w - 2, h - 7);
      P(lit, -w / 2 + 1, -h + 7, Math.round(w * 0.3), h - 8);
      P(dark, w / 2 - 4, -h + 7, 3, h - 8);
      // courses with alternating offsets
      for (let i = 0; i < 6; i++) {
        const y = -h + 9 + i * 5;
        P(C.stone3, -w / 2 + 1, y, w - 2, 1);
        P(C.stone3, -w / 2 + 1 + (i % 2 ? 4 : 8), y, 1, 5);
      }
      // ---- machicolated top ----
      P(C.line, -w / 2 - 3, -h - 4, w + 6, 11);
      P(C.stone2, -w / 2 - 2, -h - 3, w + 4, 9);
      P(lit, -w / 2 - 2, -h - 3, Math.round(w * 0.4), 8);
      P(C.stone, -w / 2 - 2, -h - 3, w + 4, 2);
      for (let i = 0; i < 3; i++) {
        P(C.line, -w / 2 - 3 + i * 8, -h - 9, 6, 6);
        P(C.stone, -w / 2 - 2 + i * 8, -h - 8, 4, 4);
        P(lit, -w / 2 - 2 + i * 8, -h - 8, 1, 3);
      }
      // ---- arched arrow slit ----
      P(C.black, -2, -h + 11, 4, 9);
      P(C.black, -1, -h + 9, 2, 2);
      P(C.stone3, -3, -h + 20, 6, 1);
      // ---- faction flag waving ----
      const wave = Math.round(Math.sin(t * 2.2) * 1.5);
      P(C.wood3, 4, -h - 22, 2, 13);
      P(C.line, 6, -h - 21, 10, 6);
      poly(c, [6, -h - 21, 15 + wave, -h - 21, 15 + wave, -h - 16, 6, -h - 16]);
      P(tint(c, 0.25), 7, -h - 21, 4, 3);
      P(ac, 9, -h - 19, 3, 3);
      P(c, 4, -h - 24, 3, 3); // finial
    },

    workshop(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2;
      // ---- stone base ----
      P(C.line, -w / 2, -h + 8, w, h - 8);
      stoneChunk(-w / 2, -h + 9, w, h - 9);
      P(tint(C.stone, 0.12), -w / 2 + 1, -h + 10, Math.round(w * 0.3), h - 12);
      for (let y = -h + 14; y < -4; y += 5) P(C.stone3, -w / 2 + 1, y, w - 2, 1);
      // ---- timber roof ----
      poly(C.line, [-w / 2 - 2, -h + 10, w / 2 + 2, -h + 10, w / 2 - 4, -h - 9, -w / 2 + 4, -h - 9]);
      poly(C.wood, [-w / 2, -h + 9, w / 2, -h + 9, w / 2 - 5, -h - 7, -w / 2 + 5, -h - 7]);
      for (let i = 0; i < 4; i++) {
        P(C.wood2, -w / 2 + 3 + i * 5, -h - 6 + i * 4, w - 6 - i * 10, 1);
      }
      P(tint(C.wood, 0.2), -w / 2 + 6, -h - 5, 8, 2);
      P(C.wood3, -w / 2 + 4, -h - 8, w - 8, 1);
      // ---- chimney + smoke ----
      P(C.line, 6, -h - 15, 8, 11);
      P(C.stone2, 7, -h - 14, 6, 10);
      P(tint(C.stone, 0.15), 7, -h - 14, 2, 9);
      P(C.stone3, 7, -h - 15, 6, 2);
      for (let i = 0; i < 3; i++) {
        const pp = (t * 0.45 + i * 0.33) % 1;
        const sz = 3 + pp * 6;
        ctxRef.fillStyle = 'rgba(198,196,210,' + (0.38 * (1 - pp)).toFixed(2) + ')';
        ctxRef.fillRect(9 - sz / 2 + Math.sin(pp * 7) * 4, -h - 17 - pp * 18, sz, sz);
      }
      // ---- hanging gear sign ----
      P(C.wood2, -w / 2 + 2, -h + 15, 11, 11);
      P(C.wood3, -w / 2 + 2, -h + 15, 11, 1);
      P(C.line, -w / 2 + 4, -h + 17, 7, 7);
      P(C.steel2, -w / 2 + 5, -h + 18, 5, 5);
      P(C.steel, -w / 2 + 6, -h + 19, 3, 3);
      P(C.black, -w / 2 + 7, -h + 20, 1, 1);
      // ---- door with plank hinges ----
      P(C.line, -6, -14, 13, 14);
      P(C.wood3, -5, -13, 11, 13);
      P(tint(C.wood3, 0.18), -5, -13, 3, 12);
      P(C.wood2, -5, -13, 11, 2);
      for (let i = 0; i < 2; i++) P(C.steel3, -5, -9 + i * 5, 11, 1);
      P(c, -5, -7, 11, 1);
      // ---- anvil by the door ----
      P(C.line, 7, -8, 6, 4);
      P(C.steel3, 8, -9, 4, 3);
      P(C.steel2, 8, -10, 3, 1);
    },
  };

  function i2(t) {
    return Math.floor(t * 2) % 3 !== 0;
  }

  RTS.drawBuildingSprite = function (ctx, type, fac, x, y, w, h, prog, t) {
    ctxRef = ctx;
    ctx.save();
    ctx.translate(x, y);
    const art = BUILDING_ART[type] || BUILDING_ART.farm;
    art(ctx, fac, w, h, prog, t);
    ctx.restore();
  };

  /* ================= PROPS ================= */
  /* trees are the most numerous object on screen, so they get the same
     treatment as units: three hand-authored variants, pre-rendered at four
     sizes, then blitted. */
  const TREE_CACHE = new Map();

  function paintTree(cx, variant) {
    ctxRef = cx;
    // ---- trunk ----
    P(C.line, -2, -13, 5, 13);
    P(C.wood2, -1, -13, 3, 13);
    P(C.wood, -1, -13, 1, 11);
    P(tint(C.wood, 0.3), 0, -12, 1, 6);
    // root flare
    P(C.wood3, -3, -2, 2, 2);
    P(C.wood3, 2, -2, 2, 2);

    if (variant === 0) {
      // ---- pine: four stacked skirts, lit from upper left ----
      for (let i = 0; i < 4; i++) {
        const y = -11 - i * 6;
        const w = 11 - i * 2;
        poly(C.line, [-w, y, w, y, 0, y - 8]);
        poly(i % 2 ? C.leaf3 : C.leaf2, [-w + 1, y - 1, w - 1, y - 1, 0, y - 7]);
        poly(C.leaf, [-w + 2, y - 1, 0, y - 1, 0, y - 6]);
        poly(C.leaf4, [-w + 3, y - 1, -2, y - 1, -1, y - 5]);
      }
      P(C.leaf4, -1, -37, 2, 3);
    } else if (variant === 1) {
      // ---- broadleaf: blobby canopy, dark base + lit crown ----
      P(C.line, -10, -26, 20, 13);
      poly(C.line, [-12, -22, 12, -22, 0, -12]);
      P(C.leaf3, -9, -25, 18, 11);
      poly(C.leaf2, [-11, -21, 11, -21, 0, -13]);
      // mid layer
      P(C.leaf2, -8, -30, 16, 7);
      P(C.leaf, -6, -33, 13, 6);
      poly(C.leaf, [-10, -26, 8, -26, 2, -33]);
      // lit crown
      P(C.leaf4, -5, -36, 9, 4);
      P(tint(C.leaf4, 0.3), -4, -36, 5, 2);
      // dappled holes for texture
      P(C.leaf3, 4, -30, 2, 2);
      P(C.leaf3, -6, -27, 2, 2);
      P(C.leaf2, 2, -22, 3, 2);
      // hanging leaves
      P(C.leaf3, -8, -14, 3, 3);
      P(C.leaf2, 5, -15, 3, 2);
    } else {
      // ---- bush / sapling cluster ----
      P(C.line, -9, -14, 18, 13);
      P(C.leaf3, -8, -13, 16, 11);
      P(C.leaf2, -6, -17, 12, 8);
      P(C.leaf, -4, -20, 9, 7);
      P(C.leaf4, -2, -21, 5, 4);
      P(tint(C.leaf4, 0.3), -1, -21, 3, 2);
      // side clump
      P(C.leaf3, 4, -11, 6, 7);
      P(C.leaf, 5, -13, 4, 5);
      // berries
      P(C.red, -3, -16, 1, 1);
      P('#f5c542', 3, -18, 1, 1);
      P(C.red, 1, -12, 1, 1);
    }
  }

  function treeSprite(variant, scale) {
    const bucket = Math.max(0, Math.min(3, Math.round((scale - 0.7) * 10)));
    const key = variant + '|' + bucket;
    let e = TREE_CACHE.get(key);
    if (e) return e;
    const sc = 0.76 + bucket * 0.08;
    const w = Math.ceil(28 * sc) + 8;
    const h = Math.ceil(44 * sc) + 8;
    const c = cacheCanvas(w, h);
    const cx = c.getContext('2d');
    if (!cx) return null;
    cx.imageSmoothingEnabled = false;
    const baseY = h - 4;
    // shadow ellipse
    cx.fillStyle = 'rgba(10,8,18,0.26)';
    cx.beginPath();
    cx.ellipse(w / 2, baseY, 9 * sc, 3 * sc, 0, 0, Math.PI * 2);
    cx.fill();
    cx.save();
    cx.translate(w / 2, baseY);
    cx.scale(sc, sc);
    paintTree(cx, variant);
    cx.restore();
    e = { canvas: c, w, h, ox: w / 2, oy: baseY };
    TREE_CACHE.set(key, e);
    return e;
  }

  RTS.drawTree = function (ctx, x, y, seed, scale) {
    const spr = treeSprite(seed % 3, scale || 1);
    if (!spr) return;
    ctx.drawImage(spr.canvas, Math.round(x - spr.ox), Math.round(y - spr.oy));
  };

  RTS.drawRock = function (ctx, x, y, seed, scale) {
    ctxRef = ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(12,8,20,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    poly(C.line, [-11, 0, -8, -9, -1, -13, 7, -9, 11, 0]);
    poly(C.stone2, [-9, -1, -7, -8, -1, -11, 6, -8, 9, -1]);
    poly(C.stone, [-7, -3, -5, -8, 0, -10, 4, -6]);
    P(C.stone3, 2, -6, 4, 4);
    ctx.restore();
  };

  RTS.drawGold = function (ctx, x, y, seed, t) {
    ctxRef = ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(12,8,20,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    P(C.stone3, -8, -3, 16, 3);
    for (let i = 0; i < 4; i++) {
      const gx = -7 + (i * 5 + (seed % 3));
      const gh = 4 + ((seed + i * 3) % 4);
      P(C.line, gx, -3 - gh, 4, gh);
      P(C.gold, gx + 1, -2 - gh, 2, gh - 1);
      P('#fff0a8', gx + 1, -2 - gh, 1, 2);
    }
    if (Math.floor(t * 2 + seed) % 7 === 0) {
      ctx.fillStyle = '#fff6c2';
      ctx.fillRect(-2, -12, 1, 1);
      ctx.fillRect(3, -9, 1, 1);
    }
    ctx.restore();
  };

  RTS.drawCorpse = function (ctx, x, y, t, age) {
    ctx.save();
    ctx.translate(x, y);
    const a = Math.max(0, 1 - age / 14);
    ctx.globalAlpha = a * 0.7;
    ctx.fillStyle = '#4a3a52';
    ctx.beginPath();
    ctx.ellipse(0, -1, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  RTS.drawProjectile = function (ctx, x, y, kind, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    if (kind === 'arrow') {
      P(C.wood3, -6, -1, 9, 1);
      P(C.white, 3, -1, 3, 1);
      P(C.white, -6, -2, 2, 1);
    } else if (kind === 'bolt') {
      P('#ffcf5c', -2, -2, 5, 4);
      P('#fff3b0', -1, -1, 3, 2);
    } else {
      P('#ff8a3c', -2, -2, 4, 4);
    }
    ctx.restore();
  };

  RTS.drawMeteor = function (ctx, x, y, t, p) {
    // p: 0..1 progress of fall
    ctx.save();
    const h = 220 * (1 - p);
    ctx.globalAlpha = 0.75;
    P('#ffd36e', x - 3, y - h - 26, 6, 26);
    P('#ff8a3c', x - 5, y - h - 14, 10, 18);
    P('#fff0b0', x - 2, y - h - 22, 4, 20);
    ctx.restore();
  };

  /* ================= UI ICONS =================
     Every icon is authored on a 32x32 grid with a 1px dark outline so it stays
     legible when blitted down to 15-30 CSS px on a phone. They share the unit
     palette, so the HUD reads as the same world as the battlefield.          */
  const IC = {
    ink: '#150e1e',
    ink2: '#2b1f36',
    hi: '#ffffff',
  };

  function box(x, y, w, h, fill, edge) {
    P(edge || IC.ink, x - 1, y - 1, w + 2, h + 2);
    P(fill, x, y, w, h);
  }

  /* vector primitives for diagonal shapes: under-stroke with ink, then fill.
     Drawing them rect-by-rect erases the previous step's fill, so use paths. */
  function ik(x0, y0, x1, y1, w) {
    if (!ctxRef) return;
    ctxRef.lineCap = 'round';
    ctxRef.lineJoin = 'round';
    ctxRef.strokeStyle = IC.ink;
    ctxRef.lineWidth = w + 2.6;
    ctxRef.beginPath();
    ctxRef.moveTo(x0, y0);
    ctxRef.lineTo(x1, y1);
    ctxRef.stroke();
  }

  function ln(x0, y0, x1, y1, w, col, hl) {
    ik(x0, y0, x1, y1, w);
    if (!ctxRef) return;
    ctxRef.strokeStyle = col;
    ctxRef.lineWidth = w;
    ctxRef.beginPath();
    ctxRef.moveTo(x0, y0);
    ctxRef.lineTo(x1, y1);
    ctxRef.stroke();
    if (hl) {
      ctxRef.strokeStyle = hl;
      ctxRef.lineWidth = Math.max(0.9, w * 0.34);
      ctxRef.beginPath();
      ctxRef.moveTo(x0 - w * 0.22, y0 - w * 0.22);
      ctxRef.lineTo(x1 - w * 0.22, y1 - w * 0.22);
      ctxRef.stroke();
    }
  }

  /* filled ellipse with an ink rim, used for wheels and round heads */
  function disc(cx, cy, r, col, rimCol) {
    if (!ctxRef) return;
    ctxRef.fillStyle = rimCol || IC.ink;
    ctxRef.beginPath();
    ctxRef.arc(cx, cy, r + 1.1, 0, Math.PI * 2);
    ctxRef.fill();
    ctxRef.fillStyle = col;
    ctxRef.beginPath();
    ctxRef.arc(cx, cy, r, 0, Math.PI * 2);
    ctxRef.fill();
  }

  /* log: a cylinder lying at an angle, with an end grain ring */
  function log(cx, cy, len, thick, tone) {
    for (let i = 0; i < len; i++) {
      const x = cx + i, y = cy - Math.round(i * 0.45);
      P(IC.ink, x, y, 1, thick + 2);
      P(tone, x, y + 1, 1, thick);
      if (i % 3 === 0) P(tint(tone, -0.18), x, y + thick - 1, 1, 1);
    }
    // end grain
    const ex = cx + len - 1, ey = cy - Math.round((len - 1) * 0.45);
    P(IC.ink, ex, ey, thick + 2, thick + 2);
    P(tint(tone, 0.18), ex + 1, ey + 1, thick, thick);
    P(tone, ex + 2, ey + 2, thick - 2, thick - 2);
  }

  RTS.drawIcon = function (ctx, name, size, fac) {
    ctxRef = ctx;
    ctx.save();
    ctx.clearRect(0, 0, size, size);
    ctx.scale(size / 32, size / 32);
    const c = fac ? fac.color : '#3f8fe0';
    const c2 = fac ? fac.color2 : '#1f5c9e';
    const ac = fac ? fac.accent : '#a8dcff';

    switch (name) {
      case 'wood': {
        // three thick logs: two stacked, one on top, all showing end grain
        const bar = (x, y, w, h, tone) => {
          P(IC.ink, x - 1, y - 1, w + 2, h + 2);
          P(tone, x, y, w, h);
          P(tint(tone, 0.28), x, y, w, 2);
          P(tint(tone, -0.3), x, y + h - 2, w, 2);
          for (let i = 3; i < w - 4; i += 6) P(tint(tone, -0.18), x + i, y + 2, 1, h - 4);
          // end grain
          P(tint(tone, 0.4), x + w - 5, y + 2, 3, h - 4);
          P(tone, x + w - 4, y + 3, 1, h - 6);
        };
        bar(3, 19, 26, 9, C.wood);
        bar(1, 11, 22, 9, C.wood2);
        bar(11, 3, 19, 9, C.wood);
        P(tint(C.wood, 0.45), 24, 5, 4, 4);
        break;
      }
      case 'food': {
        // a compact gold ear: tapered almond body with kernel chevrons
        poly(IC.ink, [16, 0, 24, 8, 22, 16, 16, 19, 10, 16, 8, 8]);
        poly('#e0bc5c', [16, 2, 22, 9, 20, 15, 16, 17, 12, 15, 10, 9]);
        poly('#f7dd90', [16, 2, 20, 9, 19, 15, 16, 17]);
        poly('#c8a24a', [19, 9, 22, 9, 20, 15, 17, 16]);
        // kernel chevrons
        for (let k = 0; k < 3; k++) {
          const y = 6 + k * 4;
          poly('#b8933c', [16 - 5 + k, y, 16, y + 2, 16 + 5 - k, y, 16 + 5 - k, y + 1, 16, y + 3, 16 - 5 + k, y + 1]);
          P('#fff8d8', 16 - 4 + k, y, 2, 1);
          P('#fff8d8', 16 + 3 - k, y, 1, 1);
        }
        // awns
        ln(16, 3, 13, 0, 1, '#c8a24a');
        ln(16, 3, 19, 0, 1, '#c8a24a');
        // stem + leaves
        ln(16, 17, 16, 31, 2.2, '#c8a24a', '#e9c352');
        poly(IC.ink, [3, 26, 15, 20, 16, 23, 4, 30]);
        poly('#5f9a46', [5, 25, 14, 21, 15, 23, 6, 28]);
        poly(IC.ink, [17, 24, 28, 20, 29, 23, 18, 27]);
        poly('#4f9d43', [18, 24, 27, 21, 27, 23, 19, 26]);
        break;
      }
      case 'pop': {
        // single bold bust: reads as "people" at 15 px, unlike a crowd of boxes
        poly(IC.ink, [4, 32, 4, 26, 10, 21, 16, 19, 22, 21, 28, 26, 28, 32]);
        poly(c2, [6, 32, 6, 27, 11, 22, 16, 21, 21, 22, 26, 27, 26, 32]);
        poly(c, [7, 32, 7, 28, 12, 23, 16, 22, 16, 32]);
        P(tint(c, 0.35), 8, 30, 6, 2);
        // collar
        poly(IC.ink, [12, 20, 16, 25, 20, 20, 20, 27, 12, 27]);
        P(c2, 13, 21, 6, 5);
        // head
        P(IC.ink, 9, 3, 15, 18);
        P(C.skin, 10, 4, 13, 16);
        P(C.skin2, 21, 6, 2, 12);
        // hair / straw hat
        poly(IC.ink, [4, 4, 10, 1, 22, 1, 28, 4, 28, 7, 4, 7]);
        poly(C.straw, [5, 4, 11, 2, 21, 2, 27, 4, 27, 6, 5, 6]);
        P('#f0d47a', 6, 4, 20, 1);
        P(C.straw2, 6, 6, 20, 1);
        poly(IC.ink, [11, 0, 21, 0, 21, 4, 11, 4]);
        poly(C.straw2, [12, 1, 20, 1, 20, 3, 12, 3]);
        // face
        P(IC.ink2, 13, 9, 2, 2);
        P(IC.ink2, 19, 9, 2, 2);
        P('#a86a4a', 15, 13, 4, 1);
        P('#f6d0b0', 12, 11, 2, 2);
        break;
      }
      case 'favor': {
        poly(IC.ink, [16, 1, 30, 12, 16, 31, 2, 12]);
        poly('#63c9e8', [16, 3, 28, 12, 16, 29, 4, 12]);
        // table facet
        poly('#a9ecff', [16, 3, 23, 12, 16, 12, 9, 12]);
        // pavilion facets
        poly('#43a7c6', [16, 12, 28, 12, 16, 29]);
        poly('#2f83a0', [16, 12, 4, 12, 16, 29]);
        poly('#1d5f78', [16, 20, 22, 13, 16, 29]);
        // girdle + glints
        P('#0e3546', 3, 11, 26, 2);
        P('#e8fdff', 11, 6, 3, 3);
        P('#e8fdff', 20, 7, 2, 2);
        break;
      }
      case 'sword': {
        // vertical blade filling the tile: the most legible icon at 15 px
        poly(IC.ink, [12, 1, 16, 0, 20, 1, 20, 20, 12, 20]);
        poly(C.steel2, [13, 2, 16, 1, 19, 2, 19, 19, 13, 19]);
        poly(C.white, [13, 2, 16, 1, 16, 19, 13, 19]);
        poly(C.steel, [17, 2, 19, 2, 19, 19, 17, 19]);
        P(C.white, 14, 3, 1, 13);
        P('#8d99a8', 16, 6, 1, 12);
        // crossguard
        poly(IC.ink, [5, 19, 27, 19, 27, 24, 5, 24]);
        poly(C.gold, [6, 20, 26, 20, 26, 23, 6, 23]);
        poly('#fff2b0', [6, 20, 26, 20, 26, 21, 6, 21]);
        P('#c99a1f', 6, 22, 20, 1);
        P(C.white, 6, 20, 5, 1);
        // grip with wrap
        poly(IC.ink, [12, 24, 20, 24, 20, 28, 12, 28]);
        P(C.wood3, 13, 24, 6, 4);
        P(C.wood2, 13, 25, 6, 1);
        P(C.wood2, 13, 27, 6, 1);
        // pommel
        disc(16, 29, 2.2, C.gold);
        P('#fff2b0', 15, 28, 1, 1);
        break;
      }
      case 'bow': {
        // limbs as one smooth C: quadratic from tip to tip, bulging left
        if (ctxRef) {
          ctxRef.lineCap = 'round';
          const limb = (w, col, off) => {
            ctxRef.strokeStyle = col;
            ctxRef.lineWidth = w;
            ctxRef.beginPath();
            ctxRef.moveTo(21 + off, 3);
            ctxRef.quadraticCurveTo(9 + off, 16, 21 + off, 29);
            ctxRef.stroke();
          };
          limb(7.4, IC.ink, 0);
          limb(5.2, C.wood, 0);
          limb(1.8, tint(C.wood, 0.4), -0.9);
        }
        // grip wrap at the belly
        ln(10, 12, 10, 20, 5, C.wood3, tint(C.wood3, 0.4));
        P(C.gold, 8, 15, 5, 2);
        // string, straight tip to tip
        ln(21, 4, 21, 28, 1.3, '#efe7d6');
        // nocked arrow pointing right, past the bow
        ln(9, 16, 27, 16, 2.6, C.wood2, tint(C.wood2, 0.45));
        poly(IC.ink, [25, 12, 32, 16, 25, 20]);
        poly(C.steel, [26, 14, 30, 16, 26, 18]);
        // fletching at the nock
        poly(ac, [11, 12, 18, 16, 11, 20]);
        P('#ffffff', 12, 15, 5, 1);
        break;
      }
      case 'horse': {
        const body = tint(c2, -0.32), lite = c, dk = tint(c2, -0.5);
        // legs first so the body overlaps their tops
        const leg = (x, back) => {
          poly(IC.ink, [x - 1, 18, x + 4, 18, x + 3, 31, x - 1, 31]);
          P(back ? body : c2, x, 19, 3, 11);
          P(dk, x, 27, 3, 2);
          P(IC.ink, x - 1, 30, 5, 2);
        };
        leg(8, true); leg(12, true); leg(19, false); leg(23, false);
        // barrel of the body
        poly(IC.ink, [5, 11, 22, 10, 26, 15, 24, 21, 9, 22, 4, 17]);
        poly(c2, [6, 13, 21, 12, 24, 16, 23, 20, 9, 21, 6, 18]);
        poly(lite, [7, 13, 20, 12, 21, 15, 8, 17]);
        poly(body, [8, 19, 23, 19, 23, 20, 9, 21]);
        // neck rising to the right
        poly(IC.ink, [17, 13, 23, 4, 29, 5, 27, 14, 23, 17]);
        poly(c2, [19, 13, 24, 6, 27, 7, 25, 14, 22, 16]);
        poly(lite, [20, 12, 24, 6, 25, 8, 22, 13]);
        // head + muzzle, tapering right and down
        poly(IC.ink, [22, 2, 29, 3, 31, 8, 30, 12, 25, 12, 22, 8]);
        poly(c, [23, 4, 28, 4, 29, 8, 29, 10, 25, 11, 23, 8]);
        P(tint(c, 0.45), 24, 4, 4, 2);
        poly(body, [25, 9, 30, 10, 30, 12, 25, 12]);
        P(IC.ink2, 28, 7, 2, 2);
        P('#fdf6ec', 24, 9, 2, 2);
        // ear + forelock
        poly(IC.ink, [21, 3, 22, 0, 25, 3]);
        poly(dk, [22, 3, 22, 1, 24, 3]);
        poly(dk, [21, 5, 24, 3, 25, 7, 22, 9]);
        // mane down the neck
        poly(dk, [23, 8, 26, 6, 24, 12, 21, 15]);
        // tail
        ln(5, 13, 2, 23, 2.6, dk, tint(c2, -0.2));
        P(IC.ink, 1, 22, 4, 3);
        break;
      }
      case 'ram': {
        // roof cover
        poly(IC.ink, [1, 13, 16, 3, 31, 13]);
        poly(C.wood3, [2, 12, 16, 5, 30, 12]);
        poly(tint(C.wood, 0.12), [3, 11, 16, 5, 29, 11]);
        for (let i = 0; i < 4; i++) P(C.wood2, 6 + i * 6, 7, 1, 5);
        // body
        P(IC.ink, 2, 13, 28, 11);
        P(C.wood, 3, 14, 26, 7);
        P(tint(C.wood, 0.28), 3, 14, 26, 2);
        P(C.steel3, 7, 13, 2, 10);
        P(C.steel3, 18, 13, 2, 10);
        // ram head with spike
        P(IC.ink, 20, 8, 11, 9);
        P(C.steel2, 21, 9, 9, 7);
        P(C.steel, 21, 9, 9, 2);
        P('#ffffff', 22, 10, 3, 1);
        poly(IC.ink, [29, 10, 33, 13, 29, 17]);
        poly(C.steel, [30, 11, 32, 13, 30, 15]);
        // wheels
        for (const wx of [7, 20]) {
          disc(wx, 25, 5.4, C.wood3);
          disc(wx, 25, 3.6, C.wood2);
          P(IC.ink2, wx - 1, 19, 1, 11);
          P(IC.ink2, wx - 5, 24, 11, 1);
          disc(wx, 25, 1.4, C.steel2);
        }
        break;
      }
      case 'crop': {
        // soil bed
        P(IC.ink, 1, 20, 30, 11);
        P('#5b4029', 2, 21, 28, 9);
        for (let i = 0; i < 3; i++) {
          P('#7d5a3a', 2, 22 + i * 3, 28, 1);
          P('#3a2618', 2, 24 + i * 3, 28, 1);
        }
        // leafy plant: stem + paired leaves
        const plant = (x, base, s) => {
          P(IC.ink, x - 1, base - s, 3, s + 1);
          P('#4f9d43', x, base - s, 1, s);
          for (let i = 0; i < 3; i++) {
            const y = base - s + 2 + i * 4;
            poly(IC.ink, [x - 6, y - 2, x - 1, y, x - 1, y + 3, x - 5, y + 2]);
            poly('#68bd50', [x - 4, y - 1, x - 2, y + 1, x - 3, y + 1]);
            poly(IC.ink, [x + 2, y, x + 6, y - 3, x + 6, y + 1, x + 2, y + 3]);
            poly('#4f9d43', [x + 2, y + 1, x + 5, y - 1, x + 4, y + 1]);
          }
          P(IC.ink, x - 1, base - s - 2, 4, 4);
          P('#e9c352', x, base - s - 1, 2, 2);
        };
        plant(8, 21, 12);
        plant(24, 21, 9);
        plant(16, 21, 16);
        break;
      }
      case 'house': {
        // timber hall: roof, wall, door, beam
        poly(IC.ink, [16, 1, 31, 14, 1, 14]);
        poly(C.roof, [16, 3, 29, 13, 3, 13]);
        poly(C.roof2, [16, 3, 29, 13, 16, 13]);
        P(tint(C.roof, 0.25), 12, 6, 4, 2);
        P(IC.ink, 4, 14, 24, 16);
        P(C.wood2, 5, 15, 22, 14);
        P(tint(C.wood2, 0.18), 5, 15, 7, 13);
        for (let i = 0; i < 3; i++) P(C.wood3, 5, 18 + i * 4, 22, 1);
        P(IC.ink, 13, 20, 8, 9);
        P(C.wood3, 14, 21, 6, 8);
        P(C.gold, 18, 25, 1, 1);
        break;
      }
      case 'tower': {
        // stone tower with crenellations + banner
        P(IC.ink, 9, 10, 14, 20);
        P(C.stone2, 10, 11, 12, 18);
        P(tint(C.stone, 0.18), 10, 11, 4, 17);
        P(C.stone3, 20, 11, 2, 17);
        for (let i = 0; i < 4; i++) P(C.stone3, 10, 14 + i * 4, 12, 1);
        // battlements
        for (let i = 0; i < 3; i++) {
          P(IC.ink, 8 + i * 6, 5, 5, 6);
          P(C.stone, 9 + i * 6, 6, 3, 4);
        }
        P(IC.ink, 8, 9, 17, 3);
        P(C.stone, 9, 9, 15, 2);
        // slit + flag
        P(IC.ink, 14, 17, 4, 7);
        P(IC.ink2, 15, 18, 2, 5);
        P(IC.ink, 23, 2, 2, 9);
        P(c, 24, 3, 6, 4);
        P(ac, 25, 4, 3, 2);
        break;
      }
      case 'tools': {
        // pick: handle lower-left to upper-right
        ln(7, 30, 24, 9, 3.4, C.wood2, tint(C.wood2, 0.4));
        // pick head: arc across the top right
        if (ctxRef) {
          ctxRef.lineCap = 'round';
          ctxRef.strokeStyle = IC.ink; ctxRef.lineWidth = 7;
          ctxRef.beginPath(); ctxRef.arc(25, 12, 8, -2.5, -0.5); ctxRef.stroke();
          ctxRef.strokeStyle = C.steel2; ctxRef.lineWidth = 5;
          ctxRef.beginPath(); ctxRef.arc(25, 12, 8, -2.45, -0.55); ctxRef.stroke();
          ctxRef.strokeStyle = C.steel; ctxRef.lineWidth = 2;
          ctxRef.beginPath(); ctxRef.arc(25, 12, 9.4, -2.3, -0.7); ctxRef.stroke();
        }
        // hammer: handle lower-right to upper-left
        ln(27, 30, 11, 12, 3.4, C.wood3, tint(C.wood3, 0.45));
        // hammer head
        poly(IC.ink, [1, 4, 15, 2, 16, 12, 2, 15]);
        poly(C.steel2, [3, 5, 14, 4, 15, 11, 3, 13]);
        poly(C.steel, [3, 5, 14, 4, 14, 7, 3, 8]);
        P('#ffffff', 4, 5, 6, 1);
        P(C.steel3, 3, 11, 10, 1);
        break;
      }
      case 'plate': {
        // chest armour with rivets and a pauldron highlight
        poly(IC.ink, [16, 4, 27, 8, 25, 24, 16, 29, 7, 24, 5, 8]);
        poly(C.steel2, [16, 6, 25, 9, 23, 22, 16, 26, 9, 22, 7, 9]);
        poly(C.steel, [16, 6, 21, 8, 20, 21, 16, 25, 12, 21, 11, 8]);
        poly(tint(C.steel, 0.4), [14, 7, 18, 8, 17, 17, 14, 16]);
        P(C.steel3, 16, 12, 1, 13);
        P(C.steel3, 9, 18, 14, 1);
        P(ac, 13, 9, 2, 2);
        P(ac, 18, 9, 2, 2);
        P(c2, 15, 20, 4, 3);
        break;
      }
      case 'fletch': {
        // shaft on the diagonal, nock at the lower left
        ln(7, 29, 26, 8, 2.6, C.wood2, tint(C.wood2, 0.5));
        // broadhead
        poly(IC.ink, [23, 1, 31, 3, 30, 9, 24, 10]);
        poly(C.steel, [25, 3, 29, 4, 28, 7, 25, 8]);
        P('#ffffff', 26, 4, 1, 2);
        // one clean swept vane, angled back from the nock
        poly(IC.ink, [6, 24, 18, 22, 14, 30, 4, 29]);
        poly('#f3ece2', [8, 24, 16, 23, 13, 28, 6, 28]);
        poly('#cfc6b4', [8, 26, 15, 25, 13, 28, 7, 28]);
        P('#ffffff', 9, 24, 5, 1);
        break;
      }
      case 'upgrade': {
        poly(IC.ink, [16, 1, 30, 15, 22, 15, 22, 21, 10, 21, 10, 15, 2, 15]);
        poly('#8ce87a', [16, 4, 27, 14, 20, 14, 20, 20, 12, 20, 12, 14, 5, 14]);
        poly('#c9ffb8', [16, 6, 21, 11, 16, 11]);
        // second chevron below, smaller: "level up"
        poly(IC.ink, [16, 20, 27, 30, 5, 30]);
        poly('#5fc44e', [16, 23, 24, 29, 8, 29]);
        poly('#8ce87a', [16, 23, 20, 27, 16, 27]);
        break;
      }
      case 'rally': {
        // banner on a pole, cloth waving
        P(IC.ink, 7, 2, 4, 28);
        P(C.wood2, 8, 3, 2, 26);
        P(tint(C.wood2, 0.3), 8, 3, 1, 26);
        P(IC.ink, 10, 4, 19, 13);
        poly('#e2554f', [11, 5, 27, 7, 24, 11, 27, 15, 11, 15]);
        P('#ff8a86', 12, 6, 8, 3);
        poly('#a82f2c', [20, 6, 27, 7, 24, 11, 27, 15, 20, 15]);
        P('#ffe9a8', 15, 8, 4, 4);
        P(IC.ink, 4, 28, 10, 3);
        P(C.steel2, 5, 29, 8, 1);
        break;
      }
      case 'meteor': {
        // flaming rock falling to the lower left
        poly(IC.ink, [13, 15, 20, 7, 29, 11, 30, 21, 22, 27, 14, 23]);
        poly('#8a5a3c', [15, 16, 20, 9, 27, 12, 28, 20, 21, 25, 16, 22]);
        poly('#b8825a', [16, 16, 20, 11, 23, 13, 21, 18, 17, 19]);
        P('#5b3a26', 23, 19, 3, 3);
        P('#5b3a26', 18, 21, 2, 2);
        // trail
        poly('#ff8a3c', [12, 17, 4, 29, 13, 24]);
        poly('#ffd36e', [12, 18, 8, 26, 14, 23]);
        P('#fff0b0', 12, 20, 3, 3);
        P('#ffd36e', 19, 3, 2, 3);
        P('#ff8a3c', 25, 6, 2, 2);
        break;
      }
      case 'spore': {
        // stem
        P(IC.ink, 12, 15, 10, 15);
        P('#d8e8c0', 13, 16, 8, 13);
        P('#f4ffe8', 13, 16, 3, 12);
        P('#a8c48a', 19, 16, 2, 13);
        // dome cap
        poly(IC.ink, [3, 17, 6, 8, 16, 4, 26, 8, 29, 17]);
        poly('#8ac95a', [5, 16, 7, 9, 16, 6, 25, 9, 27, 16]);
        poly('#b6e884', [6, 15, 8, 10, 16, 7, 21, 9, 19, 15]);
        P('#eaffd0', 9, 9, 4, 3);
        // spots
        P('#5a8a3a', 12, 13, 4, 3);
        P('#5a8a3a', 21, 11, 3, 3);
        P('#4a7a2e', 18, 15, 3, 2);
        // gills
        P('#6f9a52', 6, 17, 21, 2);
        // drifting spores
        const dots = [[3, 4], [27, 3], [22, 27], [5, 26], [30, 21]];
        dots.forEach(([dx, dy], i) => {
          P(IC.ink, dx - 1, dy - 1, 4, 4);
          P(i % 2 ? '#9be36a' : '#d8ffb0', dx, dy, 2, 2);
        });
        break;
      }
      case 'burrow': {
        // dug hole with a mound of earth
        poly(IC.ink, [2, 27, 8, 18, 16, 15, 24, 18, 30, 27]);
        poly('#6b543c', [4, 27, 9, 20, 16, 17, 23, 20, 28, 27]);
        poly('#8a6e4e', [6, 24, 10, 19, 16, 18, 20, 21]);
        poly(IC.ink, [11, 27, 14, 21, 21, 21, 24, 27]);
        P('#241a14', 12, 27, 11, 3);
        P('#0f0a08', 14, 26, 7, 2);
        // claws
        P('#d8d0c0', 8, 22, 2, 2);
        P('#d8d0c0', 22, 22, 2, 2);
        P(C.red, 17, 12, 2, 2);
        break;
      }
      /* ---- chrome icons: these replace emoji glyphs in the HUD, which
              render as tofu boxes on some Android builds ---- */
      case 'menu': {
        P(IC.ink, 4, 7, 25, 6);
        P(IC.white, 5, 8, 23, 4);
        P(C.steel2, 5, 10, 23, 2);
        P(IC.ink, 4, 14, 25, 6);
        P(IC.white, 5, 15, 23, 4);
        P(C.steel2, 5, 17, 23, 2);
        P(IC.ink, 4, 21, 25, 6);
        P(IC.white, 5, 22, 23, 4);
        P(C.steel2, 5, 24, 23, 2);
        break;
      }
      case 'help': {
        // a standalone gold question mark: no plate, reads at 16 px
        const G = '#f5c542', H = '#fff2b0', K = IC.ink;
        P(K, 10, 2, 13, 3);
        P(K, 8, 4, 4, 9);
        P(K, 21, 4, 4, 7);
        P(K, 15, 8, 8, 4);
        P(K, 13, 11, 5, 4);
        P(K, 13, 14, 7, 4);
        P(K, 12, 17, 7, 3);
        P(K, 15, 19, 5, 3);
        P(K, 13, 23, 7, 7);
        P(G, 11, 3, 11, 2);
        P(G, 9, 5, 2, 7);
        P(G, 22, 5, 2, 5);
        P(G, 16, 9, 6, 2);
        P(G, 14, 11, 3, 3);
        P(G, 14, 15, 5, 3);
        P(G, 13, 18, 5, 2);
        P(G, 14, 24, 5, 5);
        P(H, 11, 3, 8, 1);
        P(H, 9, 5, 1, 4);
        P(H, 14, 24, 3, 1);
        break;
      }
      case 'pause': {
        P(IC.ink, 7, 5, 8, 22);
        P(IC.white, 8, 6, 6, 20);
        P(C.steel2, 12, 6, 2, 20);
        P(IC.ink, 18, 5, 8, 22);
        P(IC.white, 19, 6, 6, 20);
        P(C.steel2, 23, 6, 2, 20);
        break;
      }
      case 'army': {
        ln(8, 25, 24, 7, 3, C.steel, C.white);
        ln(24, 25, 8, 7, 3, C.steel2, C.steel);
        // pommels only: extra crossguards read as a third blade at small sizes
        disc(7, 27, 2.2, C.gold);
        disc(25, 27, 2.2, C.gold);
        P('#fff2b0', 6, 26, 1, 1);
        P('#fff2b0', 24, 26, 1, 1);
        break;
      }
      case 'worker': {
        // a full peasant sprite reads far better than a lone pick at 18 px
        const art = UNIT_ART.worker;
        if (art) {
          ctx.save();
          ctx.translate(16, 28);
          ctx.scale(0.92, 0.92);
          art(ctx, fac || RTS.FACTIONS[0], { moving: false, walk: 0.2, t: 0, attacking: false, carry: false });
          ctx.restore();
        } else {
          ln(8, 27, 22, 12, 3, C.wood2, tint(C.wood2, 0.4));
        }
        break;
      }
      case 'base': {
        P(IC.ink, 9, 9, 15, 21);
        P(C.stone2, 10, 10, 13, 19);
        P(tint(C.stone, 0.2), 10, 10, 4, 18);
        for (let i = 0; i < 5; i++) P(C.stone3, 10, 13 + i * 3, 13, 1);
        for (let i = 0; i < 3; i++) {
          P(IC.ink, 8 + i * 6, 4, 5, 5);
          P(C.stone, 9 + i * 6, 5, 3, 3);
        }
        P(IC.ink, 12, 17, 9, 9);
        P(C.wood3, 13, 18, 7, 8);
        P(C.gold, 18, 22, 1, 1);
        break;
      }
      case 'stop': {
        P(IC.ink, 6, 6, 21, 21);
        P('#d8443c', 7, 7, 19, 19);
        P('#ff8a80', 7, 7, 19, 3);
        P('#ff8a80', 7, 7, 3, 19);
        P('#8e2a22', 23, 7, 3, 19);
        P('#8e2a22', 7, 23, 19, 3);
        break;
      }
      case 'cancel': {
        P(IC.ink, 5, 5, 23, 23);
        P('#d8443c', 6, 6, 21, 21);
        P('#ff8a80', 6, 6, 21, 2);
        ln(10, 10, 23, 23, 3.4, '#fdf0ee', '#ffffff');
        ln(23, 10, 10, 23, 3.4, '#fdf0ee', '#ffffff');
        break;
      }
      case 'sound': {
        poly(IC.ink, [3, 12, 9, 12, 16, 5, 16, 27, 9, 20, 3, 20]);
        poly(C.white, [4, 13, 9, 13, 14, 7, 14, 25, 9, 19, 4, 19]);
        P(C.steel2, 12, 13, 2, 6);
        if (ctxRef) {
          ctxRef.strokeStyle = IC.ink; ctxRef.lineWidth = 4;
          ctxRef.beginPath(); ctxRef.arc(16, 16, 9, -0.9, 0.9); ctxRef.stroke();
          ctxRef.strokeStyle = C.aether; ctxRef.lineWidth = 2.4;
          ctxRef.beginPath(); ctxRef.arc(16, 16, 9, -0.85, 0.85); ctxRef.stroke();
          ctxRef.beginPath(); ctxRef.arc(16, 16, 14, -0.7, 0.7); ctxRef.stroke();
        }
        break;
      }
      case 'garlic': {
        /* The namesake: a wide three-lobed bulb, pointed neck, green sprout.
           Rows are authored explicitly because a polygon this squat comes out
           ragged at 32 px. */
        if (fac) {
          if (ctxRef) {
            ctxRef.fillStyle = tint(fac.color2, -0.42);
            ctxRef.beginPath(); ctxRef.arc(16, 17, 15.2, 0, Math.PI * 2); ctxRef.fill();
            ctxRef.fillStyle = tint(fac.color, 0.12);
            ctxRef.beginPath(); ctxRef.arc(16, 17, 13.8, 0, Math.PI * 2); ctxRef.fill();
            ctxRef.fillStyle = 'rgba(12,9,20,0.46)';
            ctxRef.beginPath(); ctxRef.arc(16, 17, 12.8, 0, Math.PI * 2); ctxRef.fill();
          }
        }
        // [y, left, right] — bulges at the three lobes, pinches at the neck
        const ROWS = [
          [5, 13, 19], [6, 12, 20], [7, 11, 21], [8, 10, 22], [9, 9, 23],
          [10, 8, 24], [11, 7, 25], [12, 6, 26], [13, 5, 27], [14, 5, 27],
          [15, 4, 28], [16, 4, 28], [17, 4, 28], [18, 4, 28], [19, 5, 27],
          [20, 5, 27], [21, 5, 27], [22, 6, 26], [23, 6, 26], [24, 7, 25],
          [25, 9, 23], [26, 11, 21],
        ];
        // ink silhouette one pixel wider than the fill
        for (const [y, l, r] of ROWS) P(IC.ink, l - 1, y, r - l + 3, 1);
        for (const [y, l, r] of ROWS) {
          P('#e2d6bc', l, y, r - l + 1, 1);
          // lit left third, shaded right third
          P('#fdf9ee', l, y, Math.max(1, Math.round((r - l) * 0.34)), 1);
          P('#c9bb9e', l + Math.round((r - l) * 0.72), y, Math.max(1, r - l - Math.round((r - l) * 0.72)), 1);
        }
        // centre lobe: a bright column with an ink seam either side
        for (let y = 8; y <= 25; y++) {
          P('#ffffff', 15, y, 3, 1);
        }
        P('#b8a888', 14, 10, 1, 15);
        P('#b8a888', 18, 10, 1, 15);
        P('#a89878', 11, 14, 1, 10);
        P('#a89878', 21, 14, 1, 10);
        P('#ffffff', 7, 15, 1, 5);
        // neck + sprout
        P(IC.ink, 13, 3, 7, 3);
        P('#cfc2a6', 14, 4, 5, 2);
        ln(16, 5, 15, 0, 2.2, '#6aa84f', '#a8d98a');
        poly('#8ac95a', [16, 3, 23, 0, 21, 4]);
        poly('#5f9a46', [14, 4, 8, 2, 11, 6]);
        break;
      }
      default:
        P(IC.ink, 7, 7, 18, 18);
        P(c, 8, 8, 16, 16);
        P(ac, 12, 12, 8, 8);
    }
    ctx.restore();
  };
})();
