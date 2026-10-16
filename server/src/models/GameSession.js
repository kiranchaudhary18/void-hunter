import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    sessionId: {
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
    missionId: {
      type: String,
      required: true
    },
    sectorId: {
      type: String,
      required: true
    },
    shipId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'DEFEATED', 'ABANDONED'],
      default: 'ACTIVE'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    // In-game Telemetry submitted at completion
    telemetry: {
      score: { type: Number, default: 0 },
      enemiesKilled: { type: Number, default: 0 },
      bossDefeated: { type: Boolean, default: false },
      accuracyPercentage: { type: Number, default: 0 },
      damageTaken: { type: Number, default: 0 },
      powerupsCollected: { type: Number, default: 0 },
      powerupsUsed: { type: Number, default: 0 },
      reviveUsed: { type: Boolean, default: false }
    },
    // Star Rating (1 to 3 stars)
    starsAwarded: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    // Validation flags for Anti-Cheat (Section 65)
    validation: {
      isValidated: { type: Boolean, default: false },
      antiCheatPassed: { type: Boolean, default: false },
      failureReason: { type: String, default: null }
    },
    // Rewards calculated and granted
    rewardsGranted: {
      credits: { type: Number, default: 0 },
      energyCores: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
      claimed: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
