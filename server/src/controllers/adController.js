import RewardedAdSession from '../models/RewardedAdSession.js';
import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Check eligibility and initialize a 9-state Rewarded Ad session
 * @route   POST /api/ads/offer
 * @access  Private
 */
export const offerAd = async (req, res) => {
  try {
    const userId = req.user.id;
    const { placement, expectedReward } = req.body;

    if (!['REVIVE', 'DOUBLE_CREDITS', 'DAILY_SUPPLY', 'ENERGY_BOOST'].includes(placement)) {
      return res.status(400).json({ success: false, message: 'Invalid ad placement identifier' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Section 35: Daily Cap Validation (Max 10 total ads per day)
    const adsTodayCount = await RewardedAdSession.countDocuments({
      user: userId,
      status: 'GRANTED',
      createdAt: { $gte: todayStart }
    });

    if (adsTodayCount >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Daily rewarded ad limit reached (10/10). Resets at midnight UTC.'
      });
    }

    // Specific Cap for Revive (Max 3 revives per day)
    if (placement === 'REVIVE') {
      const revivesToday = await RewardedAdSession.countDocuments({
        user: userId,
        placement: 'REVIVE',
        status: 'GRANTED',
        createdAt: { $gte: todayStart }
      });

      if (revivesToday >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Daily combat revive limit reached (3/3).'
        });
      }
    }

    // Section 35: Minimum Cooldown Check (60 seconds between granted ads)
    const lastGrantedAd = await RewardedAdSession.findOne({
      user: userId,
      status: 'GRANTED'
    }).sort({ grantedAt: -1 });

    if (lastGrantedAd && lastGrantedAd.grantedAt) {
      const elapsedSeconds = (Date.now() - new Date(lastGrantedAd.grantedAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: `Ad cooldown in progress. Please wait ${Math.ceil(60 - elapsedSeconds)}s.`
        });
      }
    }

    // Create Rewarded Ad Session in INITIALIZED state
    const adId = `ad-${uuidv4()}`;
    const durationSeconds = 5; // 5-second simulated rewarded video playback

    const adSession = await RewardedAdSession.create({
      adId,
      user: userId,
      placement,
      status: 'INITIALIZED',
      durationSeconds,
      reward: expectedReward || { currencyType: 'CREDITS', amount: 150 }
    });

    return res.status(201).json({
      success: true,
      adId,
      placement,
      durationSeconds,
      state: adSession.status,
      message: 'Rewarded ad session initialized'
    });
  } catch (error) {
    console.error('offerAd Error:', error);
    return res.status(500).json({ success: false, message: 'Server error initializing ad session' });
  }
};

/**
 * @desc    Submit heartbeat to prove ad playback progress
 * @route   POST /api/ads/:adId/heartbeat
 * @access  Private
 */
export const adHeartbeat = async (req, res) => {
  try {
    const { adId } = req.params;
    const { elapsedSeconds } = req.body;
    const userId = req.user.id;

    const adSession = await RewardedAdSession.findOne({ adId, user: userId });
    if (!adSession) {
      return res.status(404).json({ success: false, message: 'Ad session not found' });
    }

    if (adSession.status === 'GRANTED' || adSession.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: 'Ad session is no longer active' });
    }

    adSession.status = 'HEARTBEAT';
    adSession.watchedSeconds = Math.max(adSession.watchedSeconds, elapsedSeconds || 1);
    await adSession.save();

    return res.status(200).json({
      success: true,
      watchedSeconds: adSession.watchedSeconds,
      status: adSession.status
    });
  } catch (error) {
    console.error('adHeartbeat Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating ad heartbeat' });
  }
};

/**
 * @desc    Verify ad completion, transition to GRANTED, and credit double-entry ledger
 * @route   POST /api/ads/:adId/verify
 * @access  Private
 */
export const verifyAdReward = async (req, res) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    const adSession = await RewardedAdSession.findOne({ adId, user: userId });
    if (!adSession) {
      return res.status(404).json({ success: false, message: 'Ad session not found' });
    }

    // Section 39: Prevent Double Claim
    if (adSession.status === 'GRANTED') {
      return res.status(400).json({ success: false, message: 'Reward for this ad has already been claimed' });
    }

    // Ensure ad was completed
    adSession.status = 'VERIFYING';
    adSession.completedAt = new Date();

    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pilot profile not found' });
    }

    const reward = adSession.reward;
    let balanceBefore = profile.credits;
    let balanceAfter = profile.credits;

    if (adSession.placement === 'REVIVE') {
      // Revive grant
      adSession.status = 'GRANTED';
      adSession.grantedAt = new Date();
      await adSession.save();

      profile.stats.totalAdsWatched += 1;
      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Revive reward authorized! Pilot starfighter restored.',
        grantedReward: { type: 'REVIVE', amount: 1 },
        updatedBalances: {
          credits: profile.credits,
          energyCores: profile.energyCores
        }
      });
    }

    // Currency grants (Credits / Cores)
    const amountToGrant = reward?.amount || 150;
    const currencyType = reward?.currencyType || 'CREDITS';

    if (currencyType === 'CREDITS') {
      balanceBefore = profile.credits;
      profile.credits += amountToGrant;
      balanceAfter = profile.credits;
    } else if (currencyType === 'ENERGY_CORES') {
      balanceBefore = profile.energyCores;
      profile.energyCores += amountToGrant;
      balanceAfter = profile.energyCores;
    }

    profile.stats.totalAdsWatched += 1;
    await profile.save();

    // Create immutable double-entry ledger record
    await WalletTransaction.create({
      user: userId,
      transactionType: 'CREDIT',
      currencyType,
      amount: amountToGrant,
      balanceBefore,
      balanceAfter,
      source: adSession.placement === 'DOUBLE_CREDITS' ? 'AD_DOUBLE_CREDITS' : 'AD_BONUS_REWARD',
      referenceId: adId,
      description: `Rewarded Ad reward (${adSession.placement})`,
      status: 'COMPLETED'
    });

    adSession.status = 'GRANTED';
    adSession.grantedAt = new Date();
    await adSession.save();

    return res.status(200).json({
      success: true,
      message: 'Rewarded ad verified and credited to wallet ledger!',
      grantedReward: { currencyType, amount: amountToGrant },
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        totalAdsWatched: profile.stats.totalAdsWatched
      }
    });
  } catch (error) {
    console.error('verifyAdReward Error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying ad reward' });
  }
};
