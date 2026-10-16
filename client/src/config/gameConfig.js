/**
 * Centralized Game Configuration for VOID HUNTER
 * Driven by environment variables according to Section 4 specifications.
 */

export const GAME_NAME = import.meta.env.VITE_GAME_NAME || 'VOID HUNTER';
export const GAME_TAGLINE = import.meta.env.VITE_GAME_TAGLINE || 'Space Combat Beyond Limits';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const GAME_VERSION = 'v1.0.0';

// 5 Sectors across 50 Missions
export const SECTORS = [
  { id: 'sector-1', name: 'Nebula Outpost', missionCount: 10, theme: 'nebula', boss: 'Orion Dreadnought' },
  { id: 'sector-2', name: 'Dark Orbit', missionCount: 10, theme: 'orbit', boss: 'Crimson Colossus' },
  { id: 'sector-3', name: 'Asteroid Belt', missionCount: 10, theme: 'asteroid', boss: 'Glacial Leviathan' },
  { id: 'sector-4', name: 'Void Rift', missionCount: 10, theme: 'rift', boss: 'Rift Annihilator' },
  { id: 'sector-5', name: 'Final Frontier', missionCount: 10, theme: 'void', boss: 'Void Overlord' }
];

// 5 Ship Classes matching UI Design
export const SHIP_CLASSES = [
  {
    id: 'v01-orbitron',
    code: 'V-01',
    name: 'ORBITRON',
    classType: 'Interceptor',
    tagline: 'Balanced Fighter',
    description: 'A versatile starfighter with balanced attack, defense, and maneuverability.',
    baseStats: { firepower: 78, shield: 64, speed: 82, maneuver: 76 },
    unlockedByDefault: true,
    priceCredits: 0,
    priceCores: 0
  },
  {
    id: 's02-phoenix',
    code: 'S-02',
    name: 'PHOENIX',
    classType: 'Striker',
    tagline: 'High Damage',
    description: 'Armed with supercharged plasma cannons that devastate armored cruisers.',
    baseStats: { firepower: 94, shield: 50, speed: 75, maneuver: 70 },
    unlockedByDefault: false,
    priceCredits: 2500,
    priceCores: 15
  },
  {
    id: 'x03-shadow',
    code: 'X-03',
    name: 'SHADOW',
    classType: 'Interceptor',
    tagline: 'High Speed',
    description: 'Ultra-lightweight reconnaissance craft capable of lightning-fast evasive maneuvers.',
    baseStats: { firepower: 72, shield: 55, speed: 96, maneuver: 92 },
    unlockedByDefault: false,
    priceCredits: 4000,
    priceCores: 25
  },
  {
    id: 'r04-titan',
    code: 'R-04',
    name: 'TITAN',
    classType: 'Guardian',
    tagline: 'Heavy Armor',
    description: 'Reinforced hull plating and reinforced deflector shields that absorb tremendous impact.',
    baseStats: { firepower: 85, shield: 98, speed: 55, maneuver: 52 },
    unlockedByDefault: false,
    priceCredits: 6500,
    priceCores: 40
  },
  {
    id: 'z05-nova',
    code: 'Z-05',
    name: 'NOVA',
    classType: 'Experimental',
    tagline: 'Special Abilities',
    description: 'Prototype dimensional drive with dark matter weaponry and quantum emergency warp.',
    baseStats: { firepower: 92, shield: 84, speed: 88, maneuver: 85 },
    unlockedByDefault: false,
    priceCredits: 10000,
    priceCores: 75
  }
];

// 8 Mandatory Power-ups
export const POWER_UPS = [
  { id: 'shield_pulse', name: 'Shield Pulse', duration: 8, cooldown: 25, icon: 'shield' },
  { id: 'rapid_fire', name: 'Rapid Fire', duration: 10, cooldown: 20, icon: 'zap' },
  { id: 'spread_shot', name: 'Spread Shot', duration: 12, cooldown: 22, icon: 'crosshair' },
  { id: 'homing_missiles', name: 'Homing Missiles', duration: 8, cooldown: 30, icon: 'target' },
  { id: 'emp_blast', name: 'EMP Blast', duration: 1, cooldown: 35, icon: 'radio' },
  { id: 'repair_drone', name: 'Repair Drone', duration: 6, cooldown: 40, icon: 'wrench' },
  { id: 'overdrive', name: 'Overdrive', duration: 10, cooldown: 45, icon: 'flame' },
  { id: 'emergency_warp', name: 'Emergency Warp', duration: 2, cooldown: 50, icon: 'navigation' }
];

export default {
  GAME_NAME,
  GAME_TAGLINE,
  API_BASE_URL,
  GAME_VERSION,
  SECTORS,
  SHIP_CLASSES,
  POWER_UPS
};
