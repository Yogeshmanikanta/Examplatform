import pool from '../config/db.js';

export const ExamModel = {

  // Create new exam
  async create(examData) {
    const {
      title, description, instructions,
      duration_minutes, total_marks, pass_marks,
      negative_marking, shuffle_questions,
      shuffle_options, start_time, end_time,
      created_by
    } = examData;

    const result = await pool.query(
      `INSERT INTO exams (
        title, description, instructions,
        duration_minutes, total_marks, pass_marks,
        negative_marking, shuffle_questions,
        shuffle_options, start_time, end_time,
        created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        title, description, instructions,
        duration_minutes, total_marks, pass_marks,
        negative_marking || 0,
        shuffle_questions || false,
        shuffle_options || false,
        start_time, end_time, created_by
      ]
    );
    return result.rows[0];
  },

  // Get all exams (with creator name)
  async findAll() {
    const result = await pool.query(
      `SELECT e.*, u.full_name as created_by_name
       FROM exams e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC`
    );
    return result.rows;
  },

  //Get All Exams for Admin
  async findAllForAdmin() {
    const result = await pool.query(
      `SELECT count(*) as total_exams FROM exams`
    );
    return result.rows[0];
  },
  // Get single exam by ID
  async findById(id) {
    const result = await pool.query(
      `SELECT e.*, u.full_name as created_by_name
       FROM exams e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Update exam
  async update(id, examData) {
    const {
      title, description, instructions,
      duration_minutes, total_marks, pass_marks,
      negative_marking, shuffle_questions,
      shuffle_options, start_time, end_time, status
    } = examData;

    const result = await pool.query(
      `UPDATE exams SET
        title=$1, description=$2, instructions=$3,
        duration_minutes=$4, total_marks=$5, pass_marks=$6,
        negative_marking=$7, shuffle_questions=$8,
        shuffle_options=$9, start_time=$10, end_time=$11,
        status=$12, updated_at=NOW()
       WHERE id=$13
       RETURNING *`,
      [
        title, description, instructions,
        duration_minutes, total_marks, pass_marks,
        negative_marking, shuffle_questions,
        shuffle_options, start_time, end_time,
        status, id
      ]
    );
    return result.rows[0];
  },

  // Publish exam (change status to published)
  async publish(id) {
    const result = await pool.query(
      `UPDATE exams SET status='published', updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Delete exam (only drafts)
  async delete(id) {
    await pool.query(
      'DELETE FROM exams WHERE id=$1 AND status=$2',
      [id, 'draft']
    );
  },

  // Get exam stats (total questions, total candidates)
  async getStats(id) {
    const questions = await pool.query(
      'SELECT COUNT(*) FROM questions WHERE exam_id=$1',
      [id]
    );
    const attempts = await pool.query(
      'SELECT COUNT(*) FROM exam_attempts WHERE exam_id=$1',
      [id]
    );
    return {
      total_questions: parseInt(questions.rows[0].count),
      total_attempts: parseInt(attempts.rows[0].count)
    };
  }
};