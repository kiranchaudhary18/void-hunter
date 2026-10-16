import express from 'express';
import { getMissions, startMission, completeMission } from '../controllers/missionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMissions);
router.post('/:missionId/start', protect, startMission);
router.post('/:sessionId/complete', protect, completeMission);

export default router;
