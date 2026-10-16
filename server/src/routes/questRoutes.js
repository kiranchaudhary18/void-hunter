import express from 'express';
import { 
  getQuestsAndAchievements, 
  claimDailyStreak, 
  claimDailyQuest, 
  claimAchievement 
} from '../controllers/questController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getQuestsAndAchievements);
router.post('/streak/claim', protect, claimDailyStreak);
router.post('/:questId/claim', protect, claimDailyQuest);
router.post('/achievements/:achievementId/claim', protect, claimAchievement);

export default router;
