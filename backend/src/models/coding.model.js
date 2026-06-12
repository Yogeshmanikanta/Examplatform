import pool from '../config/db.js';

export const CodingModel = {
  // ─── CODING QUESTION DETAILS ───────────────────────────

  async createDetails({
    question_id,
    allowed_languages,
    time_limit_ms,
    memory_limit_mb,
    starter_code,
  }) {
    const result = await pool.query(
      `INSERT INTO coding_question_details
         (question_id, allowed_languages, time_limit_ms, memory_limit_mb, starter_code)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        question_id,
        allowed_languages || ['python', 'java', 'cpp', 'c'],
        time_limit_ms || 5000,
        memory_limit_mb || 256,
        JSON.stringify(starter_code || {}),
      ]
    );
    return result.rows[0];
  },

  async getDetails(question_id) {
    const result = await pool.query(
      'SELECT * FROM coding_question_details WHERE question_id = $1',
      [question_id]
    );
    return result.rows[0] || null;
  },

  async upsertDetails(question_id, data) {
    const existing = await this.getDetails(question_id);
    if (existing) {
      const result = await pool.query(
        `UPDATE coding_question_details SET
           allowed_languages = COALESCE($1, allowed_languages),
           time_limit_ms     = COALESCE($2, time_limit_ms),
           memory_limit_mb   = COALESCE($3, memory_limit_mb),
           starter_code      = COALESCE($4, starter_code)
         WHERE question_id = $5 RETURNING *`,
        [
          data.allowed_languages,
          data.time_limit_ms,
          data.memory_limit_mb,
          data.starter_code ? JSON.stringify(data.starter_code) : null,
          question_id,
        ]
      );
      return result.rows[0];
    }
    return this.createDetails({ question_id, ...data });
  },

  // ─── TEST CASES ────────────────────────────────────────

  async addTestCase({ question_id, input, expected_output, is_hidden, points, order_index }) {
    const result = await pool.query(
      `INSERT INTO coding_test_cases
         (question_id, input, expected_output, is_hidden, points, order_index)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [question_id, input || '', expected_output, is_hidden || false, points || 1, order_index || 0]
    );
    return result.rows[0];
  },

  async getTestCases(question_id) {
    const result = await pool.query(
      'SELECT * FROM coding_test_cases WHERE question_id = $1 ORDER BY order_index ASC',
      [question_id]
    );
    return result.rows;
  },

  async getVisibleForCandidate(question_id) {
    const result = await pool.query(
      `SELECT id, input, order_index FROM coding_test_cases
       WHERE question_id = $1 AND is_hidden = FALSE
       ORDER BY order_index ASC`,
      [question_id]
    );
    return result.rows;
  },

  async updateTestCase(id, data) {
    const result = await pool.query(
      `UPDATE coding_test_cases SET
         input           = COALESCE($1, input),
         expected_output = COALESCE($2, expected_output),
         is_hidden       = COALESCE($3, is_hidden),
         points          = COALESCE($4, points),
         order_index     = COALESCE($5, order_index)
       WHERE id = $6 RETURNING *`,
      [data.input, data.expected_output, data.is_hidden, data.points, data.order_index, id]
    );
    return result.rows[0];
  },

  async deleteTestCase(id) {
    await pool.query('DELETE FROM coding_test_cases WHERE id = $1', [id]);
  },

  async bulkAddTestCases(question_id, testCases) {
    const results = [];
    for (let i = 0; i < testCases.length; i++) {
      const tc = await this.addTestCase({ ...testCases[i], question_id, order_index: i });
      results.push(tc);
    }
    return results;
  },

  // ─── SUBMISSIONS ───────────────────────────────────────

  async createSubmission(data) {
    const result = await pool.query(
      `INSERT INTO coding_submissions
         (attempt_id, question_id, candidate_id, language, source_code,
          visible_passed, visible_total, hidden_passed, hidden_total, score, verdict)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        data.attempt_id,
        data.question_id,
        data.candidate_id,
        data.language,
        data.source_code,
        data.visible_passed,
        data.visible_total,
        data.hidden_passed,
        data.hidden_total,
        data.score,
        data.verdict,
      ]
    );
    return result.rows[0];
  },

  async getLatestSubmission(attempt_id, question_id) {
    const result = await pool.query(
      `SELECT * FROM coding_submissions
       WHERE attempt_id = $1 AND question_id = $2
       ORDER BY submitted_at DESC LIMIT 1`,
      [attempt_id, question_id]
    );
    return result.rows[0] || null;
  },
};
