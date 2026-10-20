import mongoose from 'mongoose';

const playerMissionProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    missionId: {
      type: String,
      required: true
    },
    sectorId: {
      type: String,
      required: true
    },
    sequence: {
      type: Number,
      required: true
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    stars: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    highScore: {
      type: Number,
      default: 0
    },
    bestTimeSeconds: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    },
    claimedRewards: {
      credits: { type: Number, default: 0 },
      energyCores: { type: Number, default: 0 },
      xp: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate mission progress per user
playerMissionProgressSchema.index({ user: 1, missionId: 1 }, { unique: true });

const PlayerMissionProgress = mongoose.model('PlayerMissionProgress', playerMissionProgressSchema);
export default PlayerMissionProgress;
