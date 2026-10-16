import express from 'express';
import { getPowerUps, acquirePowerUp } from '../controllers/powerUpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPowerUps);
router.post('/:powerUpId/acquire', protect, acquirePowerUp);

export default router;
