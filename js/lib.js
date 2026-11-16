/* GARLIC WARS - core utilities (no DOM dependencies) */
(function () {
  'use strict';
  const RTS = (window.RTS = window.RTS || {});

  RTS.TILE = 16;
  RTS.MAP_W = 80;
  RTS.MAP_H = 80;
  RTS.WORLD_W = RTS.MAP_W * RTS.TILE;
  RTS.WORLD_H = RTS.MAP_H * RTS.TILE;

  const U = (RTS.util = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist2 = (ax, ay, bx, by) => {
    const dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy;
  };
  U.dist = (ax, ay, bx, by) => Math.sqrt(U.dist2(ax, ay, bx, by));
  U.sign = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);

  /* deterministic PRNG */
  U.mulberry32 = function (a) {
    let s = a >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.hash2 = (x, y, s) => {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };

  U.noise2 = (x, y, s) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const n00 = U.hash2(x0, y0, s);
    const n10 = U.hash2(x0 + 1, y0, s);
    const n01 = U.hash2(x0, y0 + 1, s);
    const n11 = U.hash2(x0 + 1, y0 + 1, s);
    return U.lerp(U.lerp(n00, n10, sx), U.lerp(n01, n11, sx), sy);
  };

  U.fbm = (x, y, s, oct) => {
    let v = 0, amp = 1, f = 1, tot = 0;
    for (let i = 0; i < oct; i++) {
      v += U.noise2(x * f, y * f, s + i * 131) * amp;
      tot += amp;
      amp *= 0.5;
      f *= 2;
    }
    return v / tot;
  };

  U.pick = (arr, rnd) => arr[(rnd() * arr.length) | 0];

  /* ---------- tiny synth sound effects ---------- */
  const Sound = (RTS.sound = {
    ctx: null,
    muted: false,
    init() {
      if (this.ctx) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    },
    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    blip(freq, dur, type, gain, slide) {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain == null ? 0.06 : gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    noise(dur, gain, freq) {
      if (this.muted || !this.ctx) return;
      const ctx = this.ctx;
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq || 900;
      const g = ctx.createGain();
      g.gain.value = gain == null ? 0.05 : gain;
      src.connect(f).connect(g).connect(ctx.destination);
      src.start();
    },
    play(name) {
      if (this.muted) return;
      switch (name) {
        case 'click': this.blip(660, 0.05, 'square', 0.03); break;
        case 'select': this.blip(520, 0.06, 'triangle', 0.05, 780); break;
        case 'order': this.blip(420, 0.07, 'triangle', 0.05, 620); break;
        case 'deny': this.blip(150, 0.14, 'sawtooth', 0.05, 90); break;
        case 'build': this.noise(0.12, 0.04, 500); this.blip(220, 0.1, 'square', 0.03); break;
        case 'done': this.blip(520, 0.09, 'triangle', 0.05); setTimeout(() => this.blip(780, 0.12, 'triangle', 0.05), 90); break;
        case 'train': this.blip(440, 0.08, 'triangle', 0.04, 560); break;
        case 'hit': this.noise(0.07, 0.035, 1400); break;
        case 'shoot': this.blip(900, 0.06, 'sawtooth', 0.025, 400); break;
        case 'die': this.noise(0.22, 0.05, 380); this.blip(180, 0.18, 'sawtooth', 0.03, 70); break;
        case 'boom': this.noise(0.4, 0.09, 240); break;
        case 'win': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'triangle', 0.06), i * 130)); break;
        case 'lose': [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.blip(f, 0.3, 'sawtooth', 0.05), i * 170)); break;
        default: break;
      }
    },
  });
})();
