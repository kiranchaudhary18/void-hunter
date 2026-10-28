/**
 * Client Quests & Achievements Data Catalog (Section 31 & Screen 9 Specifications)
 */

export const DAILY_QUESTS_CATALOG = [
  {
    id: 'quest-interceptors',
    title: 'Vanguard Annihilation',
    description: 'Destroy 20 hostile enemy starfighters in combat missions.',
    target: 20,
    metric: 'enemiesDestroyed',
    rewards: { credits: 200, xp: 50 }
  },
  {
    id: 'quest-missions',
    title: 'Sector Patrol Duty',
    description: 'Successfully complete 3 sector combat missions.',
    target: 3,
    metric: 'missionsCompleted',
    rewards: { credits: 250, energyCores: 1, xp: 75 }
  },
  {
    id: 'quest-ad',
    title: 'Comms Uplink',
    description: 'Watch 1 verified sponsor transmission in the rewards wallet or combat.',
    target: 1,
    metric: 'adsWatched',
    rewards: { credits: 150, xp: 25 }
  },
  {
    id: 'quest-score',
    title: 'High-Caliber Ace',
    description: 'Achieve 15,000 score in a single mission deployment.',
    target: 15000,
    metric: 'highestScore',
    rewards: { credits: 300, energyCores: 2, xp: 100 }
  }
];

export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'ach-first-blood',
    name: 'First Blood',
    description: 'Eliminate your first hostile starfighter in active combat.',
    category: 'COMBAT',
    icon: 'Crosshair',
    rewards: { credits: 100, xp: 50 }
  },
  {
    id: 'ach-fleet-commander',
    name: 'Fleet Commander',
    description: 'Commission all 5 ship classes into your operational hangar roster.',
    category: 'HANGAR',
    icon: 'Shield',
    rewards: { credits: 800, energyCores: 5, xp: 300 }
  },
  {
    id: 'ach-apex-hunter',
    name: 'Apex Hunter',
    description: 'Defeat your first Sector Boss encounter in multi-phase battle.',
    category: 'BOSS',
    icon: 'Skull',
    rewards: { credits: 600, energyCores: 5, xp: 250 }
  },
  {
    id: 'ach-sector-conqueror',
    name: 'Sector Conqueror',
    description: 'Complete all 10 missions in Sector 1: Nebula Outpost.',
    category: 'CAMPAIGN',
    icon: 'Compass',
    rewards: { credits: 500, energyCores: 3, xp: 200 }
  },
  {
    id: 'ach-star-collector',
    name: 'Star Collector',
    description: 'Accumulate 30 campaign stars across sector operations.',
    category: 'STARS',
    icon: 'Star',
    rewards: { credits: 450, energyCores: 3, xp: 150 }
  },
  {
    id: 'ach-overdrive',
    name: 'Maximum Overdrive',
    description: 'Upgrade any starship module track to Level 5.',
    category: 'UPGRADES',
    icon: 'Zap',
    rewards: { credits: 400, energyCores: 2, xp: 150 }
  },
  {
    id: 'ach-ad-enthusiast',
    name: 'Comms Operator',
    description: 'Watch 5 verified rewarded ad transmissions.',
    category: 'REWARDS',
    icon: 'Video',
    rewards: { credits: 300, xp: 100 }
  },
  {
    id: 'ach-sharpshooter',
    name: 'Sharpshooter',
    description: 'Complete a combat mission with 80% or higher laser accuracy.',
    category: 'COMBAT',
    icon: 'Target',
    rewards: { credits: 350, energyCores: 1, xp: 120 }
  },
  {
    id: 'ach-void-sovereign',
    name: 'Void Sovereign',
    description: 'Complete Mission 50 and defeat the Final Frontier boss: Void Overlord.',
    category: 'APEX',
    icon: 'Award',
    rewards: { credits: 2500, energyCores: 20, xp: 1000 }
  },
  {
    id: 'ach-credit-baron',
    name: 'Credit Baron',
    description: 'Accumulate an active balance of at least 2,500 Credits in your ledger.',
    category: 'ECONOMY',
    icon: 'Coins',
    rewards: { credits: 500, energyCores: 5, xp: 200 }
  }
];

export const DAILY_LOGIN_STREAK_REWARDS = [
  { day: 1, credits: 100, cores: 0, coins: 0, label: 'Day 1: Scout Supply', icon: 'Package' },
  { day: 2, credits: 150, cores: 1, coins: 0, label: 'Day 2: Core Infusion', icon: 'Zap' },
  { day: 3, credits: 200, cores: 1, coins: 0, label: 'Day 3: Weapon Battery', icon: 'Crosshair' },
  { day: 4, credits: 250, cores: 2, coins: 0, label: 'Day 4: Shield Booster', icon: 'Shield' },
  { day: 5, credits: 350, cores: 2, coins: 0, label: 'Day 5: Plasma Crate', icon: 'Flame' },
  { day: 6, credits: 500, cores: 3, coins: 5, label: 'Day 6: Apex Shipment', icon: 'Sparkles' },
  { day: 7, credits: 1000, cores: 5, coins: 25, label: 'Day 7: Imperial Mystery Crate Jackpot', icon: 'Gift', isMysteryCrate: true }
];
