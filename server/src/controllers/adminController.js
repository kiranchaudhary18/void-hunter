import User from '../models/User.js';
import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import RewardedAdSession from '../models/RewardedAdSession.js';
import RewardTransaction from '../models/RewardTransaction.js';
import GameSession from '../models/GameSession.js';
import EconomyConfig from '../models/EconomyConfig.js';

/**
 * @desc    Get High-Level Admin Economy Overview (Section 75 Specifications)
 * @route   GET /api/admin/overview
 * @access  Private/Admin
 */
export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const profiles = await PlayerProfile.find({});

    let totalCreditsInCirculation = 0;
    let totalCoresInCirculation = 0;
    let totalCoinsInCirculation = 0;

    profiles.forEach((p) => {
      totalCreditsInCirculation += p.credits || 0;
      totalCoresInCirculation += p.energyCores || 0;
      totalCoinsInCirculation += p.velopRewardCoins || 0;
    });

    // Wallet Ledger Metrics (Credits granted vs spent)
    const allCreditsTransactions = await WalletTransaction.find({ currencyType: 'CREDITS' });
    let totalCreditsGranted = 0;
    let totalCreditsSpent = 0;

    allCreditsTransactions.forEach((tx) => {
      if (tx.transactionType === 'CREDIT') {
        totalCreditsGranted += tx.amount;
      } else if (tx.transactionType === 'DEBIT') {
        totalCreditsSpent += tx.amount;
      }
    });

    // Ad Opportunity & Conversion Metrics (Section 75)
    const totalAdOpportunities = await RewardedAdSession.countDocuments();
    const completedAds = await RewardedAdSession.countDocuments({
      status: { $in: ['COMPLETED', 'VERIFIED', 'GRANTED'] }
    });
    const failedAds = await RewardedAdSession.countDocuments({
      status: { $in: ['REJECTED', 'EXPIRED'] }
    });
    const rejectedClaims = await RewardedAdSession.countDocuments({ status: 'REJECTED' });

    // Placement conversions
    const reviveOffered = await RewardedAdSession.countDocuments({ placement: 'REVIVE' });
    const reviveGranted = await RewardedAdSession.countDocuments({ placement: 'REVIVE', status: 'GRANTED' });

    const doubleScoreOffered = await RewardedAdSession.countDocuments({ placement: 'DOUBLE_SCORE' });
    const doubleScoreGranted = await RewardedAdSession.countDocuments({ placement: 'DOUBLE_SCORE', status: 'GRANTED' });

    const doubleCreditsOffered = await RewardedAdSession.countDocuments({ placement: 'DOUBLE_CREDITS' });
    const doubleCreditsGranted = await RewardedAdSession.countDocuments({ placement: 'DOUBLE_CREDITS', status: 'GRANTED' });

    const adCompletionRate = totalAdOpportunities > 0 ? ((completedAds / totalAdOpportunities) * 100).toFixed(1) + '%' : '100%';
    const reviveConversionRate = reviveOffered > 0 ? ((reviveGranted / reviveOffered) * 100).toFixed(1) + '%' : '100%';
    const doubleScoreConversionRate = doubleScoreOffered > 0 ? ((doubleScoreGranted / doubleScoreOffered) * 100).toFixed(1) + '%' : '100%';
    const doubleCreditsConversionRate = doubleCreditsOffered > 0 ? ((doubleCreditsGranted / doubleCreditsOffered) * 100).toFixed(1) + '%' : '100%';

    const averageRewardPerUser = totalUsers > 0 ? Math.round(totalCreditsGranted / totalUsers) : 0;

    // Security & Anti-Cheat Summary
    const totalGameSessions = await GameSession.countDocuments();
    const flaggedSessionsCount = await GameSession.countDocuments({
      'validation.antiCheatPassed': false
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        totalPilots: totalUsers,
        totalGameSessions,
        totalTransactions: allCreditsTransactions.length,
        totalRewardEvents: await RewardTransaction.countDocuments(),
        flaggedCheatSessions: flaggedSessionsCount
      },
      metrics: {
        totalAdOpportunities,
        completedAds,
        failedAds,
        rejectedClaims,
        totalCreditsGranted,
        totalCreditsSpent,
        netCirculation: totalCreditsGranted - totalCreditsSpent,
        averageRewardPerUser,
        adCompletionRate,
        reviveConversionRate,
        doubleScoreConversionRate,
        doubleCreditsConversionRate
      },
      circulation: {
        credits: totalCreditsInCirculation,
        energyCores: totalCoresInCirculation,
        velopRewardCoins: totalCoinsInCirculation
      }
    });
  } catch (error) {
    console.error('getAdminOverview Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating admin overview' });
  }
};

/**
 * @desc    Searchable, Filterable, Paginated Reward Audit Log (Section 37)
 * @route   GET /api/admin/rewards
 * @access  Private/Admin
 */
export const getRewardAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rewardType,
      verificationStatus,
      source,
      search,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (rewardType && rewardType !== 'ALL') {
      query.rewardType = rewardType;
    }
    if (verificationStatus && verificationStatus !== 'ALL') {
      query.verificationStatus = verificationStatus;
    }
    if (source && source !== 'ALL') {
      query.source = source;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by event ID, session ID, or user
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { user: { $in: userIds } },
        { adEventId: { $regex: search, $options: 'i' } },
        { sessionId: { $regex: search, $options: 'i' } },
        { missionId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await RewardTransaction.countDocuments(query);
    const transactions = await RewardTransaction.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      transactions
    });
  } catch (error) {
    console.error('getRewardAuditLogs Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving reward audit logs' });
  }
};

/**
 * @desc    Searchable, Filterable, Paginated Wallet Ledger (Section 36)
 * @route   GET /api/admin/wallet-ledger
 * @access  Private/Admin
 */
export const getWalletLedgerLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      transactionType,
      currencyType,
      source,
      search,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (transactionType && transactionType !== 'ALL') {
      query.transactionType = transactionType;
    }
    if (currencyType && currencyType !== 'ALL') {
      query.currencyType = currencyType;
    }
    if (source && source !== 'ALL') {
      query.source = source;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { user: { $in: userIds } },
        { referenceId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await WalletTransaction.countDocuments(query);
    const transactions = await WalletTransaction.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      transactions
    });
  } catch (error) {
    console.error('getWalletLedgerLogs Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving wallet ledger' });
  }
};

/**
 * @desc    Advertisement and Opportunity Monitor (Section 47 & 48)
 * @route   GET /api/admin/ad-opportunities
 * @access  Private/Admin
 */
export const getAdOpportunities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      placement,
      status,
      provider,
      search
    } = req.query;

    const query = {};

    if (placement && placement !== 'ALL') {
      query.placement = placement;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (provider && provider !== 'ALL') {
      query.provider = provider;
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { user: { $in: userIds } },
        { adId: { $regex: search, $options: 'i' } },
        { gameSessionId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await RewardedAdSession.countDocuments(query);
    const sessions = await RewardedAdSession.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary statistics for monitor header
    const totalCreated = await RewardedAdSession.countDocuments();
    const totalGranted = await RewardedAdSession.countDocuments({ status: 'GRANTED' });
    const totalRejected = await RewardedAdSession.countDocuments({ status: 'REJECTED' });
    const totalExpired = await RewardedAdSession.countDocuments({ status: 'EXPIRED' });

    return res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      summary: {
        totalCreated,
        totalGranted,
        totalRejected,
        totalExpired,
        activeSimulatedCount: await RewardedAdSession.countDocuments({ isSimulated: true })
      },
      sessions
    });
  } catch (error) {
    console.error('getAdOpportunities Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving ad opportunities' });
  }
};

/**
 * @desc    Get Active Economy Configuration (Section 35)
 * @route   GET /api/admin/economy-config
 * @access  Private/Admin
 */
export const getEconomyConfiguration = async (req, res) => {
  try {
    const config = await EconomyConfig.getActiveConfig();
    return res.status(200).json({
      success: true,
      config
    });
  } catch (error) {
    console.error('getEconomyConfiguration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving economy configuration' });
  }
};

/**
 * @desc    Update Economy Configuration with Strict Backend Validation (Section 35)
 * @route   PUT /api/admin/economy-config
 * @access  Private/Admin
 */
export const updateEconomyConfiguration = async (req, res) => {
  try {
    const config = await EconomyConfig.getActiveConfig();
    const updates = req.body || {};
    const changedFields = {};
    const previousValues = {};

    // Validate and apply numeric limits
    const allowedNumericFields = {
      maxDailyAds: { min: 1, max: 100 },
      maxSessionAds: { min: 1, max: 50 },
      minSecondsBetweenAds: { min: 5, max: 3600 },
      maxDailyRevives: { min: 1, max: 20 },
      standardMissionCredits: { min: 10, max: 5000 },
      bossDefeatCredits: { min: 50, max: 20000 },
      dailyMissionCredits: { min: 25, max: 5000 }
    };

    for (const [field, bounds] of Object.entries(allowedNumericFields)) {
      if (updates[field] !== undefined) {
        const val = Number(updates[field]);
        if (isNaN(val) || val < bounds.min || val > bounds.max) {
          return res.status(400).json({
            success: false,
            message: `Field '${field}' must be a number between ${bounds.min} and ${bounds.max}`
          });
        }
        if (config[field] !== val) {
          previousValues[field] = config[field];
          config[field] = val;
          changedFields[field] = val;
        }
      }
    }

    // Validate and apply boolean toggles
    const allowedBooleanFields = ['reviveEnabled', 'doubleScoreEnabled', 'doubleCreditsEnabled', 'extraShieldEnabled'];
    for (const field of allowedBooleanFields) {
      if (updates[field] !== undefined) {
        const val = Boolean(updates[field]);
        if (config[field] !== val) {
          previousValues[field] = config[field];
          config[field] = val;
          changedFields[field] = val;
        }
      }
    }

    if (Object.keys(changedFields).length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No configuration modifications requested',
        config
      });
    }

    // Record immutable audit trail entry
    config.auditLog.push({
      changedBy: req.user.id,
      changedByName: req.user.name || 'Administrator',
      changedAt: new Date(),
      changedFields,
      previousValues,
      reason: updates.reason || 'Administrative economy balance update'
    });

    await config.save();

    return res.status(200).json({
      success: true,
      message: 'Economy configuration safely updated and audited',
      changedFields,
      config
    });
  } catch (error) {
    console.error('updateEconomyConfiguration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating economy configuration' });
  }
};

/**
 * @desc    Comprehensive Double-Entry Mathematical Balance & Diagnostic Audit (Section 74)
 * @route   GET /api/admin/audit
 * @access  Private/Admin
 */
export const getEconomyAudit = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const profiles = await PlayerProfile.find({});

    let totalCreditsInCirculation = 0;
    let totalCoresInCirculation = 0;
    let totalCoinsInCirculation = 0;

    profiles.forEach((p) => {
      totalCreditsInCirculation += p.credits || 0;
      totalCoresInCirculation += p.energyCores || 0;
      totalCoinsInCirculation += p.velopRewardCoins || 0;
    });

    // 2. Transaction Ledger Metrics
    const allTransactions = await WalletTransaction.find({});
    let ledgerCreditSum = 0;
    let ledgerDebitSum = 0;
    let ledgerInconsistencies = 0;

    allTransactions.forEach((tx) => {
      if (tx.currencyType === 'CREDITS') {
        if (tx.transactionType === 'CREDIT') {
          ledgerCreditSum += tx.amount;
          if (tx.balanceBefore + tx.amount !== tx.balanceAfter) {
            ledgerInconsistencies++;
          }
        } else if (tx.transactionType === 'DEBIT') {
          ledgerDebitSum += tx.amount;
          if (tx.balanceBefore - tx.amount !== tx.balanceAfter) {
            ledgerInconsistencies++;
          }
        }
      }
    });

    // 3. Rewarded Ad Conversion Metrics
    const totalAdsOffered = await RewardedAdSession.countDocuments();
    const totalAdsGranted = await RewardedAdSession.countDocuments({ status: 'GRANTED' });
    const totalAdsRevive = await RewardedAdSession.countDocuments({ placement: 'REVIVE', status: 'GRANTED' });
    const totalAdsDoubleCredits = await RewardedAdSession.countDocuments({ placement: 'DOUBLE_CREDITS', status: 'GRANTED' });
    const adCompletionRate = totalAdsOffered > 0 ? ((totalAdsGranted / totalAdsOffered) * 100).toFixed(1) + '%' : '100%';

    // 4. Anti-Cheat & Combat Session Auditing
    const totalGameSessions = await GameSession.countDocuments();
    const flaggedCheatSessions = await GameSession.find({
      'validation.antiCheatPassed': false
    }).populate('user', 'name email');

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      systemHealth: ledgerInconsistencies === 0 ? 'OPTIMAL' : 'ANOMALY_DETECTED',
      overview: {
        totalPilots: totalUsers,
        totalGameSessions,
        totalTransactions: allTransactions.length
      },
      currencyCirculation: {
        totalCredits: totalCreditsInCirculation,
        totalEnergyCores: totalCoresInCirculation,
        totalVelRewardCoins: totalCoinsInCirculation
      },
      ledgerAudit: {
        totalCreditsMinted: ledgerCreditSum,
        totalCreditsSunk: ledgerDebitSum,
        netCirculation: ledgerCreditSum - ledgerDebitSum,
        totalRewardLedgerEvents: await RewardTransaction.countDocuments(),
        ledgerInconsistencies,
        isDoubleEntryBalanced: ledgerInconsistencies === 0
      },
      rewardedAdEconomy: {
        totalOffered: totalAdsOffered,
        totalGranted: totalAdsGranted,
        completionRate: adCompletionRate,
        revivesClaimed: totalAdsRevive,
        doubleCreditsClaimed: totalAdsDoubleCredits
      },
      securityAndAntiCheat: {
        flaggedSessionsCount: flaggedCheatSessions.length,
        flaggedSessions: flaggedCheatSessions
      }
    });
  } catch (error) {
    console.error('getEconomyAudit Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating economy audit' });
  }
};

export default {
  getAdminOverview,
  getRewardAuditLogs,
  getWalletLedgerLogs,
  getAdOpportunities,
  getEconomyConfiguration,
  updateEconomyConfiguration,
  getEconomyAudit
};
