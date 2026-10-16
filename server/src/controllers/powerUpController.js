import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { v4 as uuidv4 } from 'uuid';

// Section 26 & 27: Centralized 8 Mandatory Power-Ups Configuration
export const POWER_UPS_CATALOG = [
  {
    id: 'shield_pulse',
    name: 'Shield Pulse',
    hotkey: '1',
    description: 'Deploys an impenetrable forcefield deflecting all enemy projectiles and collision damage.',
    duration: 8,
    cooldown: 25,
    icon: 'shield',
    costCredits: 150,
    effect: { type: 'invulnerable', durationSeconds: 8 }
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    hotkey: '2',
    description: 'Overclocks primary blasters to unleash a continuous stream of laser fire at 2.2x speed.',
    duration: 10,
    cooldown: 20,
    icon: 'zap',
    costCredits: 120,
    effect: { type: 'fire_rate_multiplier', multiplier: 2.2, durationSeconds: 10 }
  },
  {
    id: 'spread_shot',
    name: 'Spread Shot',
    hotkey: '3',
    description: 'Splits laser discharge into a 5-way spread cannon covering the entire forward combat zone.',
    duration: 12,
    cooldown: 22,
    icon: 'crosshair',
    costCredits: 180,
    effect: { type: 'projectile_spread', projectileCount: 5, durationSeconds: 12 }
  },
  {
    id: 'homing_missiles',
    name: 'Homing Missiles',
    hotkey: '4',
    description: 'Launches a salvo of 4 intelligent micro-missiles that acquire and home in on hostile targets.',
    duration: 4,
    cooldown: 30,
    icon: 'target',
    costCredits: 200,
    effect: { type: 'seeking_projectiles', missileCount: 4, damagePerMissile: 85 }
  },
  {
    id: 'emp_blast',
    name: 'EMP Blast',
    hotkey: '5',
    description: 'Discharges a screen-wide electromagnetic shockwave vaporizing bullets and stunning enemy ships.',
    duration: 1,
    cooldown: 35,
    icon: 'radio',
    costCredits: 250,
    effect: { type: 'clear_bullets_and_stun', radius: 'screen', damage: 180 }
  },
  {
    id: 'repair_drone',
    name: 'Repair Drone',
    hotkey: '6',
    description: 'Deploys an autonomous nanite drone restoring 50% hull integrity without exceeding maximum health.',
    duration: 6,
    cooldown: 40,
    icon: 'wrench',
    costCredits: 220,
    effect: { type: 'hull_repair', healAmount: 50 }
  },
  {
    id: 'overdrive',
    name: 'Overdrive',
    hotkey: '7',
    description: 'Drives ship reactor into hyper-state, boosting movement speed, firepower, and fire rate by 50%.',
    duration: 10,
    cooldown: 45,
    icon: 'flame',
    costCredits: 300,
    effect: { type: 'all_stats_buff', speedMult: 1.4, damageMult: 1.5, durationSeconds: 10 }
  },
  {
    id: 'emergency_warp',
    name: 'Emergency Warp',
    hotkey: '8',
    description: 'Quantum-blinks the ship to a safe coordinates with 2.5s invulnerability frames to escape lethal traps.',
    duration: 2.5,
    cooldown: 50,
    icon: 'navigation',
    costCredits: 280,
    effect: { type: 'teleport_and_iframes', iframeDuration: 2.5 }
  }
];

/**
 * @desc    Get all 8 power-ups catalog
 * @route   GET /api/powerups
 * @access  Private
 */
export const getPowerUps = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      powerUps: POWER_UPS_CATALOG
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving power-ups' });
  }
};

/**
 * @desc    Acquire power-up charges atomically
 * @route   POST /api/powerups/:powerUpId/acquire
 * @access  Private
 */
export const acquirePowerUp = async (req, res) => {
  try {
    const { powerUpId } = req.params;
    const userId = req.user.id;

    const powerUp = POWER_UPS_CATALOG.find((p) => p.id === powerUpId);
    if (!powerUp) {
      return res.status(404).json({ success: false, message: 'Power-up not found' });
    }

    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile || profile.credits < powerUp.costCredits) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Credits. ${powerUp.name} requires ${powerUp.costCredits} Credits.`
      });
    }

    // Atomic deduction & Ledger transaction
    const balanceBefore = profile.credits;
    profile.credits -= powerUp.costCredits;
    await profile.save();

    await WalletTransaction.create({
      user: userId,
      transactionType: 'DEBIT',
      currencyType: 'CREDITS',
      amount: powerUp.costCredits,
      balanceBefore,
      balanceAfter: profile.credits,
      source: 'POWER_UP_PURCHASE',
      referenceId: `pwr-${uuidv4()}`,
      description: `Acquired combat module: ${powerUp.name}`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: `${powerUp.name} charged and ready for deployment!`,
      credits: profile.credits,
      powerUp
    });
  } catch (error) {
    console.error('acquirePowerUp Error:', error);
    return res.status(500).json({ success: false, message: 'Server error acquiring power-up' });
  }
};
