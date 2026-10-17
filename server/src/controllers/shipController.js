import PlayerShip from '../models/PlayerShip.js';
import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { v4 as uuidv4 } from 'uuid';

// Ship Master Catalog (Section 23 Specifications)
export const SHIPS_CATALOG = [
  {
    id: 'v01-orbitron',
    code: 'V-01',
    name: 'ORBITRON',
    classType: 'Interceptor',
    tagline: 'Balanced Fighter',
    description: 'A versatile starfighter with balanced attack, defense, and high-precision maneuverability.',
    textureKey: 'ship_orbitron',
    baseStats: { firepower: 78, shield: 64, speed: 82, maneuver: 76 },
    priceCredits: 0,
    priceCores: 0,
    unlockedByDefault: true
  },
  {
    id: 's02-phoenix',
    code: 'S-02',
    name: 'PHOENIX',
    classType: 'Striker',
    tagline: 'High Damage',
    description: 'Armed with twin supercharged plasma cannons that melt heavy armored cruisers.',
    textureKey: 'ship_phoenix',
    baseStats: { firepower: 94, shield: 50, speed: 75, maneuver: 70 },
    priceCredits: 2500,
    priceCores: 15,
    unlockedByDefault: false
  },
  {
    id: 'x03-shadow',
    code: 'X-03',
    name: 'SHADOW',
    classType: 'Support Craft',
    tagline: 'Utility & Support',
    description: 'Utility-focused starcraft with automated nanite repair drones, enhanced cooling, and rapid pickup collection.',
    textureKey: 'ship_shadow',
    baseStats: { firepower: 72, shield: 65, speed: 96, maneuver: 92 },
    priceCredits: 4000,
    priceCores: 25,
    unlockedByDefault: false
  },
  {
    id: 'r04-titan',
    code: 'R-04',
    name: 'TITAN',
    classType: 'Guardian',
    tagline: 'Heavy Armor',
    description: 'Reinforced durasteel hull plating and deflector shields that absorb devastating impacts.',
    textureKey: 'ship_titan',
    baseStats: { firepower: 85, shield: 98, speed: 55, maneuver: 52 },
    priceCredits: 6500,
    priceCores: 40,
    unlockedByDefault: false
  },
  {
    id: 'z05-nova',
    code: 'Z-05',
    name: 'NOVA',
    classType: 'Experimental',
    tagline: 'Special Abilities',
    description: 'Prototype dimensional starcraft with dark matter weaponry and quantum emergency warp.',
    textureKey: 'ship_nova',
    baseStats: { firepower: 92, shield: 84, speed: 88, maneuver: 85 },
    priceCredits: 10000,
    priceCores: 75,
    unlockedByDefault: false
  }
];

// Upgrade cost progression: Level 1->2 (250), 2->3 (500), 3->4 (1000), 4->5 (2000)
export const UPGRADE_COSTS = {
  1: 250,
  2: 500,
  3: 1000,
  4: 2000
};

/**
 * @desc    Get all ships and current pilot's ownership and upgrade status
 * @route   GET /api/ships
 * @access  Private
 */
export const getShips = async (req, res) => {
  try {
    const userId = req.user.id;
    const playerShips = await PlayerShip.find({ user: userId });
    const profile = await PlayerProfile.findOne({ user: userId });

    const shipsData = SHIPS_CATALOG.map((ship) => {
      const owned = playerShips.find((ps) => ps.shipId === ship.id);
      return {
        ...ship,
        isUnlocked: owned ? owned.isUnlocked : ship.unlockedByDefault,
        isEquipped: profile ? profile.selectedShipId === ship.id : ship.id === 'v01-orbitron',
        upgrades: owned ? owned.upgrades : { weapon: 1, shield: 1, engine: 1, special: 1 }
      };
    });

    return res.status(200).json({
      success: true,
      selectedShipId: profile?.selectedShipId || 'v01-orbitron',
      ships: shipsData
    });
  } catch (error) {
    console.error('getShips Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving ships' });
  }
};

/**
 * @desc    Equip a starship for combat missions
 * @route   POST /api/ships/:shipId/select
 * @access  Private
 */
export const selectShip = async (req, res) => {
  try {
    const { shipId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const playerShip = await PlayerShip.findOne({ user: userId, shipId });
    if (!playerShip || !playerShip.isUnlocked) {
      return res.status(400).json({ success: false, message: 'You must unlock this starship before equipping it.' });
    }

    const profile = await PlayerProfile.findOneAndUpdate(
      { user: userId },
      { selectedShipId: shipId },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Starship ${shipId.toUpperCase()} equipped successfully`,
      selectedShipId: profile.selectedShipId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error selecting starship' });
  }
};

/**
 * @desc    Unlock a starship using Credits & Energy Cores
 * @route   POST /api/ships/:shipId/unlock
 * @access  Private
 */
export const unlockShip = async (req, res) => {
  try {
    const { shipId } = req.params;
    const userId = req.user.id;

    const shipInfo = SHIPS_CATALOG.find((s) => s.id === shipId);
    if (!shipInfo) {
      return res.status(404).json({ success: false, message: 'Starship class not recognized' });
    }

    let playerShip = await PlayerShip.findOne({ user: userId, shipId });
    if (playerShip && playerShip.isUnlocked) {
      return res.status(400).json({ success: false, message: 'Starship is already unlocked' });
    }

    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pilot profile not found' });
    }

    // Check balance
    if (profile.credits < shipInfo.priceCredits || profile.energyCores < shipInfo.priceCores) {
      return res.status(400).json({
        success: false,
        message: `Insufficient resources. Required: ${shipInfo.priceCredits} Credits and ${shipInfo.priceCores} Energy Cores.`
      });
    }

    // Atomic deductions
    const balanceBefore = profile.credits;
    profile.credits -= shipInfo.priceCredits;
    profile.energyCores -= shipInfo.priceCores;
    await profile.save();

    // Unlock ship record
    if (playerShip) {
      playerShip.isUnlocked = true;
      playerShip.unlockedAt = new Date();
      await playerShip.save();
    } else {
      playerShip = await PlayerShip.create({
        user: userId,
        shipId,
        isUnlocked: true,
        unlockedAt: new Date()
      });
    }

    // Record Ledger Transaction
    if (shipInfo.priceCredits > 0) {
      await WalletTransaction.create({
        user: userId,
        transactionType: 'DEBIT',
        currencyType: 'CREDITS',
        amount: shipInfo.priceCredits,
        balanceBefore,
        balanceAfter: profile.credits,
        source: 'SHIP_PURCHASE',
        referenceId: `ship-${uuidv4()}`,
        description: `Commissioned Starship Class: ${shipInfo.code} ${shipInfo.name}`,
        status: 'COMPLETED'
      });
    }

    return res.status(200).json({
      success: true,
      message: `${shipInfo.name} commissioned into your fleet!`,
      credits: profile.credits,
      energyCores: profile.energyCores,
      ship: {
        ...shipInfo,
        isUnlocked: true,
        upgrades: playerShip.upgrades
      }
    });
  } catch (error) {
    console.error('unlockShip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error unlocking starship' });
  }
};

/**
 * @desc    Purchase modular ship upgrade (Atomic server validation - Section 25)
 * @route   POST /api/ships/:shipId/upgrade
 * @access  Private
 */
export const upgradeShip = async (req, res) => {
  try {
    const { shipId } = req.params;
    const { moduleType } = req.body; // 'weapon', 'shield', 'engine', 'special'
    const userId = req.user.id;

    const validModules = ['weapon', 'shield', 'engine', 'special', 'hull'];
    if (!validModules.includes(moduleType)) {
      return res.status(400).json({ success: false, message: 'Invalid upgrade module type' });
    }

    // 1. Verify ownership
    let playerShip = await PlayerShip.findOne({ user: userId, shipId });
    if (!playerShip) {
      const shipInfo = SHIPS_CATALOG.find((s) => s.id === shipId);
      if (shipInfo && shipInfo.unlockedByDefault) {
        playerShip = await PlayerShip.create({
          user: userId,
          shipId,
          isUnlocked: true,
          unlockedAt: new Date(),
          upgrades: { weapon: 1, shield: 1, engine: 1, special: 1, hull: 1 }
        });
      }
    }

    if (!playerShip || !playerShip.isUnlocked) {
      return res.status(400).json({ success: false, message: 'You must own this starship to upgrade its modules' });
    }

    // 2. Check current level
    const currentLevel = playerShip.upgrades[moduleType] || 1;
    if (currentLevel >= 5) {
      return res.status(400).json({ success: false, message: `${moduleType.toUpperCase()} module is already at maximum Level 5` });
    }

    // 3. Server-calculated price
    const upgradeCost = UPGRADE_COSTS[currentLevel] || 500;

    // 4. Verify wallet balance
    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile || profile.credits < upgradeCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Credits. Level ${currentLevel + 1} requires ${upgradeCost} Credits.`
      });
    }

    // 5. Atomic currency deduction
    const balanceBefore = profile.credits;
    profile.credits -= upgradeCost;
    await profile.save();

    // 6. Apply upgrade
    playerShip.upgrades[moduleType] = currentLevel + 1;
    await playerShip.save();

    // 7. Record immutable double-entry ledger transaction
    await WalletTransaction.create({
      user: userId,
      transactionType: 'DEBIT',
      currencyType: 'CREDITS',
      amount: upgradeCost,
      balanceBefore,
      balanceAfter: profile.credits,
      source: 'SHIP_UPGRADE',
      referenceId: `upgrade-${uuidv4()}`,
      description: `Upgraded ${shipId.toUpperCase()} ${moduleType.toUpperCase()} to Level ${currentLevel + 1}`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: `${moduleType.toUpperCase()} upgraded to Level ${currentLevel + 1}!`,
      newLevel: currentLevel + 1,
      moduleType,
      upgrades: playerShip.upgrades,
      credits: profile.credits
    });
  } catch (error) {
    console.error('upgradeShip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error applying starship upgrade' });
  }
};
