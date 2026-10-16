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

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ships', shipRoutes);
app.use('/api/powerups', powerUpRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/ads', adRoutes);

// Health Check & Dynamic Game Name Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    gameName: GAME_NAME,
    timestamp: new Date().toISOString()
  });
});

// Economy Config Endpoint (Section 35 Requirement)
app.get('/api/economy/config', (req, res) => {
  res.status(200).json({
    success: true,
    gameName: GAME_NAME,
    economy: {
      maxDailyAds: 10,
      maxSessionAds: 5,
      minSecondsBetweenAds: 60,
      maxDailyRevives: 3,
      maxDailyDoubleCredits: 5,
      rewardMultipliers: {
        doubleCredits: 2.0,
        doubleScore: 2.0
      }
    }
  });
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
