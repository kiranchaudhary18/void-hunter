/**
 * Master Data-Driven 50 Missions Catalog (Sections 14-17 Specifications)
 * 5 Sectors x 10 Missions = 50 Playable Missions with 7 distinct objective archetypes
 * and 5 original multi-phase boss encounters.
 */

export const SECTORS_LIST = [
  { id: 'sector-1', name: 'Nebula Outpost', range: '01 - 10', theme: 'nebula', boss: 'Orion Dreadnought' },
  { id: 'sector-2', name: 'Dark Orbit', range: '11 - 20', theme: 'orbit', boss: 'Crimson Colossus' },
  { id: 'sector-3', name: 'Asteroid Belt', range: '21 - 30', theme: 'asteroid', boss: 'Glacial Leviathan' },
  { id: 'sector-4', name: 'Void Rift', range: '31 - 40', theme: 'rift', boss: 'Rift Annihilator' },
  { id: 'sector-5', name: 'Final Frontier', range: '41 - 50', theme: 'void', boss: 'Void Overlord' }
];

export const BOSS_ENCOUNTERS = {
  'boss-orion': {
    id: 'boss-orion',
    name: 'ORION DREADNOUGHT',
    sector: 'Nebula Outpost',
    hp: 1200,
    phases: 2,
    textureKey: 'boss_orion',
    attackPatterns: ['twin_laser_battery', 'missile_salvo', 'escort_summon'],
    rewards: { credits: 400, xp: 250, energyCores: 5 }
  },
  'boss-colossus': {
    id: 'boss-colossus',
    name: 'CRIMSON COLOSSUS',
    sector: 'Dark Orbit',
    hp: 2200,
    phases: 2,
    textureKey: 'boss_colossus',
    attackPatterns: ['plasma_shockwave', 'radial_turrets', 'ramming_charge'],
    rewards: { credits: 600, xp: 400, energyCores: 8 }
  },
  'boss-leviathan': {
    id: 'boss-leviathan',
    name: 'GLACIAL LEVIATHAN',
    sector: 'Asteroid Belt',
    hp: 3500,
    phases: 2,
    textureKey: 'boss_leviathan',
    attackPatterns: ['spiral_bullet_storm', 'ice_shard_sniper', 'freeze_beam'],
    rewards: { credits: 850, xp: 600, energyCores: 12 }
  },
  'boss-rift': {
    id: 'boss-rift',
    name: 'RIFT ANNIHILATOR',
    sector: 'Void Rift',
    hp: 5000,
    phases: 3,
    textureKey: 'boss_rift',
    attackPatterns: ['quantum_teleport', 'antimatter_burst', 'rift_tendrils'],
    rewards: { credits: 1200, xp: 850, energyCores: 18 }
  },
  'boss-overlord': {
    id: 'boss-overlord',
    name: 'VOID OVERLORD',
    sector: 'Final Frontier',
    hp: 7500,
    phases: 3,
    textureKey: 'boss_overlord',
    attackPatterns: ['bullet_hell_omega', 'dark_matter_collapse', 'hyper_laser_sweep'],
    rewards: { credits: 2500, xp: 1500, energyCores: 30 }
  }
};

// Procedurally generate the structured 50-mission matrix
const MISSION_TEMPLATES = [
  { name: 'Recon', objectiveType: 'destroy_enemies', target: 12, label: 'Destroy 12 scout probes' },
  { name: 'Patrol', objectiveType: 'survive_duration', target: 35, label: 'Patrol airspace for 35s' },
  { name: 'Eliminate', objectiveType: 'destroy_enemies', target: 18, label: 'Eliminate 18 hostile craft' },
  { name: 'Survive', objectiveType: 'survive_duration', target: 45, label: 'Survive ambush for 45s' },
  { name: 'Escort', objectiveType: 'protect_target', target: 80, label: 'Escort allied supply convoy' },
  { name: 'Assault', objectiveType: 'destroy_enemies', target: 24, label: 'Assault heavy strike wing' },
  { name: 'Defend', objectiveType: 'limited_damage', target: 70, label: 'Defend sector with hull > 70%' },
  { name: 'Interception', objectiveType: 'time_attack', target: 50, label: 'Intercept fleet in under 50s' },
  { name: 'Boss Prep', objectiveType: 'collect_items', target: 6, label: 'Collect 6 energy core pods' },
  { name: 'Sector Boss', objectiveType: 'defeat_boss', target: 1, label: 'Defeat the Sector Flagship' }
];

export const MISSIONS_CATALOG = [];

SECTORS_LIST.forEach((sector, sIdx) => {
  const sectorNum = sIdx + 1;
  const bossIdMap = {
    1: 'boss-orion',
    2: 'boss-colossus',
    3: 'boss-leviathan',
    4: 'boss-rift',
    5: 'boss-overlord'
  };

  for (let mIdx = 0; mIdx < 10; mIdx++) {
    const seq = mIdx + 1;
    const globalSeq = sIdx * 10 + seq;
    const template = MISSION_TEMPLATES[mIdx];
    const isBossMission = seq === 10;
    const boss = isBossMission ? BOSS_ENCOUNTERS[bossIdMap[sectorNum]] : null;

    const baseCredits = 80 + globalSeq * 15;
    const baseXP = 40 + globalSeq * 10;

    MISSIONS_CATALOG.push({
      id: `sector-${sectorNum}-mission-${seq}`,
      sectorId: sector.id,
      sectorName: sector.name,
      sequence: seq,
      globalSequence: globalSeq,
      name: isBossMission ? `${sector.boss}` : `${template.name}`,
      subtitle: `SECTOR ${sectorNum} // MISSION ${seq < 10 ? '0' + seq : seq}`,
      difficulty: globalSeq <= 10 ? 'normal' : globalSeq <= 30 ? 'hard' : 'expert',
      objective: {
        type: template.objectiveType,
        target: template.target,
        label: isBossMission ? `Defeat ${sector.boss}` : template.label
      },
      boss: boss,
      wavesCount: isBossMission ? 2 : Math.min(5, 3 + Math.floor(seq / 3)),
      rewards: {
        credits: isBossMission ? boss.rewards.credits : baseCredits,
        xp: isBossMission ? boss.rewards.xp : baseXP,
        energyCores: isBossMission ? boss.rewards.energyCores : (seq % 3 === 0 ? 1 : 0)
      },
      unlockedByDefault: globalSeq === 1 // Only mission 1 is unlocked initially (Section 18)
    });
  }
});

export default {
  SECTORS_LIST,
  BOSS_ENCOUNTERS,
  MISSIONS_CATALOG
};
