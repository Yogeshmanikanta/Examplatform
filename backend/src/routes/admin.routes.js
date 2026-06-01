import express from 'express';
import { getAllCandidateResults } from '../controllers/result.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { UserModel } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();
router.use(protect);

router.get('/results', authorize('super_admin', 'admin', 'coordinator','candidate'), getAllCandidateResults);

// Candidates CRUD
router.get('/candidates', authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const candidates = await UserModel.findAllCandidates();
    return successResponse(res, { candidates });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch candidates', 500);
  }
});

router.put('/candidates/:id', authorize('super_admin'), async (req, res) => {
  try {
    const { full_name, email, mobile } = req.body;
    const updated = await UserModel.updateCandidate(req.params.id, { full_name, email, mobile });
    if (!updated) return errorResponse(res, 'Candidate not found', 404);
    return successResponse(res, { candidate: updated }, 'Candidate updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update candidate', 500);
  }
});

router.delete('/candidates/:id', authorize('super_admin'), async (req, res) => {
  try {
    await UserModel.deleteCandidate(req.params.id);
    return successResponse(res, null, 'Candidate deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete candidate', 500);
  }
});

export default router;