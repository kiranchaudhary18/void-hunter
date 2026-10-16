import User from '../models/User.js';
import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import RewardedAdSession from '../models/RewardedAdSession.js';
import GameSession from '../models/GameSession.js';

/**
 * @desc    Comprehensive Economy Audit & Anti-Cheat Diagnostic Endpoint (Section 35 & 65)
 * @route   GET /api/admin/audit
 * @access  Public / Admin
 */
export const getEconomyAudit = async (req, res) => {
  try {
    // 1. User & Profile Metrics
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
    const totalTransactions = await WalletTransaction.countDocuments();
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
        totalTransactions
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
