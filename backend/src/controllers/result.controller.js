import pool from '../config/db.js';
import { EvaluationService } from '../services/evaluation.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ResultModel } from '../models/result.model.js';
// Get my result for an exam
export const getMyResult = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const result = await pool.query(
      `SELECT r.*, e.title as exam_title, e.total_marks,
              e.pass_marks, u.full_name as candidate_name
       FROM results r
       JOIN exams e ON r.exam_id = e.id
       JOIN users u ON r.candidate_id = u.id
       WHERE r.exam_id = $1 AND r.candidate_id = $2`,
      [exam_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Result not found', 404);
    }

    return successResponse(res, { result: result.rows[0] });
  } catch (error) {
    console.error('Get result error:', error);
    return errorResponse(res, 'Failed to fetch result', 500);
  }
};

// Get all results for an exam (admin)
export const getExamResults = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const results = await pool.query(
      `SELECT r.*, u.full_name, u.email, u.mobile
       FROM results r
       JOIN users u ON r.candidate_id = u.id
       WHERE r.exam_id = $1
       ORDER BY r.rank ASC`,
      [exam_id]
    );

    return successResponse(res, {
      results: results.rows,
      total: results.rows.length,
    });
  } catch (error) {
    console.error('Get exam results error:', error);
    return errorResponse(res, 'Failed to fetch results', 500);
  }
};

// Publish results (admin)
export const publishResults = async (req, res) => {
  try {
    const { exam_id } = req.params;

    await pool.query(
      `UPDATE results SET published_at = NOW()
       WHERE exam_id = $1`,
      [exam_id]
    );

    await pool.query(
      `UPDATE exams SET status = 'completed'
       WHERE id = $1`,
      [exam_id]
    );

    return successResponse(res, null, 'Results published successfully');
  } catch (error) {
    console.error('Publish results error:', error);
    return errorResponse(res, 'Failed to publish results', 500);
  }
};

// Get leaderboard (top 10)
export const getLeaderboard = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const results = await pool.query(
      `SELECT r.rank, r.total_score, r.percentage,
              r.percentile, u.full_name
       FROM results r
       JOIN users u ON r.candidate_id = u.id
       WHERE r.exam_id = $1 AND r.published_at IS NOT NULL
       ORDER BY r.rank ASC
       LIMIT 10`,
      [exam_id]
    );

    return successResponse(res, { leaderboard: results.rows });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return errorResponse(res, 'Failed to fetch leaderboard', 500);
  }
};

export const getCandidateStats = async (req, res) => {
  try {
    const results = await ResultModel.findByCandidate(req.user.id);
    const stats = await ResultModel.getCandidateStats(req.user.id);
    return successResponse(res, { results, stats }, 'Stats fetched');
  } catch (err) {
    console.error('Get candidate stats error:', err);
    return errorResponse(res, 'Failed to fetch stats', 500);
  }
};
// Get all candidates with their results summary (admin)
export const getAllCandidateResults = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      candidateSearch,
      minAttempts,
      maxAttempts,
      minPassed,
      maxPassed,
      minFailed,
      maxFailed,
      minAvgScore,
      maxAvgScore,
      minBestScore,
      maxBestScore,
      sortBy = 'total_attempts',
      order = 'desc',
    } = req.query;

    const SORT_WHITELIST = {
      candidate_name: 'u.full_name',
      attempts: 'total_attempts',
      passed: 'passed',
      failed: 'failed',
      avg_score: 'avg_percentage',
      best_score: 'best_score',
    };

    const sortCol = SORT_WHITELIST[sortBy] || 'total_attempts';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const params = [];
    const having = [];
    const where = [`u.role = 'candidate'`];

    if (candidateSearch) {
      params.push(`%${candidateSearch}%`);
      where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    // HAVING clauses built after GROUP BY
    const addHaving = (col, min, max) => {
      if (min !== undefined) {
        params.push(Number(min));
        having.push(`${col} >= $${params.length}`);
      }
      if (max !== undefined) {
        params.push(Number(max));
        having.push(`${col} <= $${params.length}`);
      }
    };

    addHaving('COUNT(r.id)', minAttempts, maxAttempts);
    addHaving('COUNT(r.id) FILTER (WHERE r.is_passed = true)', minPassed, maxPassed);
    addHaving('COUNT(r.id) FILTER (WHERE r.is_passed = false)', minFailed, maxFailed);
    addHaving('ROUND(AVG(r.percentage)::numeric, 1)', minAvgScore, maxAvgScore);
    addHaving('MAX(r.total_score)', minBestScore, maxBestScore);

    const whereClause = `WHERE ${where.join(' AND ')}`;
    const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : '';

    // Count query for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (
        SELECT u.id
        FROM users u
        JOIN results r ON r.candidate_id = u.id
        ${whereClause}
        GROUP BY u.id
        ${havingClause}
      ) t`,
      params
    );

    // Pagination params added after count query params
    params.push(parseInt(limit));
    params.push(offset);

    const dataResult = await pool.query(
      `SELECT
        u.id as candidate_id, u.full_name, u.email,
        COUNT(r.id) as total_attempts,
        COUNT(r.id) FILTER (WHERE r.is_passed = true) as passed,
        COUNT(r.id) FILTER (WHERE r.is_passed = false) as failed,
        ROUND(AVG(r.percentage)::numeric, 1) as avg_percentage,
        MAX(r.total_score) as best_score,
        json_agg(json_build_object(
          'exam_title', e.title,
          'score', r.total_score,
          'percentage', r.percentage,
          'rank', r.rank,
          'passed', r.is_passed,
          'submitted_at', a.submitted_at
        ) ORDER BY a.submitted_at DESC) as attempts
       FROM users u
       JOIN results r ON r.candidate_id = u.id
       JOIN exams e ON r.exam_id = e.id
       JOIN exam_attempts a ON r.attempt_id = a.id
       ${whereClause}
       GROUP BY u.id, u.full_name, u.email
       ${havingClause}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return successResponse(
      res,
      {
        candidates: dataResult.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
      'Fetched'
    );
  } catch (err) {
    console.error('getAllCandidateResults error:', err);
    return errorResponse(res, 'Failed to fetch', 500);
  }
};
