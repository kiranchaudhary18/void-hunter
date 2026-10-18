import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { PORT, GAME_NAME, CLIENT_URL } from './config/gameConfig.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import shipRoutes from './routes/shipRoutes.js';
import powerUpRoutes from './routes/powerUpRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import adRoutes from './routes/adRoutes.js';
import questRoutes from './routes/questRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import engagementRoutes from './routes/engagementRoutes.js';
import EconomyConfig from './models/EconomyConfig.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === CLIENT_URL ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ships', shipRoutes);
app.use('/api/powerups', powerUpRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Section 57 & 58: Supply Drops & Limited Events
app.use('/api', engagementRoutes);

// Section 68: Specification Route Aliases
app.use('/api/games', missionRoutes);
app.use('/api/daily-missions', questRoutes);
app.use('/api/achievements', questRoutes);

// Health Check & Dynamic Game Name Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    gameName: GAME_NAME,
    timestamp: new Date().toISOString()
  });
});

// Economy Config Endpoint (Section 35 Requirement)
app.get('/api/economy/config', async (req, res) => {
  try {
    const config = await EconomyConfig.getActiveConfig();
    res.status(200).json({
      success: true,
      gameName: GAME_NAME,
      economy: {
        maxDailyAds: config.maxDailyAds,
        maxSessionAds: config.maxSessionAds,
        minSecondsBetweenAds: config.minSecondsBetweenAds,
        maxDailyRevives: config.maxDailyRevives,
        standardMissionCredits: config.standardMissionCredits,
        bossDefeatCredits: config.bossDefeatCredits,
        dailyMissionCredits: config.dailyMissionCredits,
        reviveEnabled: config.reviveEnabled,
        doubleScoreEnabled: config.doubleScoreEnabled,
        doubleCreditsEnabled: config.doubleCreditsEnabled,
        extraShieldEnabled: config.extraShieldEnabled,
        rewardMultipliers: {
          doubleCredits: 2.0,
          doubleScore: 2.0
        }
      }
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      gameName: GAME_NAME,
      economy: {
        maxDailyAds: 10,
        maxSessionAds: 5,
        minSecondsBetweenAds: 60,
        maxDailyRevives: 3,
        rewardMultipliers: {
          doubleCredits: 2.0,
          doubleScore: 2.0
        }
      }
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`
======================================================
  🚀 ${GAME_NAME.toUpperCase()} BACKEND SERVER ONLINE
  📡 Port: http://localhost:${PORT}
  🛰️ Client Allowed: ${CLIENT_URL}
======================================================
      `);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error);
    process.exit(1);
  }
};

startServer();
