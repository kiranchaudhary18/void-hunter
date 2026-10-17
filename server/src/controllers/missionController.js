import PlayerMissionProgress from '../models/PlayerMissionProgress.js';
import GameSession from '../models/GameSession.js';
import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { MISSIONS_CATALOG } from '../data/missionsData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Get all 50 missions with current pilot's unlock, star, and completion status
 * @route   GET /api/missions
 * @access  Private
 */
export const getMissions = async (req, res) => {
  try {
    const userId = req.user?.id;
    let progressRecords = [];
    if (userId) {
      progressRecords = await PlayerMissionProgress.find({ user: userId });
    }

    const missionsWithProgress = MISSIONS_CATALOG.map((m) => {
      const p = progressRecords.find((rec) => rec.missionId === m.id);
      return {
        ...m,
        isUnlocked: m.globalSequence === 1 ? true : (p ? p.isUnlocked : false),
        isCompleted: p ? p.isCompleted : false,
        stars: p ? p.stars : 0,
        highScore: p ? p.highScore : 0
      };
    });

    return res.status(200).json({
      success: true,
      missions: missionsWithProgress
    });
  } catch (error) {
    console.error('getMissions Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving mission data' });
  }
};

/**
 * @desc    Start a mission session (Session Lifecycle - Section 20 & 64)
 * @route   POST /api/missions/:missionId/start
 * @access  Private
 */
export const startMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { shipId } = req.body;
    const userId = req.user.id;

    const mission = MISSIONS_CATALOG.find((m) => m.id === missionId);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission identifier not found' });
    }

    // Verify mission unlock condition (Section 18)
    if (mission.globalSequence > 1) {
      const progress = await PlayerMissionProgress.findOne({ user: userId, missionId });
      if (!progress || !progress.isUnlocked) {
        return res.status(403).json({ success: false, message: 'This mission is locked. Complete previous sector missions first.' });
      }
    }

    const sessionId = `session-${uuidv4()}`;

    // Create unique GameSession record
    const gameSession = await GameSession.create({
      sessionId,
      user: userId,
      missionId,
      sectorId: mission.sectorId,
      shipId: shipId || 'v01-orbitron',
      status: 'ACTIVE',
      startedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      sessionId,
      mission,
      gameSession
    });
  } catch (error) {
    console.error('startMission Error:', error);
    return res.status(500).json({ success: false, message: 'Server error initializing mission session' });
  }
};

/**
 * @desc    Complete mission session, validate anti-cheat, unlock next stage, and credit ledger
 * @route   POST /api/missions/:sessionId/complete
 * @access  Private
 */
export const completeMission = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { telemetry, finalScore, durationSeconds, damageTaken } = req.body;
    const userId = req.user.id;

    const session = await GameSession.findOne({ sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Active game session not found or pilot mismatch' });
    }

    // Section 39: Idempotency check - Prevent claiming the same session twice
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'This mission run has already been completed and claimed' });
    }

    const mission = MISSIONS_CATALOG.find((m) => m.id === session.missionId);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission definition not found' });
    }

    // Anti-Cheat Bounds Validation (Section 65)
    // Physical minimum: At least 10 seconds required to complete combat
    if (durationSeconds && durationSeconds < 10) {
      session.status = 'ABANDONED';
      session.validation = {
        isValidated: true,
        antiCheatPassed: false,
        failureReason: 'Duration physically impossible (under 10s)'
      };
      await session.save();
      return res.status(400).json({ success: false, message: 'Telemetry rejected: Mission duration too short' });
    }

    // Calculate Star Rating (1 to 3 stars - Section 19)
    let stars = 1;
    if (finalScore >= 12000 || (telemetry && telemetry.accuracyPercentage >= 75)) {
      stars++;
    }
    if ((damageTaken !== undefined && damageTaken <= 25) || finalScore >= 20000) {
      stars++;
    }

    // Update Player Mission Progress
    let progress = await PlayerMissionProgress.findOne({ user: userId, missionId: mission.id });
    if (!progress) {
      progress = new PlayerMissionProgress({
        user: userId,
        missionId: mission.id,
        sectorId: mission.sectorId,
        sequence: mission.sequence,
        isUnlocked: true
      });
    }

    progress.isCompleted = true;
    progress.stars = Math.max(progress.stars, stars);
    progress.highScore = Math.max(progress.highScore, finalScore || 0);
    progress.completedAt = new Date();
    await progress.save();

    // Section 18: Unlock Next Mission in Sequence
    const nextSeq = mission.globalSequence + 1;
    const nextMission = MISSIONS_CATALOG.find((m) => m.globalSequence === nextSeq);
    if (nextMission) {
      let nextProgress = await PlayerMissionProgress.findOne({ user: userId, missionId: nextMission.id });
      if (!nextProgress) {
        await PlayerMissionProgress.create({
          user: userId,
          missionId: nextMission.id,
          sectorId: nextMission.sectorId,
          sequence: nextMission.sequence,
          isUnlocked: true,
          isCompleted: false
        });
      } else if (!nextProgress.isUnlocked) {
        nextProgress.isUnlocked = true;
        await nextProgress.save();
      }
    }

    // Calculate Eligible Rewards
    const creditsReward = mission.rewards.credits;
    const xpReward = mission.rewards.xp;
    const coresReward = mission.rewards.energyCores || 0;

    // Credit Pilot Wallet & Update XP
    const profile = await PlayerProfile.findOne({ user: userId });
    const balanceBefore = profile.credits;
    profile.credits += creditsReward;
    profile.energyCores += coresReward;
    profile.xp += xpReward;
    profile.stats.missionsCompleted += 1;
    profile.stats.totalScore += finalScore || 0;
    profile.stats.highestScore = Math.max(profile.stats.highestScore, finalScore || 0);

    // Level-up threshold check
    if (profile.xp >= profile.xpToNextLevel) {
      profile.level += 1;
      profile.xpToNextLevel = Math.round(profile.xpToNextLevel * 1.5);
    }
    await profile.save();

    // Record Double-Entry Wallet Ledger Transaction
    await WalletTransaction.create({
      user: userId,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: creditsReward,
      balanceBefore,
      balanceAfter: profile.credits,
      source: mission.boss ? 'BOSS_DEFEAT' : 'MISSION_COMPLETION',
      referenceId: sessionId,
      description: `Completed ${mission.subtitle} - ${mission.name}`,
      status: 'COMPLETED'
    });

    // Finalize GameSession
    session.status = 'COMPLETED';
    session.completedAt = new Date();
    session.durationSeconds = durationSeconds || 45;
    session.starsAwarded = stars;
    session.telemetry = telemetry || {};
    session.validation = { isValidated: true, antiCheatPassed: true };
    session.rewardsGranted = {
      credits: creditsReward,
      energyCores: coresReward,
      xp: xpReward,
      claimed: true
    };
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Mission verified and completed!',
      starsAwarded: stars,
      rewardsGranted: session.rewardsGranted,
      nextMissionUnlocked: !!nextMission,
      nextMissionId: nextMission ? nextMission.id : null,
      updatedProfile: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        xp: profile.xp,
        level: profile.level
      }
    });
  } catch (error) {
    console.error('completeMission Error:', error);
    return res.status(500).json({ success: false, message: 'Server error completing mission' });
  }
};
