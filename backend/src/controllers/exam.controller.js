import { ExamModel } from '../models/exam.model.js';
import { successResponse, errorResponse } from '../utils/response.js';
import pool from '../config/db.js';

// ─── CREATE EXAM ─────────────────────────────────────────
export const createExam = async (req, res) => {
  try {
    const {
      title, description, instructions,
      duration_minutes, total_marks, pass_marks,
      negative_marking, shuffle_questions,
      shuffle_options, start_time, end_time
    } = req.body;

    // Validate required fields
    if (!title || !duration_minutes || !total_marks) {
      return errorResponse(res, 'Title, duration and total marks are required');
    }

    if (duration_minutes < 1) {
      return errorResponse(res, 'Duration must be at least 1 minute');
    }

    if (total_marks < 1) {
      return errorResponse(res, 'Total marks must be at least 1');
    }

    const exam = await ExamModel.create({
      title, description, instructions,
      duration_minutes, total_marks, pass_marks,
      negative_marking, shuffle_questions,
      shuffle_options, start_time, end_time,
      created_by: req.user.id
    });

    return successResponse(res, { exam },
      'Exam created successfully', 201);

  } catch (error) {
    console.error('Create exam error:', error);
    return errorResponse(res, 'Failed to create exam', 500);
  }
};

// ─── GET ALL EXAMS ───────────────────────────────────────
export const getAllExams = async (req, res) => {
  try {
    const exams = await ExamModel.findAll();
    return successResponse(res, { exams, total: exams.length });
  } catch (error) {
    console.error('Get exams error:', error);
    return errorResponse(res, 'Failed to fetch exams', 500);
  }
};
// ─── GET ADMIN STATS ─────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    const [exams, candidates, questions, results] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM exams`),
      pool.query(`SELECT COUNT(*) FROM users WHERE role='candidate'`),
      pool.query(`SELECT COUNT(*) FROM questions`),
      pool.query(`SELECT COUNT(*) FROM results WHERE published_at IS NOT NULL`),
    ]);
    return successResponse(res, {
      total_exams: parseInt(exams.rows[0].count),
      total_candidates: parseInt(candidates.rows[0].count),
      total_questions: parseInt(questions.rows[0].count),
      results_published: parseInt(results.rows[0].count),
    }, 'Stats fetched');
  } catch (error) {
    console.error('Get admin stats error:', error);
    return errorResponse(res, 'Failed to fetch stats', 500);
  }
};
// ─── GET SINGLE EXAM ─────────────────────────────────────
export const getExam = async (req, res) => {
  try {
    const exam = await ExamModel.findById(req.params.id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    // Get stats (question count, attempt count)
    const stats = await ExamModel.getStats(req.params.id);

    return successResponse(res, { exam, stats });
  } catch (error) {
    console.error('Get exam error:', error);
    return errorResponse(res, 'Failed to fetch exam', 500);
  }
};

// ─── UPDATE EXAM ─────────────────────────────────────────
export const updateExam = async (req, res) => {
  try {
    const exam = await ExamModel.findById(req.params.id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    // Only drafts can be edited
    if (exam.status === 'live' || exam.status === 'completed') {
      return errorResponse(res,
        'Cannot edit a live or completed exam');
    }

    const updated = await ExamModel.update(req.params.id, {
      ...exam,
      ...req.body
    });

    return successResponse(res, { exam: updated },
      'Exam updated successfully');

  } catch (error) {
    console.error('Update exam error:', error);
    return errorResponse(res, 'Failed to update exam', 500);
  }
};

// ─── PUBLISH EXAM ────────────────────────────────────────
export const publishExam = async (req, res) => {
  try {
    const exam = await ExamModel.findById(req.params.id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    if (exam.status !== 'draft') {
      return errorResponse(res, 'Only draft exams can be published');
    }

    // Check if exam has questions
    const stats = await ExamModel.getStats(req.params.id);
    if (stats.total_questions === 0) {
      return errorResponse(res,
        'Cannot publish exam with no questions');
    }

    const published = await ExamModel.publish(req.params.id);
    return successResponse(res, { exam: published },
      'Exam published successfully');

  } catch (error) {
    console.error('Publish exam error:', error);
    return errorResponse(res, 'Failed to publish exam', 500);
  }
};

// ─── DELETE EXAM ─────────────────────────────────────────
export const deleteExam = async (req, res) => {
  try {
    const exam = await ExamModel.findById(req.params.id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    if (exam.status !== 'draft') {
      return errorResponse(res, 'Only draft exams can be deleted');
    }

    await ExamModel.delete(req.params.id);
    return successResponse(res, null, 'Exam deleted successfully');

  } catch (error) {
    console.error('Delete exam error:', error);
    return errorResponse(res, 'Failed to delete exam', 500);
  }
};