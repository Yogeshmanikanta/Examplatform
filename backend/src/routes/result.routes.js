import express from 'express';
import {
  getMyResult,
  getExamResults,
  publishResults,
  getLeaderboard
} from '../controllers/result.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {getCandidateStats} from '../controllers/result.controller.js';

const router = express.Router({ mergeParams: true });
router.use(protect);

// Candidate sees own result
router.get('/my', authorize('candidate'), getMyResult);

// Leaderboard - everyone can see
router.get('/leaderboard', getLeaderboard);

// Admin sees all results
router.get('/',
  authorize('super_admin', 'admin', 'coordinator','candidate'),
  getExamResults
);

// Admin publishes results
router.post('/publish',
  authorize('super_admin', 'admin'),
  publishResults
);

// candidate stats
router.get('/candidate/stats', authorize('candidate'), getCandidateStats);
export default router;