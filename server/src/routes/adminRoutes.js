import express from 'express';
import { getEconomyAudit } from '../controllers/adminController.js';

const router = express.Router();

router.get('/audit', getEconomyAudit);

export default router;
