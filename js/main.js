/* GARLIC WARS - app controller & main loop */
(function () {
  'use strict';
  const RTS = window.RTS;
  const U = RTS.util;
  const TILE = RTS.TILE;

  const App = (RTS.App = function () {
    this.canvas = document.getElementById('game');
    this.sound = RTS.sound;
    this.settings = {
      faction: 'everglen',
      enemy: 'mirefen',
      difficulty: 'veteran',
      mission: 'skirmish',
      field: 'medium',
    };
    this.game = null;
    this.cam = { x: 400, y: 400, zoom: 2 };
    this.paused = false;
    this.mode = 'play'; // play | place | ability
    this.placeType = null;
    this.abilityKey = null;
    this.cursorWorld = null;
    this.attackMode = false;
    this.controlGroups = {};
    this.fired = {};
    this.lastFrame = 0;
    this.acc = 0;
    this.stepMs = 1000 / 60;
    this.timeScale = 1;

    this.renderer = new RTS.Renderer(this);
    this.input = new RTS.Input(this);
    this.ui = new RTS.UI(this);

    this.renderer.resize();
    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.renderer.resize(), 250));

    this.bindAsyncErrorHints();
    this.startDemoBackdrop();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  });

  const A = RTS.App.prototype;

  /* a paused 'postcard' game rendered behind the menus */
  A.startDemoBackdrop = function () {
    const seed = (Math.random() * 1e9) | 0;
    const g = new RTS.Game({ seed, mission: 'skirmish', difficulty: 'veteran', playerFaction: 'everglen', enemyFaction: 'mirefen', field: 'medium' });
    // let the world live a little so there are buildings and units to see
    for (let i = 0; i < 330; i++) g.update(1 / 30);
    g.clearSelection();
    this.demoGame = g;
    this.game = g;
    this.paused = true;
    this.demoCam = { t: 0, ax: g.map.startP2.x, ay: g.map.startP2.y, bx: g.map.startP1.x, by: g.map.startP1.y };
    this.cam.zoom = U.clamp(
      Math.min(this.renderer.vw / (32 * TILE), this.renderer.vh / (18 * TILE)),
      1.2, 2.6
    );
    this.centerOnWorld(g.map.startP2.x, g.map.startP2.y);
    this.renderer.groundCanvas = null;
  };

  A.bindAsyncErrorHints = function () {
    window.addEventListener('unhandledrejection', (e) => console.warn('unhandled', e.reason));
  };

  /* ---------------- game lifecycle ---------------- */
  A.startGame = function (settings) {
    this.settings = Object.assign({}, this.settings, settings || {});
    const seed = (Math.random() * 1e9) | 0;
    this.game = new RTS.Game({
      seed,
      mission: this.settings.mission,
      difficulty: this.settings.difficulty,
      playerFaction: this.settings.faction,
      enemyFaction: this.settings.enemy,
      field: this.settings.field,
    });
    this.paused = false;
    this.mode = 'play';
    this.placeType = null;
    this.abilityKey = null;
    this.attackMode = false;
    this.controlGroups = {};
    this.fired = {};
    this.renderer.groundCanvas = null;
    this.ui._cardKey = '';
    this.ui._selKey = '';
    this.ui._abilKey = '';
    this.ui._logKey = '';
    this.game.speed = 1;
    this.timeScale = 1;
    // camera: fit ~24 tiles of width, clamped
    this.cam.zoom = U.clamp(
      Math.min(this.renderer.vw / (26 * TILE), this.renderer.vh / (15 * TILE)),
      1.45, 3.2
    );
    this.centerOnWorld(this.game.map.startP1.x, this.game.map.startP1.y);
    // intro selection: workers
    const workers = this.game.units.filter((u) => u.owner === 0 && u.type === 'worker');
    this.game.selectUnits(workers);
    this.ui.showScreen(null);
    this.ui.toast(RTS.MISSIONS[this.settings.mission].name, 2200);
    this.tutorial = { step: 0, t: 0, shown: {} };
    this.sound.init();
    this.sound.resume();
  };

  A.restart = function () {
    this.startGame(this.settings);
  };

  A.toMenu = function () {
    this.paused = false;
    this.ui.clearHint();
    this.startDemoBackdrop();
    this.ui.showScreen('title');
  };

  A.surrender = function () {
    if (!this.game) return;
    this.game.gameOver = true;
    this.game.result = 'lose';
    this.ui.showGameOver(false, this.game);
  };

  A.pause = function (on) {
    if (!this.game || this.game.gameOver) return;
    if (on === undefined) on = !this.paused;
    this.paused = on;
    if (on) this.ui.showScreen('pause');
    else if (this.ui.screen === 'pause') this.ui.showScreen(null);
  };

  A.blockInput = function () {
    return !!(this.ui.screen || !this.game || this.game.gameOver || this.paused);
  };

  A.toggleFullscreen = function () {
    const d = document;
    const root = d.documentElement;
    const isFs = !!(d.fullscreenElement || d.webkitFullscreenElement);
    try {
      if (!isFs) {
        const req = root.requestFullscreen || root.webkitRequestFullscreen;
        const p = req && req.call(root);
        if (p && p.catch) p.catch(() => {});
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
      } else {
        const ex = d.exitFullscreen || d.webkitExitFullscreen;
        const p = ex && ex.call(d);
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) { /* ignore */ }
  };

  A.toggleFps = function () {
    this.renderer.showFps = !this.renderer.showFps;
  };

  /* ---------------- camera ---------------- */
  A.onResize = function () {
    if (this.cam.zoom < this.minZoom()) this.cam.zoom = this.minZoom();
    this.clampCam();
    if (this.ui) { this.ui._layoutKey = ''; this.ui.layout && this.ui.layout(); }
  };

  A.viewWorld = function () {
    const r = this.renderer;
    const z = this.cam.zoom;
    const w = r.vw / z, h = r.vh / z;
    return { x: this.cam.x - w / 2, y: this.cam.y - h / 2, w, h };
  };

  A.clampCam = function () {
    const v = this.viewWorld();
    const halfW = v.w / 2, halfH = v.h / 2;
    const W = this.worldW(), H = this.worldH();
    if (v.w >= W) this.cam.x = W / 2;
    else this.cam.x = U.clamp(this.cam.x, halfW - 24, W - halfW + 24);
    if (v.h >= H) this.cam.y = H / 2;
    else this.cam.y = U.clamp(this.cam.y, halfH - 24, H - halfH + 24);
  };

  A.worldW = function () { return this.game ? this.game.worldW : RTS.WORLD_W; };
  A.worldH = function () { return this.game ? this.game.worldH : RTS.WORLD_H; };

  A.minZoom = function () {
    const r = this.renderer;
    return Math.max(r.vw / this.worldW(), r.vh / this.worldH()) * 0.98;
  };
  A.maxZoom = function () { return 5; };

  A.zoomAt = function (z, sx, sy, absolute) {
    const before = this.screenToWorld(sx, sy);
    this.cam.zoom = U.clamp(z, this.minZoom(), this.maxZoom());
    if (!absolute) {
      const after = this.screenToWorld(sx, sy);
      this.cam.x += before.x - after.x;
      this.cam.y += before.y - after.y;
    }
    this.clampCam();
  };

  A.screenToWorld = function (sx, sy) {
    const r = this.renderer;
    const z = this.cam.zoom;
    return {
      x: (sx - r.vw / 2) / z + this.cam.x,
      y: (sy - r.vh / 2) / z + this.cam.y,
    };
  };

  A.worldToScreen = function (wx, wy) {
    const r = this.renderer;
    const z = this.cam.zoom;
    return { x: (wx - this.cam.x) * z + r.vw / 2, y: (wy - this.cam.y) * z + r.vh / 2 };
  };

  A.centerOnWorld = function (x, y) {
    this.cam.x = x;
    this.cam.y = y;
    this.clampCam();
  };

  A.centerOnBase = function () {
    if (!this.game) return;
    const keep = this.game.buildings.find((b) => !b.dead && b.owner === 0 && b.type === 'keep')
      || this.game.buildings.find((b) => !b.dead && b.owner === 0);
    if (keep) this.centerOnWorld(keep.x, keep.y);
  };

  A.setCursorWorld = function (sx, sy) {
    this.cursorWorld = this.screenToWorld(sx, sy + this.placeOffsetY());
  };

  /* ---------------- selection ---------------- */
  A.selectedUnits = function () {
    return this.game ? this.game.selectedUnits() : [];
  };
  A.selectedBuildings = function () {
    return this.game ? this.game.selectedBuildings() : [];
  };

  A.hasSelection = function () {
    return this.game && (this.game.selectedUnits().length > 0 || this.game.selectedBuildings().length > 0);
  };

  A.selectEntity = function (e, additive) {
    const g = this.game;
    const list = g.units.indexOf(e) >= 0 ? [e] : [e];
    if (additive && g.selection.kind === 'units' && g.units.indexOf(e) >= 0) {
      const cur = g.selectedUnits();
      if (cur.indexOf(e) >= 0) g.selectUnits(cur.filter((u) => u !== e));
      else g.selectUnits(cur.concat([e]));
    } else if (g.units.indexOf(e) >= 0) {
      g.selectUnits([e]);
    } else {
      g.selectBuilding(e);
    }
    this.sound.play('select');
  };

  A.selectAllOfType = function (type) {
    const g = this.game;
    const list = g.units.filter((u) => !u.dead && u.owner === 0 && u.type === type);
    const onScreen = list.filter((u) => {
      const s = this.worldToScreen(u.x, u.y);
      const r = this.renderer;
      return s.x > 0 && s.x < r.vw && s.y > 0 && s.y < r.vh;
    });
    g.selectUnits(onScreen.length ? onScreen : list);
    this.sound.play('select');
  };

  A.selectBox = function (x0, y0, x1, y1, additive) {
    const g = this.game;
    const a = this.screenToWorld(x0, y0);
    const b = this.screenToWorld(x1, y1);
    const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y);
    // box select only ever picks units: selection cycling between kinds confuses play
    const picked = g.units.filter((u) => !u.dead && u.owner === 0 && u.x >= minX && u.x <= maxX && u.y >= minY - 16 && u.y <= maxY + 6);
    if (additive) {
      const cur = g.selectedUnits();
      const merged = cur.slice();
      for (const u of picked) if (merged.indexOf(u) < 0) merged.push(u);
      g.selectUnits(merged);
    } else {
      g.selectUnits(picked);
    }
    if (picked.length) this.sound.play('select');
  };

  A.selectArmy = function () {
    if (!this.game) return;
    const list = this.game.units.filter((u) => !u.dead && u.owner === 0 && u.type !== 'worker');
    if (!list.length) { this.ui.toast('No soldiers yet — build a Barracks'); this.sound.play('deny'); return; }
    this.game.selectUnits(list);
    this.sound.play('select');
  };

  A.selectWorkers = function () {
    if (!this.game) return;
    const list = this.game.units.filter((u) => !u.dead && u.owner === 0 && u.type === 'worker');
    if (!list.length) { this.ui.toast('No peasants left!'); this.sound.play('deny'); return; }
    this.game.selectUnits(list);
    this.sound.play('select');
  };

  A.clearSelection = function () {
    if (this.game) this.game.clearSelection();
  };

  A.cycleSelection = function () {
    const g = this.game;
    const list = g.units.filter((u) => !u.dead && u.owner === 0 && u.type !== 'worker');
    if (!list.length) return;
    const cur = g.selectedUnits();
    const i = cur.length === 1 ? list.indexOf(cur[0]) : -1;
    g.selectUnits([list[(i + 1) % list.length]]);
    this.centerOnWorld(g.selectedUnits()[0].x, g.selectedUnits()[0].y);
  };

  A.setControlGroup = function (n) {
    this.controlGroups[n] = this.game.selectedUnits().slice();
    this.sound.play('click');
  };
  A.addToControlGroup = function (n) {
    const cur = this.controlGroups[n] || [];
    for (const u of this.game.selectedUnits()) if (cur.indexOf(u) < 0) cur.push(u);
    this.controlGroups[n] = cur;
    this.sound.play('click');
  };
  A.recallControlGroup = function (n) {
    const g = this.game;
    const grp = (this.controlGroups[n] || []).filter((u) => !u.dead && u.owner === 0);
    if (!grp.length) return;
    g.selectUnits(grp);
    // double tap centers
    const now = performance.now();
    this._lastGroup = this._lastGroup || {};
    if (this._lastGroup[n] && now - this._lastGroup[n] < 400) {
      let sx = 0, sy = 0;
      for (const u of grp) { sx += u.x; sy += u.y; }
      this.centerOnWorld(sx / grp.length, sy / grp.length);
    }
    this._lastGroup[n] = now;
    this.sound.play('select');
  };

  /* ---------------- commands ---------------- */
  A.commandAt = function (sx, sy, smart) {
    const g = this.game;
    if (!g) return;
    const w = this.screenToWorld(sx, sy);
    if (this.attackMode) {
      const target = g.unitAt(w.x, w.y, 1, 20) || g.buildingAt(w.x, w.y, 1);
      if (target) {
        for (const u of g.selectedUnits().filter((u) => u.owner === 0)) g.orderAttack(u, target);
        g.effects.push({ type: 'ping', x: w.x, y: w.y, color: '#ff5a5a', t: 0, life: 0.5 });
        this.sound.play('order');
        this.attackMode = false;
        return;
      }
    }
    if (g.selectedUnits().filter((u) => u.owner === 0).length) g.commandSmart(w.x, w.y);
    else if (g.selectedBuildings().length) {
      const b = g.selectedBuildings()[0];
      if (b.owner === 0 && b.def.trains) {
        b.rally = { x: w.x, y: w.y };
        g.effects.push({ type: 'ping', x: w.x, y: w.y, color: '#ffe066', t: 0, life: 0.6 });
      }
    }
  };

  A.orderStopSelected = function () {
    const g = this.game;
    for (const u of g.selectedUnits().filter((u) => u.owner === 0)) g.orderStop(u);
    this.attackMode = false;
    this.sound.play('click');
  };

  A.attackModeArm = function () {
    if (!this.game.selectedUnits().some((u) => u.owner === 0)) {
      this.ui.toast('Select units to attack');
      this.sound.play('deny');
      return;
    }
    this.attackMode = !this.attackMode;
    this.mode = 'play';
    if (this.attackMode) {
      this.ui.toast('Attack: tap a target', 1200);
      this.sound.play('select');
    }
  };

  /* ---------------- build / ability modes ---------------- */
  A.enterPlaceModeMenu = function () {
    // cycle through buildable options (mobile: opens palette in the card by selecting workers)
    const workers = this.game.units.filter((u) => !u.dead && u.owner === 0 && u.type === 'worker');
    if (!workers.length) {
      this.ui.toast('You need a Peasant to build');
      this.sound.play('deny');
      return;
    }
    // ensure a worker is selected so the card shows the palette
    if (!this.game.selectedUnits().some((u) => u.type === 'worker')) this.game.selectUnits(workers.slice(0, 1));
    (this.ui.cardEl || {}).scrollIntoView && this.ui.cardEl.scrollIntoView({ block: 'nearest' });
  };

  A.clearHint = function () {
    if (this.ui) this.ui.clearHint();
  };

  A.enterPlaceMode = function (type) {
    if (!this.game) return;
    const workers = this.game.units.filter((u) => !u.dead && u.owner === 0 && u.type === 'worker');
    if (!workers.length) {
      this.ui.toast('You need a Peasant to build');
      this.sound.play('deny');
      return;
    }
    const def = RTS.BUILDINGS[type];
    if (this.game.res[0].wood < def.cost.wood) {
      this.ui.toast('Need ' + def.cost.wood + ' wood');
      this.sound.play('deny');
      return;
    }
    this.cancelAbility();
    this.mode = 'place';
    this.placeType = type;
    this.attackMode = false;
    this.cursorWorld = null;
    this.sound.play('click');
    this.ui.toast('Tap the ground to place ' + def.name + ' · Esc to cancel', 2000);
  };

  A.clearPlaceMode = function () {
    if (this.mode === 'place') {
      this.mode = 'play';
      this.placeType = null;
      this.cursorWorld = null;
    }
  };

  A.cancelPlace = function () {
    this.clearPlaceMode();
    this.ui._cardKey = '';
  };

  /* on touch screens the finger covers the target: place slightly above it */
  A.placeOffsetY = function () {
    return this.lastPointerTouch ? -34 : 0;
  };

  A.confirmPlaceAt = function (sx, sy) {
    const g = this.game;
    if (!g || !this.placeType) return;
    const w = this.screenToWorld(sx, sy + this.placeOffsetY());
    const type = this.placeType;
    const cx = Math.floor(w.x / TILE) * TILE + TILE / 2;
    const cy = Math.floor(w.y / TILE) * TILE + TILE / 2;
    const b = g.placeBuilding(type, cx, cy, 0);
    if (b) {
      this.ui._cardKey = '';
      // stay in build mode while affordable so farms/towers can be chained
      if (g.res[0].wood < RTS.BUILDINGS[type].cost.wood) {
        this.cancelPlace();
        this.ui.toast('Out of wood');
      }
    }
  };

  A.enterAbilityMode = function (key) {
    const g = this.game;
    if (!g) return;
    const ab = RTS.ABILITIES[key];
    if (!ab) return;
    if (g.abilityCd[0] > 0) {
      this.ui.toast(ab.name + ' recharging');
      this.sound.play('deny');
      return;
    }
    if (g.res[0].favor < ab.cost) {
      this.ui.toast('Need ' + ab.cost + ' Aether for ' + ab.name);
      this.sound.play('deny');
      return;
    }
    if (ab.needsUnits && !g.selectedUnits().some((u) => u.owner === 0)) {
      this.ui.toast('Select units to ' + ab.name.toLowerCase());
      this.sound.play('deny');
      return;
    }
    this.cancelPlace();
    this.mode = 'ability';
    this.abilityKey = key;
    this.attackMode = false;
    this.cursorWorld = null;
    this.sound.play('select');
    this.ui.toast(ab.name + ': tap the ground', 1600);
  };

  A.cancelAbility = function () {
    if (this.mode === 'ability') {
      this.mode = 'play';
      this.abilityKey = null;
      this.cursorWorld = null;
    }
  };

  A.castAbilityAt = function (sx, sy) {
    const g = this.game;
    if (!g || !this.abilityKey) return;
    const w = this.screenToWorld(sx, sy);
    const ok = g.useAbility(0, this.abilityKey, w.x, w.y);
    if (ok) {
      this.mode = 'play';
      this.abilityKey = null;
      this.cursorWorld = null;
      this.ui._abilKey = '';
    } else {
      this.sound.play('deny');
    }
  };

  /* ---------------- main loop ---------------- */
  A.loop = function (ts) {
    requestAnimationFrame(this.loop);
    if (!this.lastFrame) this.lastFrame = ts;
    let dt = (ts - this.lastFrame) / 1000;
    this.lastFrame = ts;
    if (dt > 0.25) dt = 0.25;

    if (this.game && !this.paused && !this.ui.screen) {
      this.acc += dt * 1000;
      const maxSteps = 4;
      let steps = 0;
      while (this.acc >= this.stepMs && steps < maxSteps) {
        this.game.update(this.stepMs / 1000);
        this.acc -= this.stepMs;
        steps++;
      }
      if (steps === maxSteps) this.acc = 0;
      this.input.update(dt);
      this.updateTutorial(dt);
      this.playSounds();
      this.checkGameOver();
    } else {
      this.acc = 0;
    }

    this.renderer.frame(dt);
    if (this.game && !this.ui.screen) this.ui.refresh(this.game, this);
    if (this.ui.screen) this.updateMenuBackdrop(dt);
  };

  /* ---------------- first-game nudges ---------------- */
  A.updateTutorial = function (dt) {
    if (!this.tutorial || !this.game || this.game.gameOver) return;
    const T = this.tutorial;
    T.t += dt;
    const g = this.game;
    const seen = this.settings._seenHints;
    const hasWorker = g.selectedUnits().some((u) => u.type === 'worker');
    const tips = [
      { k: 'gather', text: '<b>Tap a tree</b> with your Peasants selected to gather wood.', check: () => g.units.some((u) => u.owner === 0 && u.type === 'worker' && u.carry > 0) },
      { k: 'build', text: 'Select a Peasant, then tap <b>Build → Barracks</b> (or press <b>1</b>–<b>4</b>) and place it.', check: () => g.buildings.some((b) => b.owner === 0 && b.type === 'barracks') },
      { k: 'train', text: 'Tap your <b>Keep</b> to train Peasants. Tap the <b>Barracks</b> to train soldiers.', check: () => g.units.some((u) => u.owner === 0 && u.type !== 'worker') || g.buildings.some((b) => b.owner === 0 && b.type === 'barracks' && b.queue.length) },
      { k: 'army', text: 'Select soldiers and <b>tap the enemy base</b> to attack. Pinch to zoom, drag with two fingers to pan.', check: () => g.stats.kills[0] > 0 },
      { k: 'powers', text: 'Spend <b>Aether</b> on faction powers — tap the glowing icons near the minimap.', check: () => g.abilityCd[0] > 0 || g.stats.kills[0] > 3 },
    ];
    if (T.t < 4) return;
    // show one hint at a time
    while (T.step < tips.length && tips[T.step].check()) T.step++;
    if (T.step >= tips.length) { this.ui.clearHint(); return; }
    const tip = tips[T.step];
    if (T.shown[tip.k]) {
      if (T.tipAge == null) T.tipAge = T.t;
      if (T.t - T.tipAge > 14) { this.ui.clearHint(); T.shown[tip.k] = 'done'; if (T.tipDismissed === tip.k) {} }
      return;
    }
    T.shown[tip.k] = true;
    T.tipAge = T.t;
    this.ui.hint(tip.text);
  };

  A.playSounds = function () {
    const g = this.game;
    if (!g || !g.sfx.length) return;
    for (const s of g.sfx) this.sound.play(s);
    g.sfx.length = 0;
  };

  A.checkGameOver = function () {
    const g = this.game;
    if (!g.gameOver || this.ui.screen === 'gameover') return;
    setTimeout(() => this.ui.showGameOver(g.result === 'win', g), 700);
  };

  A.updateMenuBackdrop = function (dt) {
    const g = this.demoGame;
    if (!g || this.game !== g) return;
    if (g.gameOver) { this.startDemoBackdrop(); return; }
    const d = this.demoCam;
    d.t += dt * 0.06;
    const p = (Math.sin(d.t * Math.PI * 2) + 1) / 2;
    this.cam.x = U.lerp(d.ax, d.bx, p);
    this.cam.y = U.lerp(d.ay, d.by, p);
    this.clampCam();
    // keep the demo world breathing so flags/waves animate
    if (this.ui.screen === 'title') {
      g.paused = false;
      for (let i = 0; i < 2; i++) g.update(1 / 60);
      g.paused = false;
    }
  };

  /* boot */
  window.addEventListener('DOMContentLoaded', () => {
    window.__rtsApp = new RTS.App();
  });
})();
