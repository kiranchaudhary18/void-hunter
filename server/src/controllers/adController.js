import RewardedAdSession from '../models/RewardedAdSession.js';
import rewardedAdService from '../services/ads/rewardedAdService.js';
import { getAdProviderAdapter } from '../services/ads/adProviderAdapter.js';

/**
 * @desc    Get current ad provider configuration & simulation status (Section 48)
 * @route   GET /api/ads/provider
 * @access  Public
 */
export const getProviderInfo = (req, res) => {
  const adapter = getAdProviderAdapter();
  return res.status(200).json({
    success: true,
    ...adapter.getProviderInfo()
  });
};

/**
 * @desc    Check eligibility and initialize a 9-state Rewarded Ad session (Sections 40-50)
 * @route   POST /api/ads/offer
 * @access  Private
 */
export const offerAd = async (req, res) => {
  try {
    const userId = req.user.id;
    const { placement, expectedReward, gameSessionId, missionId, durationSeconds } = req.body;

    const sessionData = await rewardedAdService.createOpportunity(userId, placement, {
      expectedReward,
      gameSessionId,
      missionId,
      durationSeconds: durationSeconds ? Number(durationSeconds) : 5
    });

    return res.status(201).json({
      success: true,
      ...sessionData,
      message: 'Rewarded ad session initialized'
    });
  } catch (error) {
    console.error('offerAd Error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error initializing ad session' });
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

    const result = await rewardedAdService.recordHeartbeat(adId, userId, elapsedSeconds || 1);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('adHeartbeat Error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error updating ad heartbeat' });
  }
};

/**
 * @desc    Verify ad completion through provider adapter, transition to VERIFIED, and grant reward atomically (Section 46, 48)
 * @route   POST /api/ads/:adId/verify
 * @access  Private
 */
export const verifyAdReward = async (req, res) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    // 1. Verify playback with ad provider adapter
    await rewardedAdService.verifyAd(adId, userId, req.body || {});

    // 2. Atomically credit wallet & reward ledgers with idempotency guarantee
    const claimResult = await rewardedAdService.claimReward(adId, userId);

    return res.status(200).json({
      success: true,
      ...claimResult
    });
  } catch (error) {
    console.error('verifyAdReward Error:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error verifying ad reward' });
  }
};

/**
 * @desc    Get pilot's recent rewarded ad audit history
 * @route   GET /api/ads/history
 * @access  Private
 */
export const getAdHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await RewardedAdSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('getAdHistory Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving ad history' });
  }
};

export default {
  getProviderInfo,
  offerAd,
  adHeartbeat,
  verifyAdReward,
  getAdHistory
};
