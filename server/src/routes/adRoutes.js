import express from 'express';
import { offerAd, adHeartbeat, verifyAdReward, getProviderInfo, getAdHistory } from '../controllers/adController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/provider', getProviderInfo);
router.get('/history', protect, getAdHistory);
router.post('/offer', protect, offerAd);
router.post('/:adId/heartbeat', protect, adHeartbeat);
router.post('/:adId/verify', protect, verifyAdReward);

export default router;
