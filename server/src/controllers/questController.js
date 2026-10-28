import PlayerProfile from '../models/PlayerProfile.js';
import PlayerShip from '../models/PlayerShip.js';
import PlayerMissionProgress from '../models/PlayerMissionProgress.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { DAILY_QUESTS_CATALOG, ACHIEVEMENTS_CATALOG, DAILY_LOGIN_STREAK_REWARDS } from '../data/questsData.js';

/**
 * @desc    Get pilot's active daily quests, achievements, and login streak status
 * @route   GET /api/quests
 * @access  Private
 */
export const getQuestsAndAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pilot profile not found' });
    }

    // 1. Check & Reset Daily Quests if 24h passed
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const needsQuestReset = !profile.lastQuestReset || new Date(profile.lastQuestReset) < todayMidnight;
    if (needsQuestReset) {
      profile.dailyQuests = DAILY_QUESTS_CATALOG.map((q) => ({
        questId: q.id,
        progress: 0,
        target: q.target,
        completed: false,
        claimed: false
      }));
      profile.lastQuestReset = now;
      await profile.save();
    }

    // 2. Compute dynamic quest progress from profile stats
    const questList = DAILY_QUESTS_CATALOG.map((catalogQuest) => {
      const pQuest = profile.dailyQuests.find((q) => q.questId === catalogQuest.id) || {
        progress: 0,
        completed: false,
        claimed: false
      };

      let currentProg = pQuest.progress;
      if (catalogQuest.metric === 'enemiesDestroyed') {
        currentProg = Math.min(catalogQuest.target, profile.stats.enemiesDestroyed || 0);
      } else if (catalogQuest.metric === 'missionsCompleted') {
        currentProg = Math.min(catalogQuest.target, profile.stats.missionsCompleted || 0);
      } else if (catalogQuest.metric === 'adsWatched') {
        currentProg = Math.min(catalogQuest.target, profile.stats.adsWatchedToday || 0);
      } else if (catalogQuest.metric === 'highestScore') {
        currentProg = Math.min(catalogQuest.target, profile.stats.highestScore || 0);
      }

      const isCompleted = currentProg >= catalogQuest.target;

      return {
        ...catalogQuest,
        progress: currentProg,
        completed: isCompleted,
        claimed: pQuest.claimed
      };
    });

    // 3. Compute Achievements Status
    const shipsCount = await PlayerShip.countDocuments({ user: userId });
    const missionProgress = await PlayerMissionProgress.find({ user: userId });
    const totalStars = missionProgress.reduce((sum, m) => sum + (m.stars || 0), 0);
    const sector1Completed = missionProgress.filter((m) => m.sectorId === 'sector-1' && m.isCompleted).length >= 10;
    const voidSovereignDefeated = missionProgress.some((m) => m.missionId === 'sector-5-mission-50' && m.isCompleted);

    const achievementsList = ACHIEVEMENTS_CATALOG.map((ach) => {
      const claimedRec = profile.achievements.find((a) => a.achievementId === ach.id);
      let isUnlocked = false;

      switch (ach.id) {
        case 'ach-first-blood':
          isUnlocked = (profile.stats.enemiesDestroyed || 0) >= 1;
          break;
        case 'ach-fleet-commander':
          isUnlocked = shipsCount >= 5;
          break;
        case 'ach-apex-hunter':
          isUnlocked = (profile.stats.bossesDefeated || 0) >= 1;
          break;
        case 'ach-sector-conqueror':
          isUnlocked = sector1Completed;
          break;
        case 'ach-star-collector':
          isUnlocked = totalStars >= 30;
          break;
        case 'ach-overdrive':
          isUnlocked = (profile.stats.missionsCompleted || 0) >= 5; // Tracked by modules/progress
          break;
        case 'ach-ad-enthusiast':
          isUnlocked = (profile.stats.totalAdsWatched || 0) >= 5;
          break;
        case 'ach-sharpshooter':
          isUnlocked = (profile.stats.highestScore || 0) >= 12000;
          break;
        case 'ach-void-sovereign':
          isUnlocked = voidSovereignDefeated;
          break;
        case 'ach-credit-baron':
          isUnlocked = profile.credits >= 2500;
          break;
      }

      return {
        ...ach,
        unlocked: isUnlocked,
        claimed: claimedRec ? claimedRec.claimed : false
      };
    });

    // 4. Daily Login Streak Status
    const lastClaim = profile.stats.lastDailyClaim ? new Date(profile.stats.lastDailyClaim) : null;
    const canClaimToday = !lastClaim || lastClaim < todayMidnight;
    const streakDay = ((profile.stats.dailyStreak - 1) % 7) + 1;

    return res.status(200).json({
      success: true,
      dailyQuests: questList,
      achievements: achievementsList,
      streak: {
        currentStreak: profile.stats.dailyStreak || 1,
        streakDay,
        canClaimToday,
        rewardsTable: DAILY_LOGIN_STREAK_REWARDS
      }
    });
  } catch (error) {
    console.error('getQuestsAndAchievements Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving quests and achievements' });
  }
};

/**
 * @desc    Claim daily login streak bonus
 * @route   POST /api/quests/streak/claim
 * @access  Private
 */
export const claimDailyStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pilot profile not found' });
    }

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastClaim = profile.stats.lastDailyClaim ? new Date(profile.stats.lastDailyClaim) : null;
    if (lastClaim && lastClaim >= todayMidnight) {
      return res.status(400).json({ success: false, message: 'Daily streak reward already claimed for today' });
    }

    // Check if streak broke (>48 hours since last claim)
    if (lastClaim) {
      const yesterdayMidnight = new Date(todayMidnight);
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      if (lastClaim < yesterdayMidnight) {
        profile.stats.dailyStreak = 1; // Streak reset
      } else {
        profile.stats.dailyStreak += 1; // Consecutive day!
      }
    } else {
      profile.stats.dailyStreak = 1;
    }

    const streakDay = ((profile.stats.dailyStreak - 1) % 7) + 1;
    const rewardTier = DAILY_LOGIN_STREAK_REWARDS.find((r) => r.day === streakDay) || DAILY_LOGIN_STREAK_REWARDS[0];

    const balanceBefore = profile.credits;
    const coresBefore = profile.energyCores || 0;
    const coinsBefore = profile.velopRewardCoins || 0;

    profile.credits += rewardTier.credits;
    if (rewardTier.cores) {
      profile.energyCores = coresBefore + rewardTier.cores;
    }
    if (rewardTier.coins) {
      profile.velopRewardCoins = coinsBefore + rewardTier.coins;
    }
    profile.stats.lastDailyClaim = now;
    await profile.save();

    // Create immutable WalletTransaction for Credits
    await WalletTransaction.create({
      user: userId,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: rewardTier.credits,
      balanceBefore,
      balanceAfter: profile.credits,
      source: 'DAILY_CLAIM',
      referenceId: `streak-cr-${streakDay}-${Date.now()}`,
      description: `Claimed ${rewardTier.label} (Credits)`,
      status: 'COMPLETED'
    });

    // Create immutable WalletTransaction for Energy Cores (if awarded)
    if (rewardTier.cores && rewardTier.cores > 0) {
      await WalletTransaction.create({
        user: userId,
        transactionType: 'CREDIT',
        currencyType: 'ENERGY_CORES',
        amount: rewardTier.cores,
        balanceBefore: coresBefore,
        balanceAfter: profile.energyCores,
        source: 'DAILY_CLAIM',
        referenceId: `streak-cores-${streakDay}-${Date.now()}`,
        description: `Claimed ${rewardTier.label} (Energy Cores)`,
        status: 'COMPLETED'
      });
    }

    // Create immutable WalletTransaction for VELOOP Coins / Gems (if awarded, e.g. Day 7 Mystery Crate)
    if (rewardTier.coins && rewardTier.coins > 0) {
      await WalletTransaction.create({
        user: userId,
        transactionType: 'CREDIT',
        currencyType: 'REWARD_COINS',
        amount: rewardTier.coins,
        balanceBefore: coinsBefore,
        balanceAfter: profile.velopRewardCoins,
        source: 'DAILY_CLAIM',
        referenceId: `streak-coins-${streakDay}-${Date.now()}`,
        description: `Claimed ${rewardTier.label} (Mystery Crate Jackpot Coins)`,
        status: 'COMPLETED'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Claimed ${rewardTier.label}!`,
      reward: rewardTier,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        velopRewardCoins: profile.velopRewardCoins,
        streak: profile.stats.dailyStreak
      }
    });
  } catch (error) {
    console.error('claimDailyStreak Error:', error);
    return res.status(500).json({ success: false, message: 'Server error claiming login streak reward' });
  }
};

/**
 * @desc    Claim daily quest reward
 * @route   POST /api/quests/:questId/claim
 * @access  Private
 */
export const claimDailyQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user.id;
    const profile = await PlayerProfile.findOne({ user: userId });

    const catalogQuest = DAILY_QUESTS_CATALOG.find((q) => q.id === questId);
    if (!catalogQuest) {
      return res.status(404).json({ success: false, message: 'Daily quest identifier not found' });
    }

    let pQuest = profile.dailyQuests.find((q) => q.questId === questId);
    if (pQuest && pQuest.claimed) {
      return res.status(400).json({ success: false, message: 'This daily quest reward has already been claimed' });
    }

    // Grant rewards
    const creditsReward = catalogQuest.rewards.credits || 0;
    const coresReward = catalogQuest.rewards.energyCores || 0;
    const xpReward = catalogQuest.rewards.xp || 0;

    const balanceBefore = profile.credits;
    profile.credits += creditsReward;
    profile.energyCores += coresReward;
    profile.xp += xpReward;

    if (!pQuest) {
      profile.dailyQuests.push({
        questId,
        progress: catalogQuest.target,
        target: catalogQuest.target,
        completed: true,
        claimed: true
      });
    } else {
      pQuest.claimed = true;
      pQuest.completed = true;
    }

    await profile.save();

    // Create WalletTransaction
    await WalletTransaction.create({
      user: userId,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: creditsReward,
      balanceBefore,
      balanceAfter: profile.credits,
      source: 'DAILY_CLAIM',
      referenceId: `quest-${questId}-${Date.now()}`,
      description: `Completed Quest: ${catalogQuest.title}`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: `Quest reward claimed! +${creditsReward} Credits, +${xpReward} XP`,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        xp: profile.xp
      }
    });
  } catch (error) {
    console.error('claimDailyQuest Error:', error);
    return res.status(500).json({ success: false, message: 'Server error claiming quest reward' });
  }
};

/**
 * @desc    Claim achievement reward
 * @route   POST /api/quests/achievements/:achievementId/claim
 * @access  Private
 */
export const claimAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const userId = req.user.id;
    const profile = await PlayerProfile.findOne({ user: userId });

    const achDef = ACHIEVEMENTS_CATALOG.find((a) => a.id === achievementId);
    if (!achDef) {
      return res.status(404).json({ success: false, message: 'Achievement definition not found' });
    }

    const existingClaim = profile.achievements.find((a) => a.achievementId === achievementId);
    if (existingClaim && existingClaim.claimed) {
      return res.status(400).json({ success: false, message: 'Achievement reward already claimed' });
    }

    const creditsReward = achDef.rewards.credits || 0;
    const coresReward = achDef.rewards.energyCores || 0;
    const xpReward = achDef.rewards.xp || 0;

    const balanceBefore = profile.credits;
    profile.credits += creditsReward;
    profile.energyCores += coresReward;
    profile.xp += xpReward;

    if (!existingClaim) {
      profile.achievements.push({
        achievementId,
        unlockedAt: new Date(),
        claimed: true
      });
    } else {
      existingClaim.claimed = true;
    }

    await profile.save();

    // Create WalletTransaction
    await WalletTransaction.create({
      user: userId,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: creditsReward,
      balanceBefore,
      balanceAfter: profile.credits,
      source: 'ACHIEVEMENT_REWARD',
      referenceId: `ach-${achievementId}-${Date.now()}`,
      description: `Achievement Unlocked: ${achDef.name}`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: `Achievement claimed: ${achDef.name}!`,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        xp: profile.xp
      }
    });
  } catch (error) {
    console.error('claimAchievement Error:', error);
    return res.status(500).json({ success: false, message: 'Server error claiming achievement reward' });
  }
};
