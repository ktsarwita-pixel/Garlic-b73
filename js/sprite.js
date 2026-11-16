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
  function legs(walk, dark, light) {
    const a = Math.sin(walk * 11);
    const l1 = Math.round(a * 1.6), l2 = -l1;
    P(dark, -4 + l1, -5, 3, 5);
    P(light, 1 + l2, -5, 3, 5);
  }

  function shadow(w, h) {
    ctxRef.fillStyle = 'rgba(12,8,20,0.28)';
    ctxRef.beginPath();
    ctxRef.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctxRef.fill();
  }

  const UNIT_ART = {
    worker(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2;
      const walk = o.moving ? o.walk : 0;
      shadow(7, 2.5);
      legs(walk, C.wood2, C.wood);
      // body
      P(C.line, -5, -12, 11, 9);
      P(c, -4, -11, 9, 7);
      P(c2, -4, -11, 9, 2);
      P(C.straw2, -4, -6, 9, 2); // belt
      // head
      P(C.line, -4, -18, 9, 7);
      P(C.skin, -3, -17, 7, 5);
      P(C.skin2, -3, -13, 7, 1);
      P(C.line2, 2, -16, 1, 1); // eye
      // straw hat
      P(C.line, -7, -20, 15, 3);
      P(C.straw, -6, -20, 13, 2);
      P(C.straw2, -6, -18, 13, 1);
      // arms + tool
      const sw = o.attacking ? Math.sin(o.t * 14) * 2 : 0;
      P(C.skin, -6, -10, 2, 5);
      P(C.skin, 4, -10 + sw, 2, 5);
      P(C.wood3, 5, -16 + sw, 2, 8);
      P(C.steel2, 3, -17 + sw, 6, 2);
      if (o.carry) {
        P(C.wood, -9, -15, 4, 4);
        P(C.wood3, -9, -15, 4, 1);
      }
    },
    soldier(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      const walk = o.moving ? o.walk : 0;
      shadow(9, 2.6);
      legs(walk, C.steel3, C.steel2);
      // torso armour (squat, readable)
      P(C.line, -7, -13, 15, 9);
      P(C.steel, -6, -12, 13, 7);
      P(c, -6, -9, 13, 3);
      P(ac, -6, -9, 13, 1);
      P(C.steel2, -6, -12, 13, 1);
      // head + helmet
      P(C.line, -4, -19, 9, 6);
      P(C.skin, -3, -18, 7, 3);
      P(C.line2, 2, -18, 1, 1);
      P(C.steel, -5, -21, 11, 3);
      P(C.steel2, -5, -19, 11, 1);
      P(c, -1, -23, 2, 2);
      // sword
      const sw = o.attacking ? Math.sin(o.t * 16) * 4 : 0;
      P(C.wood3, 4, -11 + sw, 2, 3);
      P(C.steel, 4, -19 + sw, 2, 8);
      P(C.white, 5, -19 + sw, 1, 7);
      // shield
      P(C.line, -10, -13, 5, 8);
      P(c, -9, -12, 3, 6);
      P(ac, -9, -12, 3, 1);
    },
    archer(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      const walk = o.moving ? o.walk : 0;
      shadow(8, 2.5);
      legs(walk, C.wood3, C.wood2);
      // cloak/body
      P(C.line, -6, -13, 12, 9);
      P(c, -5, -12, 10, 6);
      P(c2, -5, -12, 10, 2);
      P(C.wood2, -5, -6, 10, 2);
      // hood
      P(C.line, -5, -19, 11, 7);
      P(c2, -4, -18, 9, 5);
      P(C.skin, -2, -17, 5, 3);
      P(C.line2, 2, -16, 1, 1);
      P(ac, -4, -15, 2, 1);
      // bow
      const draw = o.attacking ? Math.abs(Math.sin(o.t * 9)) : 0;
      P(C.wood3, -9, -16, 1, 9);
      P(C.wood, -10, -17, 1, 2);
      P(C.wood, -10, -9, 1, 2);
      P(C.bone, -9 + draw * 2, -15, 1, 7);
      // quiver
      P(C.wood2, 4, -13, 3, 6);
      P(C.white, 4, -16, 1, 3);
      P(C.white, 6, -16, 1, 3);
    },
    knight(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      const walk = o.moving ? o.walk : 0;
      shadow(12, 3.4);
      // horse body
      P(C.line, -11, -13, 22, 10);
      P(c2, -10, -12, 20, 7);
      P(tint(c2, -0.25), -10, -8, 20, 3);
      // legs
      const a = Math.sin(walk * 12) * 2.2;
      P(C.line2, -8 + a, -4, 3, 4);
      P(C.line2, -3 - a, -4, 3, 4);
      P(C.line2, 2 + a, -4, 3, 4);
      P(C.line2, 7 - a, -4, 3, 4);
      // neck + head
      P(C.line, 7, -19, 7, 8);
      P(c2, 8, -18, 5, 6);
      P(C.line, 9, -23, 6, 5);
      P(c2, 10, -22, 4, 3);
      P(C.black, 12, -21, 1, 1);
      P(ac, 8, -16, 2, 2); // barding
      // tail
      P(C.line2, -13, -12, 3, 6);
      // rider
      P(C.line, -3, -22, 8, 10);
      P(C.steel, -2, -21, 6, 8);
      P(c, -2, -18, 6, 3);
      P(C.skin, -1, -26, 5, 4);
      P(C.steel, -2, -28, 7, 3);
      P(c, 1, -31, 2, 3);
      // lance
      const lu = o.attacking ? 4 : 0;
      P(C.wood2, 6 + lu, -26, 2, 16);
      P(C.steel, 6 + lu, -31, 2, 5);
      P(C.white, 7 + lu, -31, 1, 4);
      P(c, 5 + lu, -18, 4, 2);
    },
    siege(ctx, fac, o) {
      const c = fac.color, c2 = fac.color2;
      const bounce = o.moving ? Math.sin(o.walk * 14) * 0.6 : 0;
      shadow(13, 3.4);
      // wheels
      for (const wx of [-8, 6]) {
        P(C.line, wx, -8, 8, 8);
        P(C.wood2, wx + 1, -7, 6, 6);
        P(C.wood3, wx + 3, -5, 2, 2);
      }
      // frame
      P(C.line, -11, -18 + bounce, 22, 11);
      P(C.wood, -10, -17 + bounce, 20, 8);
      P(C.wood2, -10, -12 + bounce, 20, 3);
      P(C.wood3, -10, -17 + bounce, 20, 1);
      // ram log + head
      P(C.line2, 3, -15 + bounce, 10, 5);
      P(C.wood3, 4, -14 + bounce, 8, 3);
      P(C.steel3, 11, -16 + bounce, 3, 7);
      P(c, -8, -16 + bounce, 4, 6);
      // crew
      P(C.line, -2, -24 + bounce, 6, 7);
      P(c, -1, -23 + bounce, 4, 4);
      P(C.skin, 0, -27 + bounce, 4, 3);
      P(C.straw, 0, -28 + bounce, 5, 2);
    },
  };

  RTS.drawUnitSprite = function (ctx, type, fac, x, y, o) {
    ctxRef = ctx;
    ctx.save();
    ctx.translate(x, y);
    const s = o.scale || 1;
    if (s !== 1) ctx.scale(s, s);
    const art = UNIT_ART[type] || UNIT_ART.soldier;
    art(ctx, fac, o);
    ctx.restore();
  };

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
      // main hall
      stoneChunk(-w / 2, -h + 10, w, h - 10);
      P(c2, -w / 2 + 2, -h + 12, w - 4, 4);
      // battlements
      for (let i = 0; i < 4; i++) {
        P(C.line, -w / 2 + i * 11, -h + 6, 8, 6);
        P(C.stone, -w / 2 + 1 + i * 11, -h + 7, 6, 4);
      }
      // door
      P(C.line, -6, -14, 12, 14);
      poly(C.wood2, [-5, 0, -5, -10, 0, -14, 5, -10, 5, 0]);
      P(C.wood, -4, -9, 9, 9);
      P(C.gold, -1, -7, 2, 2);
      // windows
      for (const wx of [-16, 12]) {
        P(C.line, wx - 1, -30, 6, 8);
        P(C.black, wx, -29, 4, 6);
        P(i2(t) ? ac : '#f7e08a', wx, -29, 4, 3);
      }
      // tower
      P(C.line, -14, -h - 12, 20, 22);
      P(C.stone2, -13, -h - 11, 18, 20);
      P(C.stone, -13, -h - 11, 18, 6);
      for (let i = 0; i < 3; i++) {
        P(C.line, -14 + i * 7, -h - 16, 5, 5);
        P(C.stone, -13 + i * 7, -h - 15, 3, 3);
      }
      // roof
      P(C.line, -16, -h - 18, 24, 3);
      poly(C.line, [-15, -h - 18, 8, -h - 18, -4, -h - 30]);
      poly(C.roof, [-13, -h - 19, 6, -h - 19, -4, -h - 27]);
      poly(C.roof2, [-4, -h - 27, 2, -h - 22, -4, -h - 19]);
      banner(w / 2 - 4, -h - 6, fac);
    },
    farm(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2;
      // fence
      P(C.wood3, -w / 2, -16, w, 2);
      for (let i = 0; i < 4; i++) P(C.wood2, -w / 2 + 2 + i * 7, -20, 2, 6);
      P(C.wood2, -w / 2, -14, w, 1);
      // tilled soil
      P(C.line, -w / 2 + 1, -13, w - 2, 13);
      P('#5b4029', -w / 2 + 2, -12, w - 4, 11);
      for (let i = 0; i < 4; i++) P('#6f4f33', -w / 2 + 3, -11 + i * 3, w - 6, 1);
      // wheat rows
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 7; i++) {
          const cx = -w / 2 + 4 + i * 3;
          const cy = -10 + row * 3;
          const sway = Math.sin(t * 1.8 + i * 0.7 + row) * 0.7;
          P('#8a6b28', cx + sway, cy, 1, 2);
          P(i % 2 ? '#e8c15a' : '#dcb957', cx + sway, cy - 1, 1, 1);
        }
      }
      // little hut on the right
      P(C.line, w / 2 - 13, -22, 12, 12);
      P(C.wood2, w / 2 - 12, -21, 10, 10);
      P(C.wood3, w / 2 - 12, -21, 10, 1);
      poly(C.line, [w / 2 - 14, -21, w / 2 + 1, -21, w / 2 - 6, -28]);
      poly(C.roof, [w / 2 - 12, -22, w / 2 - 1, -22, w / 2 - 6, -27]);
      P(C.wood3, w / 2 - 8, -15, 3, 4);
      P(c, w / 2 - 11, -25, 4, 3);
      P(c2, w / 2 - 11, -25, 4, 1);
      // scarecrow
      P(C.wood3, -w / 2 + 5, -26, 2, 12);
      P(C.wood3, -w / 2 + 2, -23, 8, 2);
      P(C.straw, -w / 2 + 3, -22, 6, 4);
      P(C.straw2, -w / 2 + 3, -20, 6, 1);
      P(C.straw, -w / 2 + 2, -28, 8, 3);
      P(C.line2, -w / 2 + 4, -24, 1, 1);
    },
    barracks(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2, ac = fac.accent;
      P(C.line, -w / 2, -h + 8, w, h - 8);
      P(C.wood2, -w / 2 + 1, -h + 9, w - 2, h - 9);
      for (let i = 0; i < 4; i++) P(C.wood3, -w / 2 + 2, -h + 12 + i * 5, w - 4, 1);
      // roof
      poly(C.line, [-w / 2 - 2, -h + 10, w / 2 + 2, -h + 10, w / 2 - 2, -h - 6, -w / 2 + 2, -h - 6]);
      poly(C.roof, [-w / 2, -h + 9, w / 2, -h + 9, w / 2 - 3, -h - 5, -w / 2 + 3, -h - 5]);
      poly(C.roof2, [-w / 2, -h + 9, w / 2, -h + 9, w / 2 - 1, -h + 6, -w / 2 + 1, -h + 6]);
      // door
      P(C.line, -5, -12, 10, 12);
      P(C.wood3, -4, -11, 8, 11);
      P(C.wood, -4, -11, 8, 2);
      // weapon rack
      P(C.steel, -w / 2 + 3, -20, 2, 10);
      P(C.steel2, -w / 2 + 7, -19, 2, 9);
      P(C.steel, -w / 2 + 11, -20, 2, 10);
      P(C.wood2, -w / 2 + 2, -12, 13, 2);
      // banner
      P(C.wood3, w / 2 - 8, -h - 4, 2, 14);
      P(c, w / 2 - 6, -h - 3, 8, 8);
      P(ac, w / 2 - 4, -h - 1, 4, 4);
      poly(C.line, [w / 2 - 6, -h + 5, w / 2 + 2, -h + 5, w / 2 - 2, -h + 8]);
      poly(c, [w / 2 - 6, -h + 5, w / 2 + 1, -h + 5, w / 2 - 2, -h + 7]);
    },
    tower(ctx, fac, w, h, prog, t) {
      const c = fac.color, ac = fac.accent;
      P(C.line, -w / 2, -h + 6, w, h - 6);
      P(C.stone2, -w / 2 + 1, -h + 7, w - 2, h - 7);
      P(C.stone, -w / 2 + 1, -h + 7, w - 2, 5);
      P(C.stone3, -w / 2 + 1, -h + 18, w - 2, 1);
      P(C.stone3, -w / 2 + 1, -h + 28, w - 2, 1);
      // top platform
      P(C.line, -w / 2 - 3, -h - 4, w + 6, 10);
      P(C.stone2, -w / 2 - 2, -h - 3, w + 4, 8);
      P(C.stone, -w / 2 - 2, -h - 3, w + 4, 2);
      for (let i = 0; i < 3; i++) {
        P(C.line, -w / 2 - 3 + i * 8, -h - 9, 6, 6);
        P(C.stone, -w / 2 - 2 + i * 8, -h - 8, 4, 4);
      }
      // arrow slit
      P(C.black, -1, -h + 12, 3, 7);
      // flag
      P(C.wood3, 3, -h - 20, 2, 12);
      P(c, 5, -h - 19, 8, 5);
      P(ac, 6, -h - 18, 4, 3);
    },
    workshop(ctx, fac, w, h, prog, t) {
      const c = fac.color, c2 = fac.color2;
      P(C.line, -w / 2, -h + 8, w, h - 8);
      stoneChunk(-w / 2, -h + 9, w, h - 9);
      // roof planks
      poly(C.line, [-w / 2 - 2, -h + 10, w / 2 + 2, -h + 10, w / 2 - 4, -h - 8, -w / 2 + 4, -h - 8]);
      poly(C.wood, [-w / 2, -h + 9, w / 2, -h + 9, w / 2 - 5, -h - 6, -w / 2 + 5, -h - 6]);
      for (let i = 0; i < 4; i++) P(C.wood2, -w / 2 + 3 + i * 6, -h - 5 + i * 3, w - 6 - i * 6, 1);
      // chimney + smoke
      P(C.line, 6, -h - 14, 7, 10);
      P(C.stone2, 7, -h - 13, 5, 9);
      for (let i = 0; i < 3; i++) {
        const p = (t * 0.5 + i * 0.33) % 1;
        ctxRef.fillStyle = 'rgba(210,205,215,' + (0.45 * (1 - p)).toFixed(2) + ')';
        const sz = 3 + p * 5;
        ctxRef.fillRect(9 - sz / 2 + Math.sin(p * 7) * 3, -h - 16 - p * 16, sz, sz);
      }
      // gear sign
      P(C.wood2, -w / 2 + 2, -h + 16, 9, 9);
      P(C.steel2, -w / 2 + 4, -h + 18, 5, 5);
      P(C.steel3, -w / 2 + 5, -h + 19, 3, 3);
      // door
      P(C.line, -5, -13, 11, 13);
      P(C.wood3, -4, -12, 9, 12);
      P(C.wood2, -4, -12, 9, 2);
      P(c, -4, -6, 9, 1);
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
  RTS.drawTree = function (ctx, x, y, seed, scale) {
    ctxRef = ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(12,8,20,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    P(C.wood3, -2, -12, 4, 12);
    P(C.wood2, -1, -12, 2, 11);
    const r = seed % 3;
    if (r === 0) {
      // pine
      poly(C.line, [-10, -10, 10, -10, 0, -34]);
      poly(C.leaf3, [-9, -11, 9, -11, 0, -32]);
      poly(C.leaf2, [-6, -16, 6, -16, 0, -31]);
      poly(C.leaf, [-3, -21, 3, -21, 0, -30]);
      P(C.leaf4, -2, -25, 2, 3);
    } else if (r === 1) {
      // broadleaf
      P(C.line, -9, -22, 18, 12);
      poly(C.line, [-11, -18, 11, -18, 0, -34]);
      P(C.leaf2, -8, -21, 16, 9);
      P(C.leaf, -6, -27, 12, 8);
      P(C.leaf4, -4, -30, 8, 5);
      P(C.leaf, 3, -25, 5, 5);
    } else {
      // bush cluster
      P(C.line, -8, -12, 16, 12);
      P(C.leaf2, -7, -11, 14, 10);
      P(C.leaf, -5, -15, 10, 8);
      P(C.leaf4, -2, -16, 5, 5);
      P(C.leaf3, 2, -9, 5, 6);
    }
    ctx.restore();
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

  /* icon painter for UI (canvas 2d) */
  RTS.drawIcon = function (ctx, name, size, fac) {
    ctxRef = ctx;
    ctx.save();
    ctx.clearRect(0, 0, size, size);
    const s = size / 32;
    ctx.scale(s, s);
    const c = fac ? fac.color : '#3f8fe0';
    const ac = fac ? fac.accent : '#a8dcff';
    switch (name) {
      case 'wood':
        P(C.wood3, 5, 12, 22, 8);
        P(C.wood, 6, 13, 20, 5);
        P(C.wood2, 6, 17, 20, 2);
        P(C.wood, 12, 8, 16, 7);
        P(C.wood2, 12, 13, 16, 2);
        break;
      case 'food':
        poly('#e8c15a', [16, 5, 26, 14, 16, 27, 6, 14]);
        poly('#c99a34', [16, 10, 22, 15, 16, 24, 10, 15]);
        P('#f6e39a', 13, 10, 6, 3);
        break;
      case 'favor':
        poly('#9fe8ff', [16, 4, 24, 16, 16, 28, 8, 16]);
        poly('#d8f7ff', [16, 9, 20, 16, 16, 24, 12, 16]);
        break;
      case 'rally':
        P(C.wood3, 9, 4, 3, 24);
        poly('#e94f5c', [12, 6, 27, 11, 12, 16]);
        poly('#ff8a92', [13, 8, 22, 11, 13, 14]);
        break;
      case 'meteor':
        poly('#ff8a3c', [20, 4, 27, 12, 20, 20, 13, 12]);
        poly('#ffd36e', [20, 8, 24, 12, 20, 17, 16, 12]);
        P('#fff0b0', 19, 11, 3, 3);
        P('#8a5a3c', 5, 22, 6, 4);
        break;
      case 'spore':
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          P('#9be36a', 16 + Math.cos(a) * 9, 16 + Math.sin(a) * 9, 3, 3);
        }
        P('#c8f79a', 13, 13, 6, 6);
        break;
      case 'burrow':
        P('#4a3a2a', 4, 16, 24, 10);
        P('#6b543c', 8, 12, 16, 9);
        P('#2a1f18', 12, 15, 8, 6);
        break;
      case 'tools':
        P(C.wood3, 6, 8, 3, 18);
        P(C.steel2, 9, 6, 10, 6);
        P(C.steel, 9, 7, 9, 3);
        break;
      case 'plate':
        poly(C.steel, [16, 5, 26, 11, 22, 26, 16, 29, 10, 26, 6, 11]);
        poly(C.steel2, [16, 9, 22, 13, 19, 24, 16, 26]);
        break;
      case 'fletch':
        P(C.wood3, 5, 24, 3, 3);
        P(C.white, 8, 20, 16, 2);
        P(C.white, 22, 16, 4, 4);
        break;
      case 'crop':
        P('#5b4029', 6, 22, 20, 6);
        P('#8fc24a', 10, 12, 2, 10);
        P('#68bd50', 15, 9, 2, 13);
        P('#8fc24a', 20, 12, 2, 10);
        P('#e8c15a', 13, 12, 2, 3);
        break;
      case 'upgrade':
        poly('#f5c542', [16, 5, 20, 13, 27, 15, 21, 20, 23, 28, 16, 24, 9, 28, 11, 20, 5, 15, 12, 13]);
        break;
      case 'sword':
        P(C.steel, 14, 6, 4, 16);
        P(C.white, 15, 6, 1, 14);
        P(C.gold, 9, 22, 14, 3);
        P(C.wood3, 14, 25, 4, 4);
        break;
      case 'bow':
        P(C.wood3, 10, 5, 2, 22);
        P(C.wood, 9, 4, 2, 4);
        P(C.wood, 9, 24, 2, 4);
        P(C.white, 11, 6, 1, 20);
        break;
      case 'horse':
        P(C.steel2, 6, 14, 18, 9);
        P(C.steel2, 20, 6, 6, 10);
        P(C.steel, 21, 4, 7, 5);
        P('#2c2038', 10, 23, 3, 5);
        P('#2c2038', 18, 23, 3, 5);
        break;
      case 'ram':
        P(C.wood, 6, 14, 18, 7);
        P(C.steel3, 22, 12, 4, 11);
        P(C.wood3, 9, 21, 7, 7);
        break;
      case 'pop':
        P(C.skin, 12, 6, 8, 8);
        P(C.line, 12, 4, 8, 2);
        P(c, 9, 15, 14, 9);
        break;
      case 'enemy':
        P('#c8323f', 14, 6, 4, 8);
        P('#c8323f', 10, 10, 12, 4);
        P('#e8b78d', 12, 16, 8, 8);
        break;
      case 'tower':
        P(C.stone2, 11, 10, 10, 18);
        P(C.stone, 9, 6, 14, 5);
        P('#c8323f', 14, 2, 2, 5);
        break;
      case 'house':
        poly(C.roof, [16, 4, 28, 15, 4, 15]);
        P(C.wood2, 8, 15, 16, 13);
        break;
      default:
        P(c, 8, 8, 16, 16);
        P(ac, 12, 12, 8, 8);
    }
    ctx.restore();
  };
})();
