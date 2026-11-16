/* GARLIC WARS - data definitions */
(function () {
  'use strict';
  const RTS = window.RTS;

  /* ---------- Factions ---------- */
  const FACTIONS = (RTS.FACTIONS = [
    {
      id: 'everglen',
      name: 'Everglen',
      race: 'Humans',
      color: '#3f8fe0',
      color2: '#1f5c9e',
      accent: '#a8dcff',
      blurb: 'Balanced knights of the green vale. Sturdy and forgiving.',
      mods: { hp: 1.0, dmg: 1.0, speed: 1.0, cost: 1.0, range: 1.0 },
      playable: true,
    },
    {
      id: 'mirefen',
      name: 'Mirefen',
      race: 'Fungals',
      color: '#c4553b',
      color2: '#8a2f1f',
      accent: '#ffb59b',
      blurb: 'Swamp-born sporekin. Fragile, but swiftly grown and cheap.',
      mods: { hp: 0.9, dmg: 0.95, speed: 1.08, cost: 0.85, range: 1.0 },
      playable: true,
    },
    {
      id: 'ashen',
      name: 'Ashen',
      race: 'Ratkin',
      color: '#9b52d6',
      color2: '#5e2b8c',
      accent: '#e2b8ff',
      blurb: 'Scrap-lords of the ash wastes. Fast, clever, relentless.',
      mods: { hp: 0.95, dmg: 1.0, speed: 1.12, cost: 0.95, range: 1.05 },
      playable: true,
    },
  ]);
  RTS.factionById = (id) => FACTIONS.find((f) => f.id === id) || FACTIONS[0];

  /* ---------- Units ---------- */
  // role: builder | melee | ranged | siege | worker-combat
  const UNITS = (RTS.UNITS = {
    worker: {
      name: 'Peasant',
      key: 'W',
      hp: 46, dmg: 4, armor: 0, range: 6, cd: 1.0, speed: 46,
      cost: { food: 0, wood: 0 }, time: 9,
      hotkey: '1', desc: 'Gathers wood and food. Builds structures.',
      role: 'builder', supply: 1, vision: 110,
    },
    soldier: {
      name: 'Swordsman',
      key: 'S',
      hp: 100, dmg: 11, armor: 1, range: 7, cd: 1.0, speed: 40,
      cost: { food: 40, wood: 0 }, time: 13,
      hotkey: '2', desc: 'Tough melee front-liner for your first push.',
      role: 'melee', supply: 1, vision: 100,
    },
    archer: {
      name: 'Longbow',
      key: 'A',
      hp: 66, dmg: 9, armor: 0, range: 108, cd: 1.15, speed: 43,
      cost: { food: 30, wood: 30 }, time: 15,
      hotkey: '3', desc: 'Ranged attacker. Fragile but hits from afar.',
      role: 'ranged', supply: 1, vision: 150, projectile: 'arrow',
    },
    knight: {
      name: 'Lancer',
      key: 'K',
      hp: 170, dmg: 17, armor: 3, range: 9, cd: 1.1, speed: 54,
      cost: { food: 70, wood: 20 }, time: 20,
      hotkey: '4', desc: 'Armoured shock cavalry. Crushes infantry.',
      role: 'melee', supply: 2, vision: 120, need: 'barracks',
    },
    siege: {
      name: 'Battleram',
      key: 'B',
      hp: 230, dmg: 46, armor: 2, range: 14, cd: 2.4, speed: 24,
      cost: { food: 20, wood: 110 }, time: 26,
      hotkey: '5', desc: 'Slow siege engine. Smashes buildings.',
      role: 'siege', supply: 3, vision: 110, need: 'workshop', siegeBonus: 3.2,
    },
  });
  RTS.unitList = ['worker', 'soldier', 'archer', 'knight', 'siege'];

  /* ---------- Buildings ---------- */
  const BUILDINGS = (RTS.BUILDINGS = {
    keep: {
      name: 'Keep',
      hp: 1500, armor: 4, w: 44, h: 44,
      cost: { food: 0, wood: 0 }, time: 40,
      hotkey: '1', desc: 'Your fortress. Train peasants here. If it falls, you lose.',
      supply: 12, trains: ['worker'], buildable: false, vision: 200,
    },
    farm: {
      name: 'Farm',
      hp: 200, armor: 1, w: 26, h: 26,
      cost: { food: 0, wood: 40 }, time: 12,
      hotkey: '2', desc: 'Produces food over time. Build many farms.',
      supply: 6, buildable: true, vision: 70, produces: 'food', rate: 1.7,
    },
    barracks: {
      name: 'Barracks',
      hp: 520, armor: 2, w: 34, h: 34,
      cost: { food: 0, wood: 110 }, time: 22,
      hotkey: '3', desc: 'Trains swordsmen, longbows and lancers.',
      supply: 5, trains: ['soldier', 'archer', 'knight'], buildable: true, vision: 110,
    },
    tower: {
      name: 'Watchtower',
      hp: 380, armor: 3, w: 22, h: 22,
      cost: { food: 0, wood: 90 }, time: 16,
      hotkey: '4', desc: 'Fires arrows at nearby enemies. Great vs raids.',
      supply: 2, buildable: true, vision: 200, attack: { dmg: 9, range: 118, cd: 1.1, projectile: 'arrow' },
    },
    workshop: {
      name: 'Workshop',
      hp: 420, armor: 2, w: 32, h: 32,
      cost: { food: 0, wood: 140 }, time: 26,
      hotkey: '5', desc: 'Builds battlerams and researches upgrades.',
      supply: 3, trains: ['siege'], buildable: true, vision: 100,
    },
  });
  RTS.buildingList = ['farm', 'barracks', 'tower', 'workshop'];

  /* ---------- Upgrades ---------- */
  const UPGRADES = (RTS.UPGRADES = {
    tools: {
      name: 'Iron Tools', icon: 'tools',
      cost: { food: 0, wood: 100 }, time: 25, need: 'workshop',
      desc: 'Melee damage +3, siege damage +10.',
    },
    plate: {
      name: 'Plating', icon: 'plate',
      cost: { food: 0, wood: 120 }, time: 28, need: 'workshop',
      desc: 'All units +2 armour.',
    },
    fletch: {
      name: 'Fletching', icon: 'fletch',
      cost: { food: 0, wood: 110 }, time: 26, need: 'workshop',
      desc: 'Ranged damage +4 and +20 range.',
    },
    crop: {
      name: 'Crop Rotation', icon: 'crop',
      cost: { food: 60, wood: 60 }, time: 24, need: 'farm',
      desc: 'Farms yield 60% more food.',
    },
  });

  /* ---------- Faction abilities (god powers) ---------- */
  const ABILITIES = (RTS.ABILITIES = {
    rally: {
      name: 'Rally', icon: 'rally', cost: 24, cd: 45, radius: 105,
      desc: 'Nearby units mend and fight 40% faster for 9s.',
    },
    meteor: {
      name: 'Starfall', icon: 'meteor', cost: 38, cd: 60, radius: 66,
      desc: 'Call down burning rock on an area. 70 damage, hurts buildings.',
      needsGround: true,
    },
    rally2: {
      name: 'Haste', icon: 'rally', cost: 20, cd: 40, radius: 95,
      desc: 'Speed and attack cadence +50% for 9s.',
    },
    spore: {
      name: 'Spore Burst', icon: 'spore', cost: 30, cd: 45, radius: 84,
      desc: 'Toxic spores poison enemies (8 dmg/s for 6s).',
    },
    burrow: {
      name: 'Burrow', icon: 'burrow', cost: 26, cd: 50, radius: 28,
      desc: 'Selected units tunnel underground and surface at the target.',
      needsUnits: true, needsGround: true,
    },
    shrapnel: {
      name: 'Shrapnel', icon: 'meteor', cost: 34, cd: 55, radius: 58,
      desc: 'Scrap shrapnel wounds enemies and hurts buildings.',
      needsGround: true,
    },
  });

  const ABILITY_SETS = (RTS.ABILITY_SETS = {
    everglen: ['rally', 'meteor'],
    mirefen: ['rally2', 'spore'],
    ashen: ['burrow', 'shrapnel'],
  });

  /* ---------- Mission ---------- */
  RTS.MISSIONS = {
    skirmish: {
      name: 'Skirmish',
      desc: 'Destroy the enemy Keep. Classic RTS duel.',
      startingWood: 150,
    },
    flood: {
      name: 'The Long Tide',
      desc: 'Strike the enemy Keep before raiders mass at 9 minutes.',
      startingWood: 170,
      aiRush: true,
    },
  };

  RTS.MAX_POP = 120;
  RTS.DIFFICULTY = {
    // economy is symmetric; difficulty changes how hard & how often the rival pushes
    recruit: { name: 'Recruit', gather: 0.85, aggro: 0.8, wave: 0.8, apm: 0.8, firstWave: 300, workers: 6, powers: 0 }, // powers: 0 none, 1 rare, 2 often
    veteran: { name: 'Veteran', gather: 1.0, aggro: 1.0, wave: 1.0, apm: 1.0, firstWave: 215, workers: 8, powers: 1 },
    warlord: { name: 'Warlord', gather: 1.1, aggro: 1.2, wave: 1.2, apm: 1.15, firstWave: 155, workers: 9, powers: 2 },
  };
})();
