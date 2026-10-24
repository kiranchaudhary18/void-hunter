import express from 'express';
import { 
  getSupplyDropStatus, 
  claimSupplyDrop, 
  getEvents, 
  claimEventReward, 
  getRaidBossStatus, 
  contributeRaidBossDamage 
} from '../controllers/engagementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Section 57: Supply Drop routes
router.get('/supply-drop/status', protect, getSupplyDropStatus);
router.post('/supply-drop/claim', protect, claimSupplyDrop);

// Section 58: Limited-Time Events routes
router.get('/events', protect, getEvents);
router.post('/events/:eventId/claim', protect, claimEventReward);


// Section 58B: World Raid Boss Challenge
router.get('/events/raid-boss', getRaidBossStatus);
router.post('/events/raid-boss/attack', protect, contributeRaidBossDamage);

export default router;
