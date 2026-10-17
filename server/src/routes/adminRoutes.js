import express from 'express';
import {
  getAdminOverview,
  getRewardAuditLogs,
  getWalletLedgerLogs,
  getAdOpportunities,
  getEconomyConfiguration,
  updateEconomyConfiguration,
  getEconomyAudit
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict RBAC: All administrative endpoints require valid authentication and ADMIN role clearance (Sections 74, 75, 80)
router.use(protect, requireAdmin);

// Section 75: Admin Overview & High-level Metrics
router.get('/overview', getAdminOverview);

// Section 37 & 74: Searchable, Filterable, Paginated Reward Audit Log
router.get('/rewards', getRewardAuditLogs);

// Section 36 & 74: Searchable, Filterable, Paginated Wallet Ledger
router.get('/wallet-ledger', getWalletLedgerLogs);

// Section 47 & 48: Rewarded Ad Opportunities & Conversion Monitor
router.get('/ad-opportunities', getAdOpportunities);

// Section 35: Server-Controlled Economy Configuration
router.get('/economy-config', getEconomyConfiguration);
router.put('/economy-config', updateEconomyConfiguration);

// Section 74: Mathematical Balance & Diagnostic Audit
router.get('/audit', getEconomyAudit);

export default router;
