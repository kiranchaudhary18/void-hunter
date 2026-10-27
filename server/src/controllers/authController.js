import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';
import cloudinary from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PlayerProfile from '../models/PlayerProfile.js';
import PlayerShip from '../models/PlayerShip.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { JWT_SECRET, JWT_EXPIRES_IN, ECONOMY_CONFIG, getPilotRankForLevel, getLevelData } from '../config/gameConfig.js';
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
      xpToNextLevel: 50,
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
        role: user.role,
        avatarUrl: user.avatarUrl || ''
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
      const missionsCompleted = profile.stats?.missionsCompleted || 0;
      const prog = getLevelData(profile.xp || 0, missionsCompleted);
      let changed = false;
      if (profile.level < prog.level) {
        profile.level = prog.level;
        changed = true;
      }
      if (profile.xpToNextLevel !== prog.xpToNextLevel) {
        profile.xpToNextLevel = prog.xpToNextLevel;
        changed = true;
      }
      if (profile.pilotRank !== prog.pilotRank) {
        profile.pilotRank = prog.pilotRank;
        changed = true;
      }
      if (changed) {
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
        role: user.role,
        avatarUrl: user.avatarUrl || ''
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
        role: user.role,
        avatarUrl: user.avatarUrl || ''
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

/**
 * @desc    Update pilot name and/or avatar photo (uploaded to Cloudinary)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, avatarUrl } = req.body;
    const imagePayload = avatar || avatarUrl;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pilot account not found'
      });
    }

    if (name && typeof name === 'string' && name.trim().length > 0) {
      user.name = name.trim();
    }

    let profile = await PlayerProfile.findOne({ user: user._id });

    if (imagePayload) {
      if (typeof imagePayload === 'string' && imagePayload.startsWith('data:image')) {
        const uploadResponse = await cloudinary.uploader.upload(imagePayload, {
          folder: 'void_hunter_avatars',
          transformation: [
            { width: 256, height: 256, crop: 'fill', gravity: 'face' }
          ]
        });
        user.avatarUrl = uploadResponse.secure_url;
        if (profile) {
          profile.avatarUrl = uploadResponse.secure_url;
        }
      } else if (typeof imagePayload === 'string' && imagePayload.startsWith('http')) {
        user.avatarUrl = imagePayload;
        if (profile) {
          profile.avatarUrl = imagePayload;
        }
      }
    }

    await user.save();
    if (profile) {
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Pilot dossier & profile photo updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || ''
      },
      profile
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating pilot profile'
    });
  }
};

/**
 * @desc    Generate password recovery token & dispatch email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pilot email address'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    // If pilot not yet registered with this email, auto-create pilot account so ANY email receives the link!
    if (!user) {
      const defaultName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'Pilot';
      const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const temporaryPassword = crypto.randomBytes(16).toString('hex');

      user = await User.create({
        name: `Commander ${capitalizedName}`,
        email: cleanEmail,
        password: temporaryPassword
      });

      // Initialize pilot profile with starter currencies
      await PlayerProfile.create({
        user: user._id,
        pilotRank: 'Star Cadet',
        level: 1,
        xp: 0,
        xpToNextLevel: 50,
        selectedShipId: ECONOMY_CONFIG.initialShipId,
        credits: ECONOMY_CONFIG.initialCredits,
        energyCores: ECONOMY_CONFIG.initialEnergyCores,
        velopRewardCoins: ECONOMY_CONFIG.initialRewardCoins
      });

      // Initialize starter ships
      const starterShips = [
        { user: user._id, shipId: 'v01-orbitron', isUnlocked: true, unlockedAt: new Date() },
        { user: user._id, shipId: 's02-phoenix', isUnlocked: false },
        { user: user._id, shipId: 'x03-shadow', isUnlocked: false },
        { user: user._id, shipId: 'r04-titan', isUnlocked: false },
        { user: user._id, shipId: 'z05-nova', isUnlocked: false }
      ];
      await PlayerShip.insertMany(starterShips);

      // Record welcome bonus transaction
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
    }

    // Generate unhashed reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to user
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes validity
    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientBaseUrl}/reset-password/${resetToken}`;

    // Send email
    try {
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        pilotName: user.name,
        resetUrl,
        resetToken
      });

      return res.status(200).json({
        success: true,
        message: 'Quantum recovery link successfully transmitted to pilot email.',
        previewUrl: emailResult.previewUrl,
        resetUrl: resetUrl,
        isSimulated: emailResult.isSimulated || false
      });
    } catch (mailErr) {
      console.error('Email Dispatch Error:', mailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email transmission failed. Please verify server SMTP configuration.'
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing password recovery'
    });
  }
};

/**
 * @desc    Reset password using valid token
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing recovery token'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Hash the token from URL parameter to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Recovery token is invalid or has expired. Please request a new recovery link.'
      });
    }

    // Set new password (triggers pre-save bcrypt hash)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate fresh JWT token
    const authToken = generateToken(user._id);
    const profile = await PlayerProfile.findOne({ user: user._id });

    return res.status(200).json({
      success: true,
      message: 'Pilot security credentials successfully updated! Access restored.',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || ''
      },
      profile
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating pilot password'
    });
  }
};
