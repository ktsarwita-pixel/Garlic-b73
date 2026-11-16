/* GARLIC WARS - DOM interface */
(function () {
  'use strict';
  const RTS = window.RTS;
  const U = RTS.util;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  RTS.UI = function (app) {
    this.app = app;
    this.root = document.getElementById('ui');
    this.logs = [];
    this.icons = {};
    this.screen = null;
    this.muted = false;
    this.helpOpen = false;
    this.lastSelKey = '';
    this.dirty = true;
    this.build();
  };

  const UI = RTS.UI.prototype;

  /* ---------- icon canvas helper ---------- */
  UI.iconEl = function (name, size, fac) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    RTS.drawIcon(c.getContext('2d'), name, size, fac || (this.app.game && this.app.game.playerFaction) || RTS.FACTIONS[0]);
    return c;
  };

  /* ---------- build static chrome ---------- */
  UI.build = function () {
    const r = this.root;
    r.innerHTML = '';

    // ---- top bar ----
    const top = el('div', 'topbar');
    const resGroup = el('div', 'res-group');
    this.resWood = this.makeRes('wood', 'Wood');
    this.resFood = this.makeRes('food', 'Food');
    this.resPop = this.makeRes('pop', 'Pop');
    this.resAether = this.makeRes('favor', 'Aether', 'aether');
    resGroup.append(this.resWood.n, this.resFood.n, this.resPop.n, this.resAether.n);

    const tr = el('div', 'top-right');
    this.timerEl = el('div', 'timer', '0:00');
    this.btnPause = el('button', 'pbtn icon-btn', '☰');
    this.btnPause.setAttribute('aria-label', 'Menu and pause');
    this.btnPause.onclick = () => this.app.ui.pauseMenu(true);
    this.btnHelp = el('button', 'pbtn icon-btn', '?');
    this.btnHelp.setAttribute('aria-label', 'How to play');
    this.btnHelp.onclick = () => this.toggleHelp();
    this.missionEl = el('div', 'timer mission', '');
    this.missionEl.style.display = 'none';
    tr.append(this.timerEl, this.missionEl, this.btnPause, this.btnHelp);
    top.append(resGroup, tr);
    r.append(top);

    // ---- logs ----
    this.logEl = el('div', 'logs');
    r.append(this.logEl);

    // ---- dock ----
    const dock = el('div', 'dock');
    const left = el('div', 'dock-left');
    const right = el('div', 'dock-right');

    // actions (mode buttons)
    this.actionsEl = el('div', 'actions');
    this.btnBuild = this.actionBtn('Build', 'house', () => this.app.enterPlaceModeMenu());
    this.btnAttack = this.actionBtn('Attack', 'sword', () => this.app.attackModeArm());
    this.btnStop = this.actionBtn('Hold', 'plate', () => this.app.orderStopSelected());
    this.actionsEl.append(this.btnBuild.n, this.btnAttack.n, this.btnStop.n);
    left.append(this.actionsEl);

    // command card
    this.cardEl = el('div', 'card three');
    left.append(this.cardEl);

    // minimap
    const mmWrap = el('div', 'minimap-wrap');
    this.mmCanvas = document.createElement('canvas');
    this.mmCanvas.width = 128;
    this.mmCanvas.height = 128;
    mmWrap.append(this.mmCanvas);
    mmWrap.append(el('div', 'vig'));
    this.mmWrap = mmWrap;
    this.bindMinimap();

    // abilities (inner) then minimap (corner) for better thumb reach
    this.abilEl = el('div', 'abilities');
    right.append(this.abilEl, mmWrap);

    dock.append(left, right);
    r.append(dock);
    this.dockEl = dock;

    // ---- quick rail ----
    const rail = el('div', 'quickrail');
    const qr = (glyph, title, fn) => {
      const b = el('button', 'qr', glyph);
      b.title = title;
      b.setAttribute('aria-label', title);
      b.onclick = () => { this.app.sound.play('click'); fn(); };
      rail.append(b);
      return b;
    };
    this.qrArmy = qr('⚔', 'Select all army', () => this.app.selectArmy());
    this.qrWorkers = qr('⛏', 'Select all peasants', () => this.app.selectWorkers());
    this.qrBase = qr('🏰', 'Center on base', () => { this.app.centerOnBase(); this.app.ui.toast('Base', 700); });
    r.append(rail);

    // ---- selection panel ----
    this.selPanel = el('div', 'selpanel panel');
    r.append(this.selPanel);

    // ---- screens ----
    this.screens = {};
    this.buildTitleScreen();
    this.buildSetupScreen();
    this.buildPauseScreen();
    this.buildHelpScreen();
    this.buildGameOverScreen();
  };

  UI.makeRes = function (icon, label, extra) {
    const n = el('div', 'res' + (extra ? ' ' + extra : ''));
    if (extra === 'aether') n.append(el('div', 'aether-fill'));
    n.append(this.iconEl(icon, 20));
    const val = el('span', 'val', '0');
    n.append(val, el('span', 'lbl', label));
    return { n, val };
  };

  UI.actionBtn = function (label, icon, fn) {
    const b = el('button', 'cmd');
    b.append(this.iconEl(icon, 26));
    b.append(el('span', null, label));
    b.onclick = () => {
      this.app.sound.play('click');
      fn();
    };
    return { n: b, icon: b.querySelector('canvas') };
  };

  /* ---------- title ---------- */
  UI.buildTitleScreen = function () {
    const s = el('div', 'screen show');
    const inner = el('div', 'inner title-wrap');
    inner.append(el('h1', 'logo', 'GARLIC<br><span>WARS</span>'));
    inner.append(el('div', 'tagline', 'A tiny 2D pixel RTS about holding the vale.'));

    const panel = el('div', 'menu-panel panel');
    const grid = el('div', 'menu-grid');

    const play = el('button', 'pbtn wide', '⚙ Battle Setup');
    play.style.fontSize = '10px';
    play.style.padding = '12px';
    play.onclick = () => { this.app.sound.play('select'); this.showScreen('setup'); };
    grid.append(play);

    const quick = el('button', 'pbtn primary wide', '⚡ Quick Match');
    quick.onclick = () => {
      this.app.sound.play('select');
      this.app.startGame(this.app.settings);
      this.showScreen(null);
    };
    grid.append(quick);

    const help = el('button', 'pbtn wide', '? How to play');
    help.onclick = () => { this.app.sound.play('click'); this.showScreen('help', () => 'title'); };
    grid.append(help);

    const row = el('div', 'row');
    this.muteBtn = el('button', 'pbtn', '🔊 Sound');
    this.muteBtn.onclick = () => this.toggleMute();
    const fsBtn = el('button', 'pbtn', '⛶ Fullscreen');
    fsBtn.onclick = () => this.app.toggleFullscreen();
    row.append(this.muteBtn, fsBtn);
    grid.append(row);

    panel.append(grid);
    inner.append(panel);
    inner.append(el('div', 'tagline', 'Made with canvas + love · works on phones & desktops'));
    s.append(inner);
    this.root.append(s);
    this.screens.title = s;
  };

  /* ---------- setup ---------- */
  UI.buildSetupScreen = function () {
    const s = el('div', 'screen');
    const inner = el('div', 'inner');
    const head = el('div', 'row between');
    const back = el('button', 'pbtn', '← Back');
    back.onclick = () => this.showScreen('title');
    head.append(el('div', 'logo', 'BATTLE SETUP'), back);
    head.querySelector('.logo').style.fontSize = '16px';
    inner.append(head);

    const panel = el('div', 'menu-panel panel');
    panel.style.marginTop = '10px';

    // your faction
    panel.append(el('div', 'label', 'Your banner'));
    this.facRow = el('div', 'row');
    RTS.FACTIONS.forEach((f) => {
      const b = el('button', 'faction-card');
      b.dataset.faction = f.id;
      const nm = el('div', 'fname', f.name);
      const rc = el('div', 'frace', f.race);
      const bl = el('div', 'fblurb', f.blurb);
      const sw = el('div', 'swatch');
      sw.style.background = 'linear-gradient(90deg,' + f.color + ',' + f.color2 + ')';
      b.append(nm, rc, bl, sw);
      b.onclick = () => {
        this.app.settings.faction = f.id;
        this.app.sound.play('click');
        this.syncSetup();
      };
      this.facRow.append(b);
    });
    panel.append(this.facRow);

    // enemy
    panel.append(el('div', 'label', 'Rival banner'));
    this.enemyRow = el('div', 'row');
    RTS.FACTIONS.forEach((f) => {
      const b = el('button', 'opt', f.name);
      b.dataset.enemy = f.id;
      b.onclick = () => {
        this.app.settings.enemy = f.id;
        this.app.sound.play('click');
        this.syncSetup();
      };
      this.enemyRow.append(b);
    });
    panel.append(this.enemyRow);

    // difficulty + mission
    const two = el('div', 'grid2');
    const dCol = el('div');
    dCol.append(el('div', 'label', 'Difficulty'));
    this.diffRow = el('div', 'row');
    Object.keys(RTS.DIFFICULTY).forEach((k) => {
      const b = el('button', 'opt', RTS.DIFFICULTY[k].name);
      b.dataset.diff = k;
      b.style.flex = '1 1 auto';
      b.onclick = () => { this.app.settings.difficulty = k; this.app.sound.play('click'); this.syncSetup(); };
      this.diffRow.append(b);
    });
    dCol.append(this.diffRow);
    const mCol = el('div');
    mCol.append(el('div', 'label', 'Mission'));
    this.missRow = el('div', 'row');
    Object.keys(RTS.MISSIONS).forEach((k) => {
      const b = el('button', 'opt', RTS.MISSIONS[k].name);
      b.dataset.mission = k;
      b.style.flex = '1 1 auto';
      b.onclick = () => { this.app.settings.mission = k; this.app.sound.play('click'); this.syncSetup(); };
      this.missRow.append(b);
    });
    mCol.append(this.missRow);
    two.append(dCol, mCol);
    panel.append(two);

    // play field
    const fCol = el('div');
    fCol.append(el('div', 'label', 'Play field'));
    this.fieldRow = el('div', 'row');
    Object.keys(RTS.FIELDS).forEach((k) => {
      const b = el('button', 'opt', RTS.FIELDS[k].name);
      b.dataset.field = k;
      b.style.flex = '1 1 auto';
      b.onclick = () => { this.app.settings.field = k; this.app.sound.play('click'); this.syncSetup(); };
      this.fieldRow.append(b);
    });
    fCol.append(this.fieldRow);
    panel.append(fCol);
    this.missDesc = el('div', 'tagline', '');
    this.missDesc.style.margin = '10px 0 0';
    this.missDesc.style.textAlign = 'left';
    panel.append(this.missDesc);

    const start = el('button', 'pbtn primary wide', '⚔ To Battle');
    start.style.fontSize = '11px';
    start.style.padding = '14px';
    start.style.marginTop = '12px';
    start.onclick = () => {
      this.app.sound.play('select');
      this.app.startGame(this.app.settings);
      this.showScreen(null);
    };
    panel.append(start);
    inner.append(panel);
    s.append(inner);
    this.root.append(s);
    this.screens.setup = s;
    this.syncSetup();
  };

  UI.syncSetup = function () {
    const st = this.app.settings;
    if (!st.faction) st.faction = 'everglen';
    if (!st.enemy) st.enemy = 'mirefen';
    if (st.enemy === st.faction) {
      const alt = RTS.FACTIONS.find((f) => f.id !== st.faction);
      if (alt) st.enemy = alt.id;
    }
    if (!st.difficulty) st.difficulty = 'recruit';
    if (!st.mission) st.mission = 'skirmish';
    this.facRow.querySelectorAll('.faction-card').forEach((b) => {
      b.classList.toggle('on', b.dataset.faction === st.faction);
    });
    this.enemyRow.querySelectorAll('.opt').forEach((b) => {
      b.classList.toggle('on', b.dataset.enemy === st.enemy);
      b.disabled = b.dataset.enemy === st.faction;
    });
    this.diffRow.querySelectorAll('.opt').forEach((b) => b.classList.toggle('on', b.dataset.diff === st.difficulty));
    this.missRow.querySelectorAll('.opt').forEach((b) => b.classList.toggle('on', b.dataset.mission === st.mission));
    if (!st.field) st.field = 'medium';
    this.fieldRow.querySelectorAll('.opt').forEach((b) => b.classList.toggle('on', b.dataset.field === st.field));
    const m = RTS.MISSIONS[st.mission];
    this.missDesc.textContent = m.desc;
  };

  /* ---------- pause ---------- */
  UI.buildPauseScreen = function () {
    const s = el('div', 'screen');
    const inner = el('div', 'pause-menu');
    inner.append(el('div', 'logo', 'PAUSED'));
    inner.querySelector('.logo').style.fontSize = '20px';
    inner.querySelector('.logo').style.textAlign = 'center';
    const mk = (label, fn, cls) => {
      const b = el('button', 'pbtn wide ' + (cls || ''), label);
      b.onclick = () => { this.app.sound.play('click'); fn(); };
      inner.append(b);
      return b;
    };
    mk('▶ Resume', () => this.pauseMenu(false), 'primary');
    this.pauseMute = mk('🔊 Sound: On', () => this.toggleMute());
    mk('⛶ Fullscreen', () => this.app.toggleFullscreen());
    mk('↺ Restart', () => { this.pauseMenu(false); this.app.restart(); });
    mk('⚑ Surrender', () => { this.pauseMenu(false); this.app.surrender(); }, 'danger');
    mk('⌂ Main menu', () => { this.pauseMenu(false); this.app.toMenu(); });
    s.append(inner);
    this.root.append(s);
    this.screens.pause = s;
  };

  /* ---------- help ---------- */
  UI.buildHelpScreen = function () {
    const s = el('div', 'screen');
    const inner = el('div', 'inner');
    const head = el('div', 'row between');
    const b = el('button', 'pbtn', '✕ Close');
    b.onclick = () => {
      const from = this.helpReturn || 'title';
      this.showScreen(from === 'game' ? null : from);
      if (from === 'game') this.app.paused = false;
    };
    head.append(el('div', 'logo', 'HOW TO PLAY'), b);
    head.querySelector('.logo').style.fontSize = '15px';
    inner.append(head);
    const panel = el('div', 'menu-panel panel help-grid');
    panel.style.marginTop = '10px';
    panel.innerHTML += `
      <div>
        <h4>Goal</h4>
        <ul>
          <li>Destroy the enemy <b>Keep</b>.</li>
          <li>If your Keep falls, you lose.</li>
          <li>Survive the mission timer too.</li>
        </ul>
      </div>
      <div>
        <h4>Touch</h4>
        <ul>
          <li><b>Tap unit</b> to select it.</li>
          <li><b>Tap ground</b> to move / attack.</li>
          <li><b>Drag</b> two fingers to pan.</li>
          <li><b>Pinch</b> to zoom.</li>
          <li><b>Long press</b> = select box.</li>
        </ul>
      </div>
      <div>
        <h4>Mouse &amp; keys</h4>
        <ul>
          <li><kbd>L-drag</kbd> select box</li>
          <li><kbd>R-click</kbd> move / attack</li>
          <li><kbd>WASD</kbd>/<kbd>↑↓</kbd> pan · <kbd>Wheel</kbd> zoom</li>
          <li><kbd>Ctrl+1..9</kbd> groups · <kbd>H</kbd> home</li>
          <li><kbd>Space</kbd> pause · <kbd>Esc</kbd> cancel</li>
        </ul>
      </div>
      <div>
        <h4>Economy</h4>
        <ul>
          <li>Tap a tree with a <b>Peasant</b> selected to chop wood.</li>
          <li>Gold veins give <b>Aether</b> for spells.</li>
          <li><b>Farms</b> make food and raise population.</li>
        </ul>
      </div>
      <div>
        <h4>Army</h4>
        <ul>
          <li><b>Barracks</b>: Swordsman, Longbow, Lancer.</li>
          <li><b>Workshop</b>: Battleram + upgrades.</li>
          <li><b>Watchtower</b> defends your base.</li>
        </ul>
      </div>
      <div>
        <h4>Powers</h4>
        <ul>
          <li>Each faction has two Aether powers.</li>
          <li>Tap the power icon, then the ground.</li>
          <li>Aether regenerates over time.</li>
        </ul>
      </div>`;
    inner.append(panel);
    s.append(inner);
    this.root.append(s);
    this.screens.help = s;
  };

  /* ---------- game over ---------- */
  UI.buildGameOverScreen = function () {
    const s = el('div', 'screen gameover');
    const inner = el('div', 'inner panel menu-panel');
    inner.style.textAlign = 'center';
    inner.style.maxWidth = '520px';
    this.goTitle = el('div', 'logo', 'VICTORY');
    this.goSub = el('div', 'tagline', '');
    this.goStats = el('div', 'stat-grid');
    inner.append(this.goTitle, this.goSub, this.goStats);
    const row = el('div', 'row');
    const again = el('button', 'pbtn primary', '⚔ Rematch');
    again.onclick = () => { this.showScreen(null); this.app.restart(); };
    this.goAgain = again;
    const menu = el('button', 'pbtn', '⌂ Main menu');
    menu.onclick = () => { this.showScreen(null); this.app.toMenu(); };
    row.append(again, menu);
    inner.append(row);
    s.append(inner);
    this.root.append(s);
    this.screens.gameover = s;
    this.goInner = inner;
  };

  UI.showGameOver = function (win, g) {
    this.goTitle.textContent = win ? 'VICTORY' : 'DEFEAT';
    this.goTitle.style.color = win ? '#9cf07a' : '#ff8a8a';
    this.goSub.textContent = win ? 'The vale is yours. The garlic is safe.' : 'Your Keep has fallen... but garlic grows back.';
    const mins = Math.floor(g.time / 60) + ':' + String(Math.floor(g.time % 60)).padStart(2, '0');
    const stats = [
      ['Time', mins],
      ['Kills', g.stats.kills[0]],
      ['Lost', g.stats.lost[0]],
      ['Enemy killed', g.stats.lost[1]],
      ['Buildings', g.buildings.filter((b) => b.owner === 0).length],
      ['Difficulty', RTS.DIFFICULTY[g.difficultyId].name],
    ];
    this.goStats.innerHTML = '';
    stats.forEach(([l, n]) => {
      const d = el('div', 's panel');
      d.append(el('div', 'n', String(n)), el('div', 'l', l));
      this.goStats.append(d);
    });
    this.showScreen('gameover');
  };

  /* ---------- screens ---------- */
  UI.showScreen = function (name, from) {
    Object.keys(this.screens).forEach((k) => {
      this.screens[k].classList.toggle('show', k === name);
    });
    this.screen = name;
    if (name === 'help') this.helpReturn = from || (this.app.game ? 'game' : 'title');
    if (name) this.app.clearPlaceMode();
  };

  UI.pauseMenu = function (open) {
    if (!this.app.game || this.app.game.gameOver) return;
    if (open == null) open = this.screen !== 'pause';
    if (open) {
      this.app.paused = true;
      this.showScreen('pause');
    } else {
      this.app.paused = false;
      this.showScreen(null);
    }
  };

  UI.screenEscape = function () {
    if (this.screen === 'pause') this.pauseMenu(false);
    else if (this.screen === 'help') this.showScreen(this.helpReturn === 'game' ? null : this.helpReturn || 'title');
  };

  UI.toggleHelp = function () {
    if (this.screen === 'help') {
      this.showScreen(this.helpReturn === 'game' ? null : this.helpReturn || 'title');
      if (this.helpReturn === 'game') this.app.paused = false;
    } else {
      this.showScreen('help', this.app.game ? 'game' : 'title');
      if (this.app.game) this.app.paused = true;
    }
  };

  UI.toggleMute = function () {
    this.muted = !this.muted;
    this.app.sound.muted = this.muted;
    if (this.pauseMute) this.pauseMute.textContent = this.muted ? '🔇 Sound: Off' : '🔊 Sound: On';
    if (this.muteBtn) this.muteBtn.textContent = this.muted ? '🔇 Sound' : '🔊 Sound';
  };

  /* ---------- minimap interaction ---------- */
  UI.bindMinimap = function () {
    const c = this.mmCanvas;
    let dragging = false;
    const mmToWorld = (e) => {
      const r = c.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width;
      const my = (e.clientY - r.top) / r.height;
      const g = this.app.game;
      return { x: mx * (g ? g.worldW : RTS.WORLD_W), y: my * (g ? g.worldH : RTS.WORLD_H) };
    };
    c.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      dragging = true;
      c.setPointerCapture(e.pointerId);
      const w = mmToWorld(e);
      this.app.centerOnWorld(w.x, w.y);
    });
    c.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const w = mmToWorld(e);
      this.app.centerOnWorld(w.x, w.y);
    });
    c.addEventListener('pointerup', () => { dragging = false; });
    c.addEventListener('pointercancel', () => { dragging = false; });
  };

  /* ---------- per-frame refresh ---------- */
  UI.refresh = function (g, app) {
    // resources: cheap text updates only on change
    const set = (o, v) => { const s = String(v); if (o.val.textContent !== s) o.val.textContent = s; };
    const woodNow = Math.floor(g.res[0].wood);
    if (this._wood !== woodNow) { set(this.resWood, woodNow); this._wood = woodNow; }
    const foodNow = Math.floor(g.res[0].food);
    if (this._food !== foodNow) { set(this.resFood, foodNow); this._food = foodNow; }
    const popNow = g.pop[0] + '/' + g.supplyCap(0);
    if (this._pop !== popNow) {
      set(this.resPop, popNow);
      this._pop = popNow;
      this.resPop.n.classList.toggle('warn', g.pop[0] >= g.supplyCap(0));
    }
    const favNow = Math.floor(g.res[0].favor);
    if (this._fav !== favNow) { set(this.resAether, favNow); this._fav = favNow; }
    const fill = this.resAether.n.querySelector('.aether-fill');
    if (fill) fill.style.width = Math.round(g.res[0].favor) + '%';

    const tNow = g.formatTime();
    if (this._time !== tNow) { this.timerEl.textContent = tNow; this._time = tNow; }
    // mission countdown (The Long Tide)
    if (g.mission === 'flood') {
      const left = Math.max(0, 900 - g.time);
      const txt = '⏳ ' + Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0');
      if (this._missionTxt !== txt) {
        this._missionTxt = txt;
        this.missionEl.style.display = '';
        this.missionEl.textContent = txt;
        this.missionEl.style.color = left < 120 ? '#ff8a8a' : '';
      }
    } else if (this._missionTxt !== 'off') {
      this._missionTxt = 'off';
      this.missionEl.style.display = 'none';
    }

    this.layout();
    this.refreshLogs(g);
    this.refreshCard(g, app);
    this.refreshSelection(g, app);
    this.refreshAbilities(g, app);
    this.refreshMinimap(g, app);
    this.refreshActionButtons(g, app);
  };

  UI.layout = function (force) {
    const dock = this.dockEl;
    if (!dock) return;
    this._layoutTick = (this._layoutTick || 0) + 1;
    if (!force && this._layoutTick % 8 !== 0) return;
    const rect = dock.getBoundingClientRect();
    const fromBottom = Math.max(0, window.innerHeight - rect.top) + 6;
    const key = Math.round(fromBottom) + '|' + Math.round(rect.height) + '|' + (this.selPanel.classList.contains('show') ? 1 : 0);
    if (key === this._layoutKey) return;
    this._layoutKey = key;
    this.selPanel.style.bottom = fromBottom + 'px';
    this.logEl.style.bottom = fromBottom + 'px';
    const selH = this.selPanel.classList.contains('show') ? this.selPanel.getBoundingClientRect().height : 0;
    const hintBottom = fromBottom + (selH ? selH + 6 : 0);
    this.hintOffset = hintBottom;
    if (this.hintEl) this.hintEl.style.bottom = hintBottom + 'px';
  };

  UI.refreshLogs = function (g) {
    // pull log effects from game
    const logs = g.effects.filter((e) => e.type === 'log');
    const key = logs.map((l) => l.text).join('|');
    if (key === this._logKey) return;
    this._logKey = key;
    this.logEl.innerHTML = '';
    logs.slice(-4).forEach((l) => {
      const d = el('div', 'log ' + (l.kind || 'info'), l.text);
      this.logEl.append(d);
    });
  };

  UI.refreshActionButtons = function (g, app) {
    const units = g.selectedUnits().filter((u) => u.owner === 0);
    const hasWorker = units.some((u) => u.type === 'worker');
    this.btnBuild.n.style.display = hasWorker ? '' : 'none';
    this.btnAttack.n.style.display = units.length ? '' : 'none';
    this.btnStop.n.style.display = units.length ? '' : 'none';
    this.btnAttack.n.classList.toggle('sel', app.attackMode);
  };

  UI.clearCard = function () {
    if (this.cardEl.childElementCount) this.cardEl.innerHTML = '';
    this.cardEl.className = 'card three';
    this._cardKey = '';
  };

  UI.refreshCard = function (g, app) {
    const units = g.selectedUnits().filter((u) => u.owner === 0);
    const bs = g.selectedBuildings().filter((b) => b.owner === 0);
    let items = [];
    let cols = 3;

    if (bs.length === 1) {
      const b = bs[0];
      if (b.queue.length) {
        // show queue with cancel
        b.queue.forEach((q, i) => {
          items.push({
            key: 'q' + i + q.type,
            icon: this.unitIcon(q.type),
            label: RTS.UNITS[q.type].name,
            hot: null,
            sub: Math.round((q.time / q.total) * 100) + '%',
            onClick: () => g.cancelQueue(b, i),
          });
        });
      }
      if (b.def.trains) {
        b.def.trains.forEach((t, i) => {
          const def = RTS.UNITS[t];
          const cost = g.unitCost(t, 0);
          const locked = def.need && !g.buildings.some((x) => !x.dead && x.owner === 0 && x.type === def.need && x.progress >= 1);
          items.push({
            key: 't' + t,
            icon: this.unitIcon(t),
            label: def.name,
            hot: String(i + 1),
            cost: (cost.wood ? cost.wood + 'w ' : '') + (cost.food ? cost.food + 'f' : ''),
            disabled: locked,
            onClick: () => g.queueUnit(b, t),
          });
        });
      }
      if (b.def.buildable === false && b.type === 'keep') {
        // keep: nothing else
      }
    } else if (units.length) {
      if (units.some((u) => u.type === 'worker')) {
        RTS.buildingList.forEach((t, i) => {
          const def = RTS.BUILDINGS[t];
          items.push({
            key: 'b' + t,
            icon: this.buildIcon(t),
            label: def.name,
            hot: String(i + 1),
            cost: def.cost.wood + 'w',
            selected: app.mode === 'place' && app.placeType === t,
            disabled: g.res[0].wood < def.cost.wood,
            onClick: () => {
              if (app.mode === 'place' && app.placeType === t) app.cancelPlace();
              else app.enterPlaceMode(t);
            },
          });
        });
        if (app.mode === 'place') {
          items.push({
            key: 'cancelplace',
            icon: this.iconEl('plate', 26),
            label: 'Cancel',
            hot: 'esc',
            onClick: () => app.cancelPlace(),
          });
        }
      }
    } else if (app.mode === 'place' && app.placeType) {
      items.push({ key: 'cancel', icon: this.buildIcon(app.placeType), label: 'Cancel', hot: 'esc', onClick: () => app.cancelPlace() });
    }

    const key = items.map((i) => i.key + (i.disabled ? 'd' : '') + (i.selected ? 's' : '') + (i.sub || '')).join(',') + '|' + cols;
    if (key === this._cardKey) {
      // still update disabled states
      return;
    }
    this._cardKey = key;
    this.cardEl.innerHTML = '';
    this.cardEl.className = 'card ' + (items.length === 2 ? 'two' : 'three');
    if (!items.length) {
      this.cardEl.style.display = 'none';
      return;
    }
    this.cardEl.style.display = '';
    items.slice(0, 9).forEach((it) => {
      const b = el('button', 'cmd' + (it.selected ? ' sel' : ''));
      b.append(it.icon);
      b.append(el('span', null, it.label));
      if (it.hot) b.append(el('span', 'hot', it.hot));
      if (it.cost) b.append(el('span', 'cost', it.cost));
      if (it.sub) b.append(el('span', 'q', it.sub));
      b.disabled = !!it.disabled;
      b.onclick = () => { this.app.sound.play('click'); it.onClick(); };
      this.cardEl.append(b);
    });
  };

  UI.unitIcon = function (type) {
    const map = { worker: 'house', soldier: 'sword', archer: 'bow', knight: 'horse', siege: 'ram' };
    return this.iconEl(map[type] || 'sword', 26);
  };
  UI.cmdKey = function () { return this._cardKey; };
  UI.buildIcon = function (type) {
    const map = { farm: 'crop', barracks: 'house', tower: 'tower', workshop: 'tools' };
    return this.iconEl(map[type] || 'house', 26);
  };

  /* ---------- selection panel ---------- */
  UI.refreshSelection = function (g, app) {
    const units = g.selectedUnits();
    const bs = g.selectedBuildings();
    const key = (units.length ? 'u' + units.map((u) => u.id + ':' + Math.round(u.hp)).join(',') : '') +
      (bs.length ? 'b' + bs.map((b) => b.id + ':' + Math.round(b.hp) + ':' + Math.floor(b.progress * 99)).join(',') : '');
    if (!units.length && !bs.length) {
      if (this._selKey !== '') {
        this.selPanel.classList.remove('show');
        this.selPanel.innerHTML = '';
        this._selKey = '';
      }
      return;
    }
    this.selPanel.classList.add('show');
    if (key === this._selKey) return;
    this._selKey = key;
    this.selPanel.innerHTML = '';

    if (units.length === 1) {
      const u = units[0];
      const head = el('div', 'selhead');
      const nm = el('div', 'selname', u.def.name);
      nm.append(el('small', null, (u.owner === 0 ? 'Your' : 'Enemy') + ' unit'));
      head.append(nm);
      if (u.owner === 0) {
        const st = el('button', 'pbtn', 'Stop');
        st.style.minHeight = '30px';
        st.style.padding = '4px 8px';
        st.onclick = () => app.orderStopSelected();
        head.append(st);
      }
      this.selPanel.append(head);
      this.appendHp(u.hp, u.maxHp, u.owner === 0 ? '' : 'red');
      this.appendStats([
        ['DMG', Math.round(u.def.dmg + (u.bonusDmg || 0))],
        ['ARM', u.def.armor + (u.bonusArmor || 0)],
        ['RNG', Math.round(app.game.attackRangeOf(u))],
        ['SPD', Math.round(u.def.speed)],
      ]);
    } else if (units.length > 1) {
      const head = el('div', 'selhead');
      const nm = el('div', 'selname', units.length + ' units');
      head.append(nm);
      const st = el('button', 'pbtn', 'Stop');
      st.style.minHeight = '30px';
      st.style.padding = '4px 8px';
      st.onclick = () => app.orderStopSelected();
      head.append(st);
      this.selPanel.append(head);
      const counts = {};
      units.forEach((u) => { counts[u.type] = (counts[u.type] || 0) + 1; });
      const detail = Object.keys(counts).map((k) => RTS.UNITS[k].name + ' ×' + counts[k]).join('  ·  ');
      const d = el('div', 'selstats', detail);
      this.selPanel.append(d);
      const hp = units.reduce((a, u) => a + u.hp, 0);
      const mhp = units.reduce((a, u) => a + u.maxHp, 0);
      this.appendHp(hp, mhp, '');
    } else if (bs.length === 1) {
      const b = bs[0];
      const head = el('div', 'selhead');
      const nm = el('div', 'selname', b.def.name);
      nm.append(el('small', null, b.owner === 0 ? 'Your building' : 'Enemy building'));
      head.append(nm);
      this.selPanel.append(head);
      const low = b.hp / b.maxHp < 0.4;
      this.appendHp(b.hp, b.maxHp, low ? 'crit' : '');
      if (b.progress < 1) {
        const p = el('div', 'selstats', 'Building ' + Math.round(b.progress * 100) + '%');
        this.selPanel.append(p);
        const hb = el('div', 'hpbar blue');
        const i = el('i');
        i.style.width = Math.round(b.progress * 100) + '%';
        hb.append(i);
        this.selPanel.append(hb);
      }
      if (b.def.attack) {
        this.appendStats([['DMG', b.def.attack.dmg], ['RNG', b.def.attack.range]]);
      }
      if (b.def.produces) this.appendStats([['FOOD', 'producing']]);
    }
  };

  UI.appendHp = function (hp, maxHp, cls) {
    const bar = el('div', 'hpbar ' + (hp / maxHp < 0.35 ? 'crit' : hp / maxHp < 0.6 ? 'low' : '') + ' ' + (cls === 'red' ? '' : ''));
    const i = el('i');
    i.style.width = Math.max(0, Math.round((hp / maxHp) * 100)) + '%';
    bar.append(i);
    this.selPanel.append(bar);
  };

  UI.appendStats = function (pairs) {
    const d = el('div', 'selstats');
    pairs.forEach(([k, v]) => {
      const s = el('span', null, k + ' <b>' + v + '</b>');
      d.append(s);
    });
    this.selPanel.append(d);
  };

  /* ---------- abilities ---------- */
  UI.refreshAbilities = function (g, app) {
    const keys = g.abilitiesOf(0);
    const key = keys.join(',') + '|' + Math.ceil(g.abilityCd[0]) + '|' + Math.floor(g.res[0].favor) + '|' + app.mode;
    if (key === this._abilKey) return;
    this._abilKey = key;
    this.abilEl.innerHTML = '';
    keys.forEach((k, i) => {
      const ab = RTS.ABILITIES[k];
      const b = el('button', 'abil');
      b.append(this.iconEl(ab.icon, 30));
      const cost = el('span', 'cost', String(ab.cost));
      b.append(cost);
      const cd = Math.ceil(g.abilityCd[0]);
      if (cd > 0) {
        const ring = el('div', 'cdring');
        ring.style.transform = 'scaleY(' + Math.min(1, g.abilityCd[0] / ab.cd) + ')';
        b.append(ring);
        const cdTxt = el('span', 'cost', cd + 's');
        cdTxt.style.left = '3px';
        cdTxt.style.right = 'auto';
        b.append(cdTxt);
      } else {
        if (g.res[0].favor >= ab.cost) b.classList.add('ready');
      }
      b.title = ab.name + ' — ' + ab.desc;
      b.classList.toggle('sel', app.mode === 'ability' && app.abilityKey === k);
      b.disabled = g.abilityCd[0] > 0 || g.res[0].favor < ab.cost;
      b.onclick = () => this.castAbility(i);
      this.abilEl.append(b);
    });
  };

  UI.castAbility = function (i) {
    const g = this.app.game;
    if (!g) return;
    const keys = g.abilitiesOf(0);
    const k = keys[i];
    if (!k) return;
    const ab = RTS.ABILITIES[k];
    this.app.enterAbilityMode(k);
    if (this.app.mode !== 'ability') {
      this.toast(ab.name + ' unavailable: need ' + ab.cost + ' Aether');
      this.app.sound.play('deny');
    }
  };

  /* ---------- minimap ---------- */
  UI.refreshMinimap = function (g, app) {
    this._mmTick = (this._mmTick || 0) + 1;
    if (this._mmTick % 3 !== 0) return;
    const c = this.mmCanvas;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const sx = W / g.MW, sy = H / g.MH;
    if (!g.minimapCanvas) {
      const mc = document.createElement('canvas');
      mc.width = g.MW;
      mc.height = g.MH;
      const mctx = mc.getContext('2d');
      const img = mctx.createImageData(g.MW, g.MH);
      const pal = {
        0: [76, 140, 63], 1: [122, 97, 64], 2: [47, 110, 168], 3: [201, 176, 131],
        4: [63, 122, 52], 5: [107, 114, 128], 6: [139, 115, 80],
      };
      for (let i = 0; i < g.MW * g.MH; i++) {
        const p = pal[g.map.tiles[i]] || [76, 140, 63];
        img.data[i * 4] = p[0];
        img.data[i * 4 + 1] = p[1];
        img.data[i * 4 + 2] = p[2];
        img.data[i * 4 + 3] = 255;
      }
      mctx.putImageData(img, 0, 0);
      g.minimapCanvas = mc;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(g.minimapCanvas, 0, 0, W, H);
    // fog
    const step = 1;
    for (let ty = 0; ty < g.MH; ty++) {
      for (let tx = 0; tx < g.MW; tx++) {
        const f = g.fog[ty * g.MW + tx];
        if (f === 2) continue;
        ctx.fillStyle = f === 1 ? 'rgba(8,10,16,0.45)' : 'rgba(6,6,12,0.92)';
        ctx.fillRect(tx * sx, ty * sy, sx + 1, sy + 1);
      }
    }
    // buildings
    for (const b of g.buildings) {
      if (b.dead) continue;
      if (b.owner !== 0 && !g.visibleTile(Math.floor(b.x / RTS.TILE), Math.floor(b.y / RTS.TILE))) continue;
      ctx.fillStyle = b.owner === 0 ? '#5ab0ff' : '#ff6b4a';
      const s = Math.max(2, (b.w / RTS.TILE) * sx);
      ctx.fillRect(b.x / RTS.TILE * sx - s / 2, b.y / RTS.TILE * sy - s / 2, s, s);
    }
    // units
    for (const u of g.units) {
      if (u.dead) continue;
      if (u.owner !== 0 && !g.visible(u)) continue;
      ctx.fillStyle = u.owner === 0 ? '#bfe4ff' : '#ffb3a0';
      ctx.fillRect(u.x / RTS.TILE * sx - 1, u.y / RTS.TILE * sy - 1, u.owner === 0 ? 2 : 2, 2);
    }
    // camera rect
    const view = app.viewWorld();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(view.x / RTS.TILE * sx, view.y / RTS.TILE * sy, view.w / RTS.TILE * sx, view.h / RTS.TILE * sy);
  };

  /* ---------- hints ---------- */
  UI.hint = function (html, opts) {
    opts = opts || {};
    if (this.hintEl) this.hintEl.remove();
    const d = el('div', 'hint', html);
    this.root.append(d);
    this.hintEl = d;
    this._layoutKey = '';
    this.layout(true);
    if (this.hintOffset) d.style.bottom = this.hintOffset + 'px';
    if (opts.ms) setTimeout(() => { if (this.hintEl === d) { d.remove(); this.hintEl = null; } }, opts.ms);
    return d;
  };
  UI.clearHint = function () {
    if (this.hintEl) { this.hintEl.remove(); this.hintEl = null; }
  };

  /* ---------- toasts ---------- */
  UI.toast = function (text, ms) {
    const t = el('div', 'banner', text);
    this.root.append(t);
    setTimeout(() => {
      t.style.transition = 'opacity .4s';
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 420);
    }, ms || 1600);
  };
})();
