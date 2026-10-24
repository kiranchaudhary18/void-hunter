import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';

/**
 * Section 57: Supply Drop Reward Tables & Probabilities
 */
const SUPPLY_DROP_TABLE = [
  { type: 'CREDITS', amount: 250, label: 'Standard Credits Cache', weight: 45 },
  { type: 'CREDITS', amount: 600, label: 'Heavy Credits Vault', weight: 25 },
  { type: 'ENERGY_CORES', amount: 3, label: 'Energy Core Cluster', weight: 18 },
  { type: 'ENERGY_CORES', amount: 8, label: 'Supercharged Cores', weight: 8 },
  { type: 'VELOP_COINS', amount: 50, label: 'Jackpot: 50 VELOOP Coins', weight: 4 }
];

/**
 * Section 58: Limited-Time Event Definition
 */
const DEMO_EVENT = {
  id: 'event-void-harvest',
  name: 'OPERATION VOID HARVEST',
  description: 'Neutralize 15 hostile fleet units or elite vessels across any sector campaign.',
  objective: {
    type: 'destroy_enemies',
    target: 15
  },
  reward: {
    credits: 1000,
    energyCores: 5,
    velopRewardCoins: 100
  },
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
};

/**
 * @desc    Check Supply Drop status & cooldown (Section 57)
 * @route   GET /api/supply-drop/status
 * @access  Private
 */
export const getSupplyDropStatus = async (req, res) => {
  try {
    const profile = await PlayerProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Pilot profile not found' });

    const lastClaim = profile.stats?.lastSupplyDrop ? new Date(profile.stats.lastSupplyDrop) : null;
    const cooldownMs = 4 * 60 * 60 * 1000; // 4 hour cooldown
    const now = Date.now();
    const canClaim = !lastClaim || now - lastClaim.getTime() >= cooldownMs;
    const nextAvailableAt = lastClaim ? new Date(lastClaim.getTime() + cooldownMs).toISOString() : new Date().toISOString();

    return res.status(200).json({
      success: true,
      canClaim,
      nextAvailableAt,
      rewardTiers: SUPPLY_DROP_TABLE.map(({ type, amount, label, weight }) => ({ type, amount, label, probability: `${weight}%` }))
    });
  } catch (error) {
    console.error('getSupplyDropStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Server error checking supply drop' });
  }
};

/**
 * @desc    Open and claim a randomized Supply Drop (Section 57)
 * @route   POST /api/supply-drop/claim
 * @access  Private
 */
export const claimSupplyDrop = async (req, res) => {
  try {
    const profile = await PlayerProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Pilot profile not found' });

    const lastClaim = profile.stats?.lastSupplyDrop ? new Date(profile.stats.lastSupplyDrop) : null;
    const cooldownMs = 4 * 60 * 60 * 1000;
    const now = Date.now();

    if (lastClaim && now - lastClaim.getTime() < cooldownMs) {
      const waitMinutes = Math.ceil((cooldownMs - (now - lastClaim.getTime())) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Supply drop is refueling. Next orbital drop available in ${waitMinutes} minutes.`
      });
    }

    // Server-side weighted random selection
    const totalWeight = SUPPLY_DROP_TABLE.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedDrop = SUPPLY_DROP_TABLE[0];

    for (const item of SUPPLY_DROP_TABLE) {
      if (rand < item.weight) {
        selectedDrop = item;
        break;
      }
      rand -= item.weight;
    }

    let balanceBefore = profile.credits;
    let balanceAfter = profile.credits;

    if (selectedDrop.type === 'CREDITS') {
      balanceBefore = profile.credits;
      profile.credits += selectedDrop.amount;
      balanceAfter = profile.credits;
    } else if (selectedDrop.type === 'ENERGY_CORES') {
      balanceBefore = profile.energyCores;
      profile.energyCores += selectedDrop.amount;
      balanceAfter = profile.energyCores;
    } else if (selectedDrop.type === 'VELOP_COINS') {
      balanceBefore = profile.velopRewardCoins;
      profile.velopRewardCoins += selectedDrop.amount;
      balanceAfter = profile.velopRewardCoins;
    }

    if (!profile.stats) profile.stats = {};
    profile.stats.lastSupplyDrop = new Date();
    await profile.save();

    // Immutable ledger entry
    await WalletTransaction.create({
      user: req.user.id,
      transactionType: 'CREDIT',
      currencyType: selectedDrop.type,
      amount: selectedDrop.amount,
      balanceBefore,
      balanceAfter,
      source: 'SUPPLY_DROP',
      referenceId: `drop-${Date.now()}`,
      description: `Orbital Supply Drop: ${selectedDrop.label}`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      reward: selectedDrop,
      message: `Orbital container opened! Received ${selectedDrop.label}.`,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        velopRewardCoins: profile.velopRewardCoins
      }
    });
  } catch (error) {
    console.error('claimSupplyDrop Error:', error);
    return res.status(500).json({ success: false, message: 'Server error claiming supply drop' });
  }
};

/**
 * @desc    Get Limited-Time Events list and progress (Section 58)
 * @route   GET /api/events
 * @access  Private
 */
export const getEvents = async (req, res) => {
  try {
    const profile = await PlayerProfile.findOne({ user: req.user.id });
    const currentProgress = profile?.stats?.enemiesDestroyed || 0;
    const isCompleted = currentProgress >= DEMO_EVENT.objective.target;
    const isClaimed = profile?.achievements?.some((a) => a.achievementId === DEMO_EVENT.id && a.claimed) || false;

    return res.status(200).json({
      success: true,
      events: [
        {
          ...DEMO_EVENT,
          currentProgress: Math.min(currentProgress, DEMO_EVENT.objective.target),
          isCompleted,
          isClaimed
        }
      ]
    });
  } catch (error) {
    console.error('getEvents Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving events' });
  }
};

/**
 * @desc    Claim reward for completed Limited-Time Event (Section 58)
 * @route   POST /api/events/:eventId/claim
 * @access  Private
 */
export const claimEventReward = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (eventId !== DEMO_EVENT.id) {
      return res.status(404).json({ success: false, message: 'Event not found or has expired' });
    }

    const profile = await PlayerProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Pilot profile not found' });

    const currentProgress = profile.stats?.enemiesDestroyed || 0;
    if (currentProgress < DEMO_EVENT.objective.target) {
      return res.status(400).json({
        success: false,
        message: `Event objective incomplete (${currentProgress}/${DEMO_EVENT.objective.target} neutralized).`
      });
    }

    const alreadyClaimed = profile.achievements?.some((a) => a.achievementId === eventId && a.claimed);
    if (alreadyClaimed) {
      return res.status(400).json({ success: false, message: 'Event reward has already been claimed' });
    }

    const initialCredits = profile.credits;
    profile.credits += DEMO_EVENT.reward.credits;
    profile.energyCores += DEMO_EVENT.reward.energyCores;
    profile.velopRewardCoins += DEMO_EVENT.reward.velopRewardCoins;

    if (!profile.achievements) profile.achievements = [];
    profile.achievements.push({
      achievementId: eventId,
      unlockedAt: new Date(),
      claimed: true
    });
    await profile.save();

    // Create ledger entry
    await WalletTransaction.create({
      user: req.user.id,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: DEMO_EVENT.reward.credits,
      balanceBefore: initialCredits,
      balanceAfter: profile.credits,
      source: 'EVENT_REWARD',
      referenceId: eventId,
      description: `Event Reward: ${DEMO_EVENT.name}`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: `Operation rewards authorized! +${DEMO_EVENT.reward.credits} Credits, +${DEMO_EVENT.reward.energyCores} Cores, +${DEMO_EVENT.reward.velopRewardCoins} VELoop Coins.`,
      reward: DEMO_EVENT.reward,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        velopRewardCoins: profile.velopRewardCoins
      }
    });
  } catch (error) {
    console.error('claimEventReward Error:', error);
    return res.status(500).json({ success: false, message: 'Server error claiming event reward' });
  }
};


/**
 * Section 58B: Community World Raid Boss Challenge
 */
const RAID_BOSS_DATA = {
  id: 'void-titan-omega',
  name: 'VOID TITAN OMEGA',
  title: 'Apex Sovereign of the Event Horizon',
  totalHp: 1000000,
  seasonName: 'Season 1: Eclipse Protocol',
  endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  tierRewards: [
    { tier: 1, name: 'Bronze Slayer', minDamage: 10000, credits: 500, cores: 5, coins: 0 },
    { tier: 2, name: 'Silver Slayer', minDamage: 50000, credits: 2000, cores: 15, coins: 50 },
    { tier: 3, name: 'Gold Apex Slayer', minDamage: 150000, credits: 5000, cores: 35, coins: 150 }
  ]
};

/**
 * @desc    Get World Raid Boss status, total global health, and top contributors
 * @route   GET /api/events/raid-boss
 * @access  Public / Private
 */
export const getRaidBossStatus = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    let userDamage = 0;
    if (currentUserId) {
      const profile = await PlayerProfile.findOne({ user: currentUserId });
      userDamage = profile?.stats?.raidBossDamage || 0;
    }

    const aggregateRes = await PlayerProfile.aggregate([
      { $group: { _id: null, totalGlobalDamage: { $sum: '$stats.raidBossDamage' } } }
    ]);
    const baseDamage = 315800; // Simulated community contribution base
    const recordedGlobalDamage = aggregateRes.length > 0 ? (aggregateRes[0].totalGlobalDamage || 0) : 0;
    const totalContributed = baseDamage + recordedGlobalDamage;
    const currentHp = Math.max(0, RAID_BOSS_DATA.totalHp - totalContributed);

    const topContributorProfiles = await PlayerProfile.find({ 'stats.raidBossDamage': { $gt: 0 } })
      .sort({ 'stats.raidBossDamage': -1 })
      .limit(10)
      .populate('user', 'name callsign');

    const topContributors = [
      { rank: 1, callsign: 'VALKYRIE-01', name: 'Commander Nova', damage: 184500, badge: 'Apex Sovereign' },
      { rank: 2, callsign: 'SHADOW-ACE', name: 'Kaelen Thorne', damage: 142200, badge: 'Void Executioner' },
      { rank: 3, callsign: 'TITAN-X', name: 'Marcus Steel', damage: 98400, badge: 'Heavy Vanguard' },
      ...topContributorProfiles.map((p, idx) => ({
        rank: idx + 4,
        callsign: p.user?.callsign || p.user?.name?.toUpperCase() || 'WINGMAN',
        name: p.user?.name || 'Wingman',
        damage: p.stats?.raidBossDamage || 0,
        badge: 'Raid Striker'
      }))
    ].slice(0, 10);

    return res.status(200).json({
      success: true,
      boss: {
        ...RAID_BOSS_DATA,
        currentHp,
        totalContributed,
        percentRemaining: Math.max(0, Math.min(100, Math.round((currentHp / RAID_BOSS_DATA.totalHp) * 100)))
      },
      userDamage,
      topContributors
    });
  } catch (error) {
    console.error('getRaidBossStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving raid boss status' });
  }
};

/**
 * @desc    Launch tactical strike against World Raid Boss
 * @route   POST /api/events/raid-boss/attack
 * @access  Private
 */
export const contributeRaidBossDamage = async (req, res) => {
  try {
    const profile = await PlayerProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Pilot profile not found' });

    const strikeDamage = Math.floor(Math.random() * 2500) + 3500 + (profile.level || 1) * 200;
    
    if (!profile.stats) profile.stats = {};
    profile.stats.raidBossDamage = (profile.stats.raidBossDamage || 0) + strikeDamage;
    
    const initialCredits = profile.credits;
    profile.credits += 150;
    profile.energyCores += 1;
    await profile.save();

    await WalletTransaction.create({
      user: req.user.id,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: 150,
      balanceBefore: initialCredits,
      balanceAfter: profile.credits,
      source: 'RAID_BOSS_STRIKE',
      referenceId: `raid-${Date.now()}`,
      description: `Raid Boss Tactical Strike reward (+${strikeDamage} DMG dealt)`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: `Tactical strike landed! Dealt ${strikeDamage.toLocaleString()} damage to VOID TITAN OMEGA. +150 Credits & +1 Energy Core credited.`,
      damageDealt: strikeDamage,
      userTotalDamage: profile.stats.raidBossDamage,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores
      }
    });
  } catch (error) {
    console.error('contributeRaidBossDamage Error:', error);
    return res.status(500).json({ success: false, message: 'Server error contributing raid boss damage' });
  }
};
