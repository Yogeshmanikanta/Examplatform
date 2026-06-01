import express from 'express';
import { startExam, saveAnswer, submitExam, tabSwitch } from '../controllers/engine.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });
router.use(protect);

router.post('/start', protect,authorize('candidate'), startExam);
router.post('/:attempt_id/save-answer', authorize('candidate'), saveAnswer);
router.post('/:attempt_id/submit', authorize('candidate'), submitExam);
router.post('/:attempt_id/tab-switch', authorize('candidate'), tabSwitch);

export default router;