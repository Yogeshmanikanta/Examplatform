import pool from '../config/db.js';

export const ResultModel = {

  // Get single result by attempt
  async findByAttempt(attempt_id) {
    const result = await pool.query(
      `SELECT r.*, e.title as exam_title, e.total_marks, e.pass_marks,
              e.duration_minutes, e.negative_marking
       FROM results r
       JOIN exams e ON r.exam_id = e.id
       WHERE r.attempt_id = $1`,
      [attempt_id]
    );
    return result.rows[0] || null;
  },

  // Get all results for a candidate
  async findByCandidate(candidate_id) {
    const result = await pool.query(
      `SELECT r.*, e.title as exam_title, e.total_marks, e.pass_marks,
              e.duration_minutes, a.tab_switches, a.submitted_at,
              a.answers
       FROM results r
       JOIN exams e ON r.exam_id = e.id
       JOIN exam_attempts a ON r.attempt_id = a.id
       WHERE r.candidate_id = $1
       ORDER BY r.created_at DESC`,
      [candidate_id]
    );
    return result.rows;
  },

  // Get all results for an exam (admin)
  async findByExam(exam_id) {
    const result = await pool.query(
      `SELECT r.*, u.full_name, u.email,
              a.tab_switches, a.submitted_at
       FROM results r
       JOIN users u ON r.candidate_id = u.id
       JOIN exam_attempts a ON r.attempt_id = a.id
       WHERE r.exam_id = $1
       ORDER BY r.rank ASC`,
      [exam_id]
    );
    return result.rows;
  },

  // Create result after evaluation
  async create(data) {
    const {
      attempt_id, exam_id, candidate_id,
      score, total_marks, correct, incorrect,
      skipped, percentage, is_passed, rank,
      percentile, ai_feedback
    } = data;

    const result = await pool.query(
      `INSERT INTO results (
        attempt_id, exam_id, candidate_id,
        score, total_marks, correct, incorrect,
        skipped, percentage, is_passed, rank,
        percentile, ai_feedback
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (attempt_id) DO UPDATE SET
        score=$4, total_marks=$5, correct=$6,
        incorrect=$7, skipped=$8, percentage=$9,
        is_passed=$10, rank=$11, percentile=$12,
        ai_feedback=$13, updated_at=NOW()
      RETURNING *`,
      [
        attempt_id, exam_id, candidate_id,
        score, total_marks, correct, incorrect,
        skipped, percentage, is_passed, rank,
        percentile, ai_feedback || null
      ]
    );
    return result.rows[0];
  },

  // Update ranks after new submission
  async updateRanks(exam_id) {
    await pool.query(
      `UPDATE results r
       SET rank = sub.new_rank
       FROM (
         SELECT id, ROW_NUMBER() OVER (
           PARTITION BY exam_id ORDER BY score DESC, created_at ASC
         ) as new_rank
         FROM results WHERE exam_id = $1
       ) sub
       WHERE r.id = sub.id`,
      [exam_id]
    );
  },

  // Publish results for an exam
  async publish(exam_id) {
    await pool.query(
      `UPDATE results SET published_at = NOW()
       WHERE exam_id = $1 AND published_at IS NULL`,
      [exam_id]
    );
  },

  // Candidate stats summary
  async getCandidateStats(candidate_id) {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_exams,
        COUNT(*) FILTER (WHERE is_passed = true) as is_passed,
        COUNT(*) FILTER (WHERE is_passed = false) as failed,
        ROUND(AVG(percentage)::numeric, 1) as avg_percentage,
        MAX(percentage) as best_score,
        MIN(rank) as best_rank
       FROM results
       WHERE candidate_id = $1`,
      [candidate_id]
    );
    return result.rows[0];
  },

  // Leaderboard for an exam
  async getLeaderboard(exam_id, limit = 10) {
    const result = await pool.query(
      `SELECT r.rank, r.score, r.percentage, r.is_passed,
              u.full_name
       FROM results r
       JOIN users u ON r.candidate_id = u.id
       WHERE r.exam_id = $1 AND r.published_at IS NOT NULL
       ORDER BY r.rank ASC
       LIMIT $2`,
      [exam_id, limit]
    );
    return result.rows;
  }
};