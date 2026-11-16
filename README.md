# Garlic Wars

A complete 2D pixel-art **real-time strategy** game that runs in the browser — no frameworks, no build step, no image assets. Every sprite, tile and icon is drawn procedurally on a `<canvas>` at load time, and the whole thing is designed to be played with a thumb on a phone as well as with mouse and keyboard on a desktop.

> Hold the vale, harvest the garlic, and knock down the rival Keep.

## Play

```bash
# any static server works
python3 -m http.server 5173
# then open http://localhost:5173
```

Open `index.html` directly is *not* recommended (some browsers block module-free scripts from `file://` inconsistently) — use a tiny static server or deploy to Vercel.

## Features

**Gameplay**
- Classic RTS economy: peasants harvest **wood** from trees and **Aether** from gold veins, **farms** produce food and raise population.
- 5 unit types (Peasant, Swordsman, Longbow, Lancer, Battleram), 5 buildings (Keep, Farm, Barracks, Watchtower, Workshop).
- 4 research upgrades, per-faction abilities ("god powers"), fog of war, control groups, rally points, A* pathfinding with unit separation.
- Three factions with different stats and two signature powers each, three difficulty levels where the AI's aggression (not its cheats) ramps up.
- Skirmish and *The Long Tide* missions; victory/defeat screens with match stats.

**Controls**
| Action | Touch | Mouse / keys |
| --- | --- | --- |
| Select | tap unit/building | left click |
| Box select | long press + drag | left drag |
| Command | tap ground / enemy | right click |
| Pan | two-finger drag | `WASD`, arrows, middle-drag |
| Zoom | pinch | mouse wheel |
| Groups | quick-rail buttons | `Ctrl/⌘+1…9`, `Shift+1…9` |
| Modes | command deck | `1`–`5` build/train, `Z`/`X` powers, `S` stop, `Space` pause, `H` base, `Esc` cancel |

**Presentation**
- Hand-authored pixel art generated in code: 3 faction palettes, animated trees/water/flags, damage flashes, projectiles, meteors, spores.
- Baked, dithered terrain layer with biome borders and shoreline foam; canvas is rendered at a reduced device-pixel ratio on large screens so the pixels stay chunky and the frame rate stays high.
- Mobile-first HUD: resource bar, timestamp, quick-select rail, contextual command card, floating selection panel, pinch-zoom minimap, pointer-events-safe UI that never blocks the battlefield.
- Procedural sound effects via WebAudio (no audio files), mute toggle, fullscreen/orientation helpers, portrait "rotate your phone" hint.

## Project layout

```
index.html          shell + script order
styles.css          pixel UI, responsive/mobile layout, safe-area insets
js/lib.js           math, PRNG, noise, tiny WebAudio synth
js/data.js          factions, units, buildings, upgrades, powers, missions
js/sprite.js        procedural pixel art (units, buildings, props, icons)
js/map.js           terrain generation, props, biome painting helpers
js/game.js          simulation: economy, combat, pathfinding, fog, AI
js/input.js         pointer/touch/keyboard handling
js/ui.js            DOM HUD, screens, command cards, minimap
js/render.js        canvas renderer, terrain baking, effects
js/main.js          app controller, camera, game loop
test/               headless simulation + balance tests
```

## Tests

The simulation is DOM-free so it can run in Node:

```bash
node test/sim_test.js                 # runs the AI against idle players
node test/bot_test.js veteran 900 42  # a scripted "human" plays a full match
```

## Difficulty, as measured

The AI is a scripted opponent that runs an economy, expands housing, masses armies, defends its base, researches and casts powers. Its *strategy* is the same on every level; difficulty only changes how hard and how often it pushes (and it may only gather slightly faster on Warlord).

`test/bot_test.js` plays complete matches with a simple scripted "human":

| Difficulty | Result for the scripted proxy |
| --- | --- |
| Recruit | usually wins (3/3 in the last runs) |
| Veteran | roughly even, losses come from early barrack snipes |
| Warlord | almost always loses — a real player needs maps, towers and timing |

## Deployment

The repo is a static site (no build step, no dependencies).

- **Vercel**: import the repo, choose **Other** as the framework, and leave the build command and output directory empty. `vercel.json` already sets safe headers.
- **Anything else**: copy the repository root behind any static host. There is no server-side code.
