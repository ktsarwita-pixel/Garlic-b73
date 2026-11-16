/* GARLIC WARS - input: mouse, keyboard, multi-touch gestures
   Gestures:
     touch   : tap = select / command, long-press + drag = box select,
               one-finger drag = pan (after threshold), pinch = zoom
     mouse   : left drag = box select, right click = smart command, wheel = zoom */
(function () {
  'use strict';
  const RTS = window.RTS;
  const U = RTS.util;

  RTS.Input = function (app) {
    this.app = app;
    this.canvas = app.canvas;
    this.pointers = new Map();
    this.drag = null;      // active box-select
    this.pinch = null;
    this.lastTap = { t: 0, x: 0, y: 0 };
    this.tappedUnit = null;
    this.tappedUnitT = 0;
    this.keys = {};
    this.mouse = { x: 0, y: 0 };
    this.bind();
  };

  const I = RTS.Input.prototype;

  I.bind = function () {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => this.onDown(e), { passive: false });
    c.addEventListener('pointermove', (e) => this.onMove(e), { passive: false });
    c.addEventListener('pointerup', (e) => this.onUp(e), { passive: false });
    c.addEventListener('pointercancel', (e) => this.onUp(e), { passive: false });
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.app.zoomAt(this.app.cam.zoom + (e.deltaY > 0 ? -0.14 : 0.14), e.clientX, e.clientY);
    }, { passive: false });

    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => { this.keys = {}; this.reset(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.app.pause(true);
    });
  };

  I.reset = function () {
    this.pointers.forEach((p) => p.timer && clearTimeout(p.timer));
    this.pointers.clear();
    this.drag = null;
    this.pinch = null;
  };

  I.local = function (e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /* ---------------- down ---------------- */
  I.onDown = function (e) {
    if (this.app.blockInput()) return;
    const p = this.local(e);
    const isTouch = e.pointerType === 'touch';
    this.app.lastPointerTouch = isTouch;
    if (this.canvas.setPointerCapture) {
      try { this.canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    const ptr = { x: p.x, y: p.y, sx: p.x, sy: p.y, moved: 0, t: performance.now(), isTouch, timer: null };
    this.pointers.set(e.pointerId, ptr);

    this.app.sound.init();
    this.app.sound.resume();

    if (this.pointers.size === 2) {
      this.drag = null;
      this.pointers.forEach((pp) => { if (pp.timer) { clearTimeout(pp.timer); pp.timer = null; } });
      const pts = [...this.pointers.values()];
      this.pinch = {
        d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
        z0: this.app.cam.zoom,
        mx0: (pts[0].x + pts[1].x) / 2,
        my0: (pts[0].y + pts[1].y) / 2,
      };
      return;
    }
    if (this.pointers.size > 2) return;

    // desktop right click
    if (e.button === 2) {
      if (this.app.mode === 'place') this.app.cancelPlace();
      else if (this.app.mode === 'ability') this.app.cancelAbility();
      else this.app.commandAt(p.x, p.y, true);
      return;
    }
    if (this.app.mode === 'place') {
      if (e.button === 0 || isTouch) this.app.confirmPlaceAt(p.x, p.y);
      return;
    }
    if (this.app.mode === 'ability') {
      if (e.button === 0 || isTouch) this.app.castAbilityAt(p.x, p.y);
      return;
    }

    // press-and-hold on touch arms a selection box
    if (isTouch) {
      ptr.timer = setTimeout(() => {
        ptr.timer = null;
        if (ptr.moved > 10 || this.pointers.size !== 1) return;
        this.drag = { x0: ptr.x, y0: ptr.y, x1: ptr.x, y1: ptr.y, long: true, touchMode: true, additive: false };
        this.drag.sx = ptr.x;
        this.drag.sy = ptr.y;
        if (navigator.vibrate) { try { navigator.vibrate(12); } catch (err) { /* ignore */ } }
      }, 260);
    } else {
      this.drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, long: false, additive: e.shiftKey };
    }
  };

  /* ---------------- move ---------------- */
  I.onMove = function (e) {
    const p = this.local(e);
    this.mouse.x = p.x;
    this.mouse.y = p.y;

    const ptr = this.pointers.get(e.pointerId);
    if (!ptr) {
      if (this.app.mode === 'place' || this.app.mode === 'ability') this.app.setCursorWorld(p.x, p.y);
      return;
    }
    const dx = p.x - ptr.x, dy = p.y - ptr.y;
    ptr.moved += Math.abs(dx) + Math.abs(dy);
    ptr.x = p.x;
    ptr.y = p.y;

    // pinch zoom
    if (this.pinch && this.pointers.size >= 2) {
      const pts = [...this.pointers.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const mx = (pts[0].x + pts[1].x) / 2;
      const my = (pts[0].y + pts[1].y) / 2;
      const z = U.clamp(this.pinch.z0 * (d / this.pinch.d0), this.app.minZoom(), this.app.maxZoom());
      this.app.zoomAt(z, mx, my, true);
      this.app.cam.x -= mx - this.pinch.mx0;
      this.app.cam.y -= my - this.pinch.my0;
      this.pinch.mx0 = mx;
      this.pinch.my0 = my;
      this.app.clampCam();
      return;
    }

    // active box select grows with the pointer
    if (this.drag) {
      this.drag.x1 = p.x;
      this.drag.y1 = p.y;
      return;
    }

    // otherwise: pan once the finger/mouse has travelled enough
    if (ptr.moved > (ptr.isTouch ? 12 : 3)) {
      ptr.panning = true;
      this.app.cam.x -= dx / this.app.cam.zoom;
      this.app.cam.y -= dy / this.app.cam.zoom;
      this.app.clampCam();
    }
    if (this.app.mode === 'place' || this.app.mode === 'ability') this.app.setCursorWorld(p.x, p.y);
  };

  /* ---------------- up ---------------- */
  I.onUp = function (e) {
    const ptr = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (ptr && ptr.timer) clearTimeout(ptr.timer);
    if (this.pointers.size < 2) this.pinch = null;
    if (!ptr) return;

    const p = this.local(e);
    const app = this.app;
    const drag = this.drag;
    this.drag = null;
    if (app.blockInput()) return;
    if (app.mode === 'place' || app.mode === 'ability') return;

    // finish a box selection
    if (drag) {
      const w = Math.abs(drag.x1 - drag.x0), h = Math.abs(drag.y1 - drag.y0);
      if (w > 12 && h > 8) {
        app.selectBox(
          Math.min(drag.x0, drag.x1), Math.min(drag.y0, drag.y1),
          Math.max(drag.x0, drag.x1), Math.max(drag.y0, drag.y1),
          drag.additive
        );
        return;
      }
      if (drag.long && !drag.touchMode) {
        // held without dragging = treat as a tap
        this.tap(p);
        return;
      }
    }
    if (ptr.moved > 12 || ptr.panning) return; // was panning
    this.tap(p);
  };

  /* ---------------- tap resolution ---------------- */
  I.tap = function (p) {
    const app = this.app;
    const g = app.game;
    if (!g) return;
    const now = performance.now();
    const doubleTap = now - this.lastTap.t < 320 && Math.hypot(p.x - this.lastTap.x, p.y - this.lastTap.y) < 28;
    this.lastTap = { t: now, x: p.x, y: p.y };

    const w = app.screenToWorld(p.x, p.y);
    const pad = this.app.lastPointerTouch ? 14 : 6;
    let hitUnit = g.unitAt(w.x, w.y, null, pad);
    let hitB = g.buildingAt(w.x, w.y);
    // a building under the finger wins unless a unit is right on the tap point
    if (hitUnit && hitB && U.dist(w.x, w.y, hitUnit.x, hitUnit.y - 8) > 12) hitUnit = null;
    // tapping the very top edge of a building (its sprite roof) still selects it
    if (!hitB && hitUnit && hitUnit.isBuilding) hitB = hitUnit;

    if (hitUnit && (hitUnit.owner === 0 || g.visible(hitUnit))) {
      const again = this.tappedUnit === hitUnit && now - this.tappedUnitT < 260;
      this.tappedUnit = hitUnit;
      this.tappedUnitT = now;
      if (again && hitUnit.owner === 0) { app.selectAllOfType(hitUnit.type); return; }
      if (hitUnit.owner === 0) { app.selectEntity(hitUnit, false); return; }
      if (app.selectedUnits().some((u) => u.owner === 0)) { app.commandAt(p.x, p.y, true); return; }
      app.selectEntity(hitUnit, false);
      return;
    }
    if (hitB && (hitB.owner === 0 || g.visibleBuilding(hitB))) {
      if (hitB.owner !== 0 && app.selectedUnits().some((u) => u.owner === 0)) {
        app.commandAt(p.x, p.y, true);
        return;
      }
      app.selectEntity(hitB, false);
      return;
    }

    // ground
    if (doubleTap) { app.centerOnWorld(w.x, w.y); return; }
    if (app.selectedUnits().some((u) => u.owner === 0)) { app.commandAt(p.x, p.y, true); return; }
    if (app.selectedBuildings().some((b) => b.owner === 0)) { app.commandAt(p.x, p.y, true); return; }
    app.clearSelection();
  };

  /* ---------------- keyboard ---------------- */
  I.onKey = function (e, down) {
    const app = this.app;
    const k = e.key.toLowerCase();
    this.keys[k] = down;
    if (app.blockInput()) {
      if (down && k === 'escape') app.ui.screenEscape();
      return;
    }
    if (!down) return;
    const g = app.game;
    if (!g) return;

    if (k === 'escape') {
      if (app.mode === 'place') app.cancelPlace();
      else if (app.mode === 'ability') app.cancelAbility();
      else if (app.attackMode) { app.attackMode = false; }
      else app.ui.pauseMenu(true);
      return;
    }
    if (k === ' ') { e.preventDefault(); app.ui.pauseMenu(null); return; }
    if (k === 'p') { app.ui.pauseMenu(null); return; }
    if (k === 'h' || k === 'home') { app.centerOnBase(); return; }
    if (k === 'm') { app.ui.toggleMute(); return; }
    if (k === 'f') { app.renderer.showFps = !app.renderer.showFps; return; }
    if (k === '?' || k === '/') { app.ui.toggleHelp(); return; }

    const units = app.selectedUnits().filter((u) => u.owner === 0);
    const bs = app.selectedBuildings().filter((b) => b.owner === 0);

    if (k === 'tab') { e.preventDefault(); app.cycleSelection(); return; }
    if (k === '`') { app.selectArmy(); return; }

    // control groups
    if (k >= '1' && k <= '9' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      if (e.shiftKey) app.addToControlGroup(+k);
      else app.setControlGroup(+k);
      return;
    }

    if (units.length) {
      if (k === 's') { units.forEach((u) => g.orderStop(u)); app.attackMode = false; return; }
      if (k === 'a' || k === 't') { app.attackModeArm(); return; }
      if (units.some((u) => u.type === 'worker')) {
        const idx = ['1', '2', '3', '4', '5'].indexOf(k);
        if (idx >= 0 && RTS.buildingList[idx]) { app.enterPlaceMode(RTS.buildingList[idx]); return; }
      }
      if (k === 'q') { app.selectArmy(); return; }
      if (k === 'e') { app.selectWorkers(); return; }
    }

    if (bs.length === 1 && bs[0].def.trains) {
      const idx = ['1', '2', '3', '4', '5'].indexOf(k);
      if (idx >= 0 && bs[0].def.trains[idx]) { g.queueUnit(bs[0], bs[0].def.trains[idx]); return; }
    }

    // control groups recall
    if (k >= '1' && k <= '9') { app.recallControlGroup(+k); return; }

    // abilities
    const ai = ['z', 'x', 'c'].indexOf(k);
    if (ai >= 0) { app.ui.castAbility(ai); return; }
  };

  /* ---------------- camera keys ---------------- */
  I.update = function (dt) {
    const app = this.app;
    const k = this.keys;
    if (app.blockInput()) return;
    const sp = 700 * dt / app.cam.zoom;
    let dx = 0, dy = 0;
    if (k.arrowleft || k.a) dx -= sp;
    if (k.arrowright || k.d) dx += sp;
    if (k.arrowup || k.w) dy -= sp;
    if (k.arrowdown || k.s) dy += sp;
    if (dx || dy) {
      app.cam.x += dx;
      app.cam.y += dy;
      app.clampCam();
    }
  };
})();
