import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getLeaderboard);

export default router;
