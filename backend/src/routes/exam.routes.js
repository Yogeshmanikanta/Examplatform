import express from 'express';
import {
  createExam,
  getAllExams,
  getExam,
  updateExam,
  publishExam,
  deleteExam,
  getAdminStats
} from '../controllers/exam.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import pool from '../config/db.js';


const router = express.Router();

router.get('/published', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, duration_minutes,
              total_marks, pass_marks, negative_marking,
              start_time, end_time, status
       FROM exams
       WHERE status IN ('published', 'live')
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: { exams: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch exams' });
  }
});

// Get exam details for candidates (public if published)
router.get('/details/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, instructions, duration_minutes,
              total_marks, pass_marks, negative_marking, status,
              (SELECT COUNT(*) FROM questions WHERE exam_id=$1) as total_questions
       FROM exams
       WHERE id = $1 AND status IN ('published', 'live')`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch exam' });
  }
});

router.get('/available', protect, authorize('candidate','super_admin','admin','coordinator'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.duration_minutes, 
              e.total_marks, e.pass_marks, e.negative_marking, 
              e.start_time, e.end_time, e.status,
              ea.status as attempt_status
       FROM exams e
       LEFT JOIN exam_attempts ea 
         ON ea.exam_id = e.id AND ea.candidate_id = $1
       WHERE e.status IN ('published', 'live')
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: { exams: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch exams' });
  }
});
router.get('/admin/stats', protect, authorize('super_admin','admin','coordinator'), getAdminStats);
// All exam routes require login
router.use(protect);

// Get all exams - admin, coordinator can see all
router.get('/',
  authorize('super_admin','admin','coordinator'),
  getAllExams
);

// Get single exam
router.get('/:id',
  authorize('super_admin','admin','coordinator'),
  getExam
);

// Create exam
router.post('/',
  authorize('super_admin','admin','coordinator'),
  createExam
);

// Update exam
router.put('/:id',
  authorize('super_admin','admin','coordinator'),
  updateExam
);

// Publish exam
router.patch('/:id/publish',
  authorize('super_admin','admin'),
  publishExam
);

// Delete exam
router.delete('/:id',
  authorize('super_admin','admin'),
  deleteExam
);

export default router;