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
      enum: ['REVIVE', 'DOUBLE_SCORE', 'DOUBLE_CREDITS', 'POWER_UP', 'DAILY_BONUS', 'DAILY_SUPPLY', 'ENERGY_BOOST'],
      required: true
    },
    status: {
      type: String,
      enum: [
        'OFFERED',
        'CREATED',
        'READY',
        'REQUESTED',
        'INITIALIZED',
        'PLAYING',
        'DISPLAYING',
        'HEARTBEAT',
        'COMPLETED',
        'VERIFYING',
        'VERIFIED',
        'GRANTED',
        'EXPIRED',
        'REJECTED'
      ],
      default: 'OFFERED',
      index: true
    },
    provider: {
      type: String,
      default: 'SIMULATED_DEV_ADAPTER'
    },
    isSimulated: {
      type: Boolean,
      default: true
    },
    gameSessionId: {
      type: String,
      default: null,
      index: true
    },
    missionId: {
      type: String,
      default: null
    },
    providerEventId: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
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
