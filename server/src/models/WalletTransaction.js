import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    transactionType: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true
    },
    currencyType: {
      type: String,
      enum: ['CREDITS', 'ENERGY_CORES', 'REWARD_COINS', 'XP'],
      default: 'CREDITS'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    balanceBefore: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      required: true,
      enum: [
        'INITIAL_GRANT',
        'MISSION_COMPLETION',
        'BOSS_DEFEAT',
        'DAILY_CLAIM',
        'ACHIEVEMENT_REWARD',
        'AD_DOUBLE_CREDITS',
        'AD_BONUS_REWARD',
        'SUPPLY_DROP',
        'SHIP_PURCHASE',
        'SHIP_UPGRADE',
        'POWER_UP_PURCHASE',
        'REVIVE_DEDUCTION',
        'ADMIN_ADJUSTMENT'
      ]
    },
    referenceId: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'FAILED', 'REVERSED'],
      default: 'COMPLETED'
    }
  },
  {
    timestamps: true
  }
);

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
