import express from 'express';
import { getCandidateStats } from '../controllers/result.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.get('/stats', authorize('candidate'), getCandidateStats);
export default router;