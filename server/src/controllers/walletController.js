import PlayerProfile from '../models/PlayerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';

/**
 * @desc    Get pilot's current balances and level progression
 * @route   GET /api/wallet/balance
 * @access  Private
 */
export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await PlayerProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pilot profile not found' });
    }

    return res.status(200).json({
      success: true,
      balance: {
        credits: profile.credits,
        energyCores: profile.energyCores,
        rewardCoins: profile.rewardCoins,
        xp: profile.xp,
        level: profile.level,
        xpToNextLevel: profile.xpToNextLevel,
        pilotRank: profile.pilotRank
      }
    });
  } catch (error) {
    console.error('getWalletBalance Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving balance' });
  }
};

/**
 * @desc    Get pilot's double-entry immutable transaction ledger
 * @route   GET /api/wallet/ledger
 * @access  Private
 */
export const getWalletLedger = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currency, limit = 50, page = 1 } = req.query;

    const query = { user: userId };
    if (currency && currency !== 'ALL') {
      query.currencyType = currency;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await WalletTransaction.countDocuments(query);
    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      transactions
    });
  } catch (error) {
    console.error('getWalletLedger Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving ledger transactions' });
  }
};

/**
 * @desc    Get economy summary metrics for current pilot
 * @route   GET /api/wallet/summary
 * @access  Private
 */
export const getWalletSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await WalletTransaction.find({ user: userId });

    let totalCreditsEarned = 0;
    let totalCreditsSpent = 0;
    let totalAdsClaimed = 0;

    transactions.forEach((tx) => {
      if (tx.currencyType === 'CREDITS') {
        if (tx.transactionType === 'CREDIT') {
          totalCreditsEarned += tx.amount;
        } else if (tx.transactionType === 'DEBIT') {
          totalCreditsSpent += tx.amount;
        }
      }
      if (tx.source.startsWith('AD_')) {
        totalAdsClaimed++;
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalTransactions: transactions.length,
        totalCreditsEarned,
        totalCreditsSpent,
        totalAdsClaimed,
        netBalance: totalCreditsEarned - totalCreditsSpent
      }
    });
  } catch (error) {
    console.error('getWalletSummary Error:', error);
    return res.status(500).json({ success: false, message: 'Server error calculating wallet summary' });
  }
};
