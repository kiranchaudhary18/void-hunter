import mongoose from 'mongoose';

const rewardedAdSessionSchema = new mongoose.Schema(
  {
    adId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    placement: {
      type: String,
      enum: ['REVIVE', 'DOUBLE_CREDITS', 'DAILY_SUPPLY', 'ENERGY_BOOST'],
      required: true
    },
    status: {
      type: String,
      enum: [
        'OFFERED',
        'REQUESTED',
        'INITIALIZED',
        'PLAYING',
        'HEARTBEAT',
        'COMPLETED',
        'VERIFYING',
        'GRANTED',
        'EXPIRED',
        'REJECTED'
      ],
      default: 'OFFERED',
      index: true
    },
    durationSeconds: {
      type: Number,
      default: 5
    },
    watchedSeconds: {
      type: Number,
      default: 0
    },
    reward: {
      currencyType: {
        type: String,
        enum: ['CREDITS', 'ENERGY_CORES', 'REWARD_COINS', 'REVIVE'],
        default: 'CREDITS'
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    verificationHash: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date
    },
    grantedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const RewardedAdSession = mongoose.model('RewardedAdSession', rewardedAdSessionSchema);
export default RewardedAdSession;
