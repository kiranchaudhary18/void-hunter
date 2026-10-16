import mongoose from 'mongoose';

const playerShipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shipId: {
      type: String,
      required: true,
      enum: ['v01-orbitron', 's02-phoenix', 'x03-shadow', 'r04-titan', 'z05-nova']
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: {
      type: Date,
      default: null
    },
    // Upgrades matching Screen 5 (Hangar)
    upgrades: {
      weapon: { type: Number, default: 1, min: 1, max: 5 },
      shield: { type: Number, default: 1, min: 1, max: 5 },
      engine: { type: Number, default: 1, min: 1, max: 5 },
      special: { type: Number, default: 1, min: 1, max: 5 }
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate ship entries per user
playerShipSchema.index({ user: 1, shipId: 1 }, { unique: true });

const PlayerShip = mongoose.model('PlayerShip', playerShipSchema);
export default PlayerShip;
