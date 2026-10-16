import express from 'express';
import { getShips, selectShip, unlockShip, upgradeShip } from '../controllers/shipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getShips);
router.post('/:shipId/select', protect, selectShip);
router.post('/:shipId/unlock', protect, unlockShip);
router.post('/:shipId/upgrade', protect, upgradeShip);

export default router;
