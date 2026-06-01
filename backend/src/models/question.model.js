import pool from '../config/db.js';

export const QuestionModel = {

  // Add single question to exam
  async create(questionData) {
    const {
      exam_id, question_text, question_type,
      options, correct_answer, marks,
      negative_marks, difficulty,
      subject, topic, explanation, order_index
    } = questionData;

    const result = await pool.query(
      `INSERT INTO questions (
        exam_id, question_text, question_type,
        options, correct_answer, marks,
        negative_marks, difficulty,
        subject, topic, explanation, order_index
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        exam_id, question_text, question_type,
        JSON.stringify(options),
        JSON.stringify(correct_answer),
        marks || 1,
        negative_marks || 0,
        difficulty || 'medium',
        subject, topic, explanation,
        order_index || 0
      ]
    );
    return result.rows[0];
  },

  // Get all questions for an exam
  async findByExamId(exam_id) {
    const result = await pool.query(
      `SELECT * FROM questions
       WHERE exam_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [exam_id]
    );
    return result.rows;
  },

  // Get single question
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Update question
  async update(id, questionData) {
    const {
      question_text, question_type, options,
      correct_answer, marks, negative_marks,
      difficulty, subject, topic,
      explanation, order_index
    } = questionData;

    const result = await pool.query(
      `UPDATE questions SET
        question_text=$1, question_type=$2,
        options=$3, correct_answer=$4,
        marks=$5, negative_marks=$6,
        difficulty=$7, subject=$8,
        topic=$9, explanation=$10,
        order_index=$11
       WHERE id=$12
       RETURNING *`,
      [
        question_text, question_type,
        JSON.stringify(options),
        JSON.stringify(correct_answer),
        marks, negative_marks, difficulty,
        subject, topic, explanation,
        order_index, id
      ]
    );
    return result.rows[0];
  },

  // Delete question
  async delete(id) {
    await pool.query('DELETE FROM questions WHERE id=$1', [id]);
  },

  // Bulk insert questions (for import)
  async bulkCreate(exam_id, questions) {
    const results = [];
    for (let i = 0; i < questions.length; i++) {
      const q = await this.create({
        ...questions[i],
        exam_id,
        order_index: i
      });
      results.push(q);
    }
    return results;
  },

  // Get questions for candidate (hides correct answers)
  async findForCandidate(exam_id, shuffle = false) {
    const result = await pool.query(
      `SELECT id, question_text, question_type,
              options, marks, order_index
       FROM questions
       WHERE exam_id = $1
       ORDER BY order_index ASC`,
      [exam_id]
    );
    let questions = result.rows;

    // Shuffle if exam has shuffle enabled
    if (shuffle) {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    return questions;
  }
};