import express from 'express';
import {
  setCodingDetails,
  getCodingDetails,
  addTestCase,
  bulkAddTestCases,
  updateTestCase,
  deleteTestCase,
  getCodingQuestion,
  submitCode,
} from '../controllers/coding.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });
router.use(protect);

// ADMIN
router.get(
  '/:question_id/coding',
  authorize('super_admin', 'admin', 'coordinator'),
  getCodingDetails
);
router.post(
  '/:question_id/coding',
  authorize('super_admin', 'admin', 'coordinator'),
  setCodingDetails
);
router.post(
  '/:question_id/coding/testcases',
  authorize('super_admin', 'admin', 'coordinator'),
  addTestCase
);
router.post(
  '/:question_id/coding/testcases/bulk',
  authorize('super_admin', 'admin', 'coordinator'),
  bulkAddTestCases
);
router.put(
  '/:question_id/coding/testcases/:tc_id',
  authorize('super_admin', 'admin', 'coordinator'),
  updateTestCase
);
router.delete(
  '/:question_id/coding/testcases/:tc_id',
  authorize('super_admin', 'admin', 'coordinator'),
  deleteTestCase
);

// CANDIDATE
router.get('/:question_id/coding/candidate', authorize('candidate'), getCodingQuestion);
router.post('/:question_id/coding/submit', authorize('candidate'), submitCode);

export default router;
