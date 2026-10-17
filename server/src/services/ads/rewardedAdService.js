import RewardedAdSession from '../../models/RewardedAdSession.js';
import PlayerProfile from '../../models/PlayerProfile.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import RewardTransaction from '../../models/RewardTransaction.js';
import { getAdProviderAdapter } from './adProviderAdapter.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Rewarded Ad Service (Sections 40-51 Specifications)
 * Encapsulates the 9-state state machine, idempotency, caps, and reward grants.
 */
class RewardedAdService {
  constructor() {
    this.adapter = getAdProviderAdapter('SIMULATED_DEV_ADAPTER');
  }

  /**
   * Offer & initialize a new Rewarded Ad opportunity
   */
  async createOpportunity(userId, placement, options = {}) {
    const validPlacements = ['REVIVE', 'DOUBLE_SCORE', 'DOUBLE_CREDITS', 'POWER_UP', 'DAILY_BONUS', 'DAILY_SUPPLY', 'ENERGY_BOOST'];
    if (!validPlacements.includes(placement)) {
      throw new Error(`Invalid ad placement '${placement}'. Supported: ${validPlacements.join(', ')}`);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Daily Cap Check (Section 50: Max 10 granted ads per day)
    const adsTodayCount = await RewardedAdSession.countDocuments({
      user: userId,
      status: 'GRANTED',
      createdAt: { $gte: todayStart }
    });

    if (adsTodayCount >= 10) {
      const err = new Error('Daily rewarded ad limit reached (10/10). Resets at 00:00 UTC.');
      err.statusCode = 429;
      throw err;
    }

    // 2. Revive Limit Check (Max 3 revives per day)
    if (placement === 'REVIVE') {
      const revivesToday = await RewardedAdSession.countDocuments({
        user: userId,
        placement: 'REVIVE',
        status: 'GRANTED',
        createdAt: { $gte: todayStart }
      });

      if (revivesToday >= 3) {
        const err = new Error('Daily combat revive limit reached (3/3).');
        err.statusCode = 429;
        throw err;
      }
    }

    // 3. Minimum Cooldown Check (Section 50: 60 seconds between granted ads)
    const lastGrantedAd = await RewardedAdSession.findOne({
      user: userId,
      status: 'GRANTED'
    }).sort({ grantedAt: -1 });

    if (lastGrantedAd && lastGrantedAd.grantedAt) {
      const elapsedSeconds = (Date.now() - new Date(lastGrantedAd.grantedAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remaining = Math.ceil(60 - elapsedSeconds);
        const err = new Error(`Ad cooldown in progress. Please wait ${remaining}s.`);
        err.statusCode = 429;
        throw err;
      }
    }

    // Determine authoritative reward based on placement
    let reward = options.expectedReward || { currencyType: 'CREDITS', amount: 150 };
    if (placement === 'REVIVE') {
      reward = { currencyType: 'REVIVE', amount: 1 };
    } else if (placement === 'DOUBLE_CREDITS' && options.baseCredits) {
      reward = { currencyType: 'CREDITS', amount: Math.min(options.baseCredits, 2500) };
    } else if (placement === 'DOUBLE_SCORE' && options.baseScore) {
      reward = { currencyType: 'SCORE_MULTIPLIER', amount: 2.0 };
    } else if (placement === 'DAILY_BONUS') {
      reward = { currencyType: 'CREDITS', amount: 300 };
    }

    const adId = `ad-${uuidv4()}`;
    const durationSeconds = options.durationSeconds || 5;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiration

    const adSession = await RewardedAdSession.create({
      adId,
      user: userId,
      placement,
      status: 'INITIALIZED',
      durationSeconds,
      reward,
      provider: this.adapter.name,
      isSimulated: !this.adapter.isProduction,
      gameSessionId: options.gameSessionId || null,
      missionId: options.missionId || null,
      expiresAt
    });

    return {
      adId,
      placement,
      durationSeconds,
      state: adSession.status,
      expiresAt,
      providerInfo: this.adapter.getProviderInfo()
    };
  }

  /**
   * Update playback heartbeat
   */
  async recordHeartbeat(adId, userId, elapsedSeconds = 1) {
    const adSession = await RewardedAdSession.findOne({ adId, user: userId });
    if (!adSession) {
      const err = new Error('Ad session not found');
      err.statusCode = 404;
      throw err;
    }

    if (adSession.status === 'EXPIRED' || (adSession.expiresAt && new Date() > new Date(adSession.expiresAt))) {
      adSession.status = 'EXPIRED';
      await adSession.save();
      const err = new Error('Ad opportunity has expired');
      err.statusCode = 410;
      throw err;
    }

    if (adSession.status === 'GRANTED') {
      const err = new Error('Ad session already completed and granted');
      err.statusCode = 400;
      throw err;
    }

    adSession.watchedSeconds = Math.min(adSession.durationSeconds, (adSession.watchedSeconds || 0) + elapsedSeconds);
    adSession.status = 'PLAYING';
    await adSession.save();

    return {
      adId: adSession.adId,
      watchedSeconds: adSession.watchedSeconds,
      durationSeconds: adSession.durationSeconds,
      isComplete: adSession.watchedSeconds >= adSession.durationSeconds
    };
  }

  /**
   * Complete playback and verify through provider adapter
   */
  async verifyAd(adId, userId, payload = {}) {
    const adSession = await RewardedAdSession.findOne({ adId, user: userId });
    if (!adSession) {
      const err = new Error('Ad session not found');
      err.statusCode = 404;
      throw err;
    }

    if (adSession.status === 'GRANTED') {
      return { verified: true, alreadyGranted: true, state: 'GRANTED' };
    }

    adSession.status = 'VERIFYING';
    await adSession.save();

    const verificationResult = await this.adapter.verifyAdEvent(adSession, payload);

    if (!verificationResult.verified) {
      adSession.status = 'REJECTED';
      await adSession.save();
      const err = new Error(verificationResult.reason || 'Ad verification failed');
      err.statusCode = 400;
      throw err;
    }

    adSession.status = 'VERIFIED';
    adSession.completedAt = new Date();
    adSession.providerEventId = verificationResult.providerEventId;
    await adSession.save();

    return {
      verified: true,
      adId: adSession.adId,
      providerEventId: adSession.providerEventId,
      state: adSession.status,
      reward: adSession.reward
    };
  }

  /**
   * Atomically grant verified reward with idempotency protection
   */
  async claimReward(adId, userId) {
    const adSession = await RewardedAdSession.findOne({ adId, user: userId });
    if (!adSession) {
      const err = new Error('Ad session not found');
      err.statusCode = 404;
      throw err;
    }

    // IDEMPOTENCY CHECK: Section 39
    if (adSession.status === 'GRANTED') {
      const existingTx = await WalletTransaction.findOne({ referenceId: adId });
      return {
        success: true,
        isIdempotentReplay: true,
        message: 'Reward has already been safely granted',
        adId,
        state: 'GRANTED',
        reward: adSession.reward,
        transaction: existingTx
      };
    }

    if (adSession.status !== 'VERIFIED') {
      const err = new Error(`Cannot claim unverified ad session. Current status: ${adSession.status}`);
      err.statusCode = 400;
      throw err;
    }

    const profile = await PlayerProfile.findOne({ user: userId });
    if (!profile) {
      const err = new Error('Pilot profile not found');
      err.statusCode = 404;
      throw err;
    }

    let balanceBefore = profile.credits;
    let balanceAfter = profile.credits;
    let currencyType = 'CREDITS';
    const amount = adSession.reward.amount || 150;

    if (adSession.reward.currencyType === 'CREDITS') {
      balanceBefore = profile.credits;
      profile.credits += amount;
      balanceAfter = profile.credits;
      currencyType = 'CREDITS';
    } else if (adSession.reward.currencyType === 'ENERGY_CORES') {
      balanceBefore = profile.energyCores;
      profile.energyCores += amount;
      balanceAfter = profile.energyCores;
      currencyType = 'ENERGY_CORES';
    } else if (adSession.reward.currencyType === 'REWARD_COINS' || adSession.reward.currencyType === 'VELOP_REWARD_COINS') {
      balanceBefore = profile.velopRewardCoins;
      profile.velopRewardCoins += amount;
      balanceAfter = profile.velopRewardCoins;
      currencyType = 'VELOP_REWARD_COINS';
    }

    if (!profile.stats) profile.stats = {};
    profile.stats.adsWatchedToday = (profile.stats.adsWatchedToday || 0) + 1;
    profile.stats.lastAdWatched = new Date();

    if (adSession.placement === 'REVIVE') {
      profile.stats.revivesUsedToday = (profile.stats.revivesUsedToday || 0) + 1;
    }

    await profile.save();

    adSession.status = 'GRANTED';
    adSession.grantedAt = new Date();
    await adSession.save();

    // 1. Create Wallet Transaction entry (Section 36)
    const walletTx = await WalletTransaction.create({
      user: userId,
      transactionType: 'CREDIT',
      currencyType,
      amount,
      balanceBefore,
      balanceAfter,
      source: adSession.placement === 'REVIVE' ? 'REVIVE_DEDUCTION' : 'AD_BONUS_REWARD',
      referenceId: adId,
      description: `Verified rewarded ad: ${adSession.placement} (${this.adapter.name})`,
      status: 'COMPLETED'
    });

    // 2. Create Reward Transaction Ledger entry (Section 37)
    await RewardTransaction.create({
      user: userId,
      gameId: process.env.GAME_NAME || 'VOID HUNTER',
      sessionId: adSession.gameSessionId,
      missionId: adSession.missionId,
      rewardType: adSession.reward.currencyType || 'CREDITS',
      amount,
      multiplier: adSession.placement === 'DOUBLE_CREDITS' || adSession.placement === 'DOUBLE_SCORE' ? 2.0 : 1.0,
      source: `AD_${adSession.placement}`,
      adProvider: this.adapter.name,
      adEventId: adSession.providerEventId || adId,
      verificationStatus: 'VERIFIED',
      metadata: {
        isSimulated: !this.adapter.isProduction,
        durationSeconds: adSession.durationSeconds,
        watchedSeconds: adSession.watchedSeconds
      }
    });

    return {
      success: true,
      message: 'Reward successfully verified and deposited to wallet',
      adId,
      state: 'GRANTED',
      reward: adSession.reward,
      updatedBalances: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        velopRewardCoins: profile.velopRewardCoins
      },
      transactionId: walletTx._id
    };
  }
}

export const rewardedAdService = new RewardedAdService();
export default rewardedAdService;
