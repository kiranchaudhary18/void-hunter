import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PlayerProfile from '../models/PlayerProfile.js';
import PlayerShip from '../models/PlayerShip.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { JWT_SECRET, JWT_EXPIRES_IN, ECONOMY_CONFIG, getPilotRankForLevel } from '../config/gameConfig.js';
import { v4 as uuidv4 } from 'uuid';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * @desc    Register a new pilot account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide callsign, email, and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A pilot account with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create initial player profile with starter currencies
    const profile = await PlayerProfile.create({
      user: user._id,
      pilotRank: 'Star Cadet',
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      selectedShipId: ECONOMY_CONFIG.initialShipId,
      credits: ECONOMY_CONFIG.initialCredits,
      energyCores: ECONOMY_CONFIG.initialEnergyCores,
      velopRewardCoins: ECONOMY_CONFIG.initialRewardCoins
    });

    // Initialize all 5 ship entries for the player (V-01 Orbitron unlocked)
    const starterShips = [
      { user: user._id, shipId: 'v01-orbitron', isUnlocked: true, unlockedAt: new Date() },
      { user: user._id, shipId: 's02-phoenix', isUnlocked: false },
      { user: user._id, shipId: 'x03-shadow', isUnlocked: false },
      { user: user._id, shipId: 'r04-titan', isUnlocked: false },
      { user: user._id, shipId: 'z05-nova', isUnlocked: false }
    ];
    await PlayerShip.insertMany(starterShips);

    // Record initial ledger transaction for welcome bonus (Double-entry compliance)
    await WalletTransaction.create({
      user: user._id,
      transactionType: 'CREDIT',
      currencyType: 'CREDITS',
      amount: ECONOMY_CONFIG.initialCredits,
      balanceBefore: 0,
      balanceAfter: ECONOMY_CONFIG.initialCredits,
      source: 'INITIAL_GRANT',
      referenceId: `grant-${uuidv4()}`,
      description: 'Pilot Academy Welcome Bonus Package',
      status: 'COMPLETED'
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during pilot registration'
    });
  }
};

/**
 * @desc    Authenticate pilot & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid pilot credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid pilot credentials'
      });
    }

    // Fetch up-to-date player profile
    let profile = await PlayerProfile.findOne({ user: user._id });
    if (profile) {
      const correctRank = getPilotRankForLevel(profile.level);
      if (profile.pilotRank !== correctRank) {
        profile.pilotRank = correctRank;
        await profile.save();
      }
    }
    if (!profile) {
      // Self-heal profile if missing
      profile = await PlayerProfile.create({
        user: user._id,
        credits: 500,
        energyCores: 10
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during pilot authentication'
    });
  }
};

/**
 * @desc    Get current logged in pilot details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await PlayerProfile.findOne({ user: req.user.id });
    if (profile) {
      const correctRank = getPilotRankForLevel(profile.level);
      if (profile.pilotRank !== correctRank) {
        profile.pilotRank = correctRank;
        await profile.save();
      }
    }
    const ships = await PlayerShip.find({ user: req.user.id });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile,
      ships
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving pilot profile'
    });
  }
};
