import express from 'express';
import {
  addQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  bulkAddQuestions
} from '../controllers/question.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// All routes require login
router.use(protect);

// Get all questions for an exam
router.get('/',
  authorize('super_admin','admin','coordinator','evaluator'),
  getQuestions
);

// Add single question
router.post('/',
  authorize('super_admin','admin','coordinator'),
  addQuestion
);

// Bulk add questions
router.post('/bulk',
  authorize('super_admin','admin','coordinator'),
  bulkAddQuestions
);

// Update question
router.put('/:id',
  authorize('super_admin','admin','coordinator'),
  updateQuestion
);

// Delete question
router.delete('/:id',
  authorize('super_admin','admin'),
  deleteQuestion
);

export default router;