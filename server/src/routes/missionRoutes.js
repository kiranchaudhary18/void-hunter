import express from 'express';
import { getMissions, startMission, completeMission } from '../controllers/missionController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getMissions);
router.post('/:missionId/start', protect, startMission);
router.post('/:sessionId/complete', protect, completeMission);

export default router;
