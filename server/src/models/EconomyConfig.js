import mongoose from 'mongoose';

/**
 * Server-Controlled Economy Configuration Model (Sections 34, 35, & Part XIII)
 * Persists authoritative game economy limits, reward values, and an immutable
 * audit trail of administrative adjustments.
 */
const economyConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'active_economy_config'
    },
    // Ad & Session Limits (Section 50)
    maxDailyAds: {
      type: Number,
      default: 10,
      min: [1, 'Daily ad cap must be at least 1'],
      max: [100, 'Daily ad cap cannot exceed 100']
    },
    maxSessionAds: {
      type: Number,
      default: 5,
      min: [1, 'Session ad cap must be at least 1'],
      max: [50, 'Session ad cap cannot exceed 50']
    },
    minSecondsBetweenAds: {
      type: Number,
      default: 60,
      min: [5, 'Ad cooldown must be at least 5 seconds'],
      max: [3600, 'Ad cooldown cannot exceed 3600 seconds']
    },
    maxDailyRevives: {
      type: Number,
      default: 3,
      min: [1, 'Daily revive cap must be at least 1'],
      max: [20, 'Daily revive cap cannot exceed 20']
    },
    // Reward Payout Values (Section 32)
    standardMissionCredits: {
      type: Number,
      default: 100,
      min: [10, 'Standard mission credits must be at least 10'],
      max: [5000, 'Standard mission credits cannot exceed 5000']
    },
    bossDefeatCredits: {
      type: Number,
      default: 250,
      min: [50, 'Boss defeat credits must be at least 50'],
      max: [20000, 'Boss defeat credits cannot exceed 20000']
    },
    dailyMissionCredits: {
      type: Number,
      default: 150,
      min: [25, 'Daily mission credits must be at least 25'],
      max: [5000, 'Daily mission credits cannot exceed 5000']
    },
    // Feature Toggles (Section 34)
    reviveEnabled: {
      type: Boolean,
      default: true
    },
    doubleScoreEnabled: {
      type: Boolean,
      default: true
    },
    doubleCreditsEnabled: {
      type: Boolean,
      default: true
    },
    extraShieldEnabled: {
      type: Boolean,
      default: true
    },
    // Immutable Audit Trail of Admin Adjustments (Section 35)
    auditLog: [
      {
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        changedByName: {
          type: String,
          default: 'System Administrator'
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        changedFields: {
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },
        previousValues: {
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },
        reason: {
          type: String,
          default: 'Administrative economic balancing'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

/**
 * Get or initialize active economy configuration singleton
 */
economyConfigSchema.statics.getActiveConfig = async function () {
  let config = await this.findOne({ key: 'active_economy_config' });
  if (!config) {
    config = await this.create({ key: 'active_economy_config' });
  }
  return config;
};

const EconomyConfig = mongoose.model('EconomyConfig', economyConfigSchema);
export default EconomyConfig;
