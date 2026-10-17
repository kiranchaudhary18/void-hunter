import mongoose from 'mongoose';

/**
 * Reward Transaction Ledger Model (Section 37 Specifications)
 * Tracks all authoritative reward events, ad callbacks, multipliers,
 * verification outcomes, and anti-fraud idempotency keys.
 */
const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    gameId: {
      type: String,
      default: process.env.GAME_NAME || 'VOID HUNTER'
    },
    sessionId: {
      type: String,
      index: true
    },
    missionId: {
      type: String
    },
    rewardType: {
      type: String,
      enum: ['CREDITS', 'ENERGY_CORES', 'VELOP_REWARD_COINS', 'XP', 'REVIVE', 'POWER_UP', 'STREAK_BONUS'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    multiplier: {
      type: Number,
      default: 1.0
    },
    source: {
      type: String,
      enum: [
        'MISSION_COMPLETION',
        'BOSS_DEFEAT',
        'AD_REVIVE',
        'AD_DOUBLE_CREDITS',
        'AD_DOUBLE_SCORE',
        'AD_POWER_UP',
        'AD_DAILY_BONUS',
        'DAILY_CLAIM',
        'ACHIEVEMENT_REWARD',
        'SUPPLY_DROP',
        'EVENT_REWARD'
      ],
      required: true
    },
    adProvider: {
      type: String,
      default: 'SIMULATED_DEV_ADAPTER'
    },
    adEventId: {
      type: String,
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'REJECTED', 'PENDING', 'EXPIRED'],
      default: 'VERIFIED'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

rewardTransactionSchema.index({ user: 1, adEventId: 1 }, { unique: true, sparse: true });

const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema);
export default RewardTransaction;
