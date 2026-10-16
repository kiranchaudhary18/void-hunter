import mongoose from 'mongoose';

const playerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    pilotRank: {
      type: String,
      default: 'Star Cadet'
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    xpToNextLevel: {
      type: Number,
      default: 500
    },
    selectedShipId: {
      type: String,
      default: 'v01-orbitron'
    },
    // The 4 Distinct Currencies (Requirement Section 31)
    credits: {
      type: Number,
      default: 500,
      min: 0
    },
    energyCores: {
      type: Number,
      default: 10,
      min: 0
    },
    velopRewardCoins: {
      type: Number,
      default: 0,
      min: 0
    },
    // Combat & Progression Statistics
    stats: {
      totalScore: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
      enemiesDestroyed: { type: Number, default: 0 },
      bossesDefeated: { type: Number, default: 0 },
      missionsCompleted: { type: Number, default: 0 },
      totalPlayTimeSeconds: { type: Number, default: 0 },
      dailyStreak: { type: Number, default: 1 },
      lastDailyClaim: { type: Date, default: null },
      adsWatchedToday: { type: Number, default: 0 },
      revivesUsedToday: { type: Number, default: 0 }
    },
    // Daily Quests Progress
    dailyQuests: [
      {
        questId: { type: String, required: true },
        progress: { type: Number, default: 0 },
        target: { type: Number, default: 1 },
        completed: { type: Boolean, default: false },
        claimed: { type: Boolean, default: false }
      }
    ],
    lastQuestReset: {
      type: Date,
      default: null
    },
    // Unlocked Achievements
    achievements: [
      {
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        claimed: { type: Boolean, default: false }
      }
    ],
    // Player Preferences
    settings: {
      bgmVolume: { type: Number, default: 0.7, min: 0, max: 1 },
      sfxVolume: { type: Number, default: 0.8, min: 0, max: 1 },
      reducedMotion: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

const PlayerProfile = mongoose.model('PlayerProfile', playerProfileSchema);
export default PlayerProfile;
