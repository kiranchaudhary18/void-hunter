import express from 'express';
import { getWalletBalance, getWalletLedger, getWalletSummary } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/balance', protect, getWalletBalance);
router.get('/ledger', protect, getWalletLedger);
router.get('/summary', protect, getWalletSummary);

export default router;
