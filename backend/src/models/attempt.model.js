import pool from '../config/db.js';

export const AttemptModel = {

  async startAttempt(exam_id, candidate_id) {
    // Check if already started
    const existing = await pool.query(
      'SELECT * FROM exam_attempts WHERE exam_id=$1 AND candidate_id=$2 AND status=$3',
      [exam_id, candidate_id, 'in_progress']
    );
    if (existing.rows.length > 0) return existing.rows[0];

// attempt.model.js — startAttempt
const result = await pool.query(
  `INSERT INTO exam_attempts (exam_id, candidate_id, status, started_at)
   VALUES ($1, $2, 'in_progress', NOW())
   ON CONFLICT (exam_id, candidate_id)
   DO UPDATE SET status = 'in_progress', started_at = NOW(), answers = '{}'::jsonb, submitted_at = NULL
   RETURNING *`,
  [exam_id, candidate_id]
);
return result.rows[0];
  },

  async saveAnswer(attempt_id, question_id, answer) {
    await pool.query(
      `UPDATE exam_attempts
       SET answers = answers || $1::jsonb, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify({ [question_id]: answer }), attempt_id]
    );
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM exam_attempts WHERE id=$1', [id]
    );
    return result.rows[0] || null;
  },

  async submit(attempt_id) {
    const result = await pool.query(
      `UPDATE exam_attempts
       SET status='submitted', submitted_at=NOW()
       WHERE id=$1 AND status='in_progress'
       RETURNING *`,
      [attempt_id]
    );
    return result.rows[0];
  },

  async recordTabSwitch(attempt_id) {
    await pool.query(
      `UPDATE exam_attempts
       SET tab_switches = tab_switches + 1
       WHERE id=$1`,
      [attempt_id]
    );
  }
};