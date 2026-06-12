import pool from '../config/db.js';
import { QuestionModel } from '../models/question.model.js';

async function evaluateDescriptiveWithAI(question, modelAnswer, candidateAnswer, maxMarks) {
  const models = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'openrouter/free', // ← last resort: auto-picks any available free model
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'ExamPlatform',
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `You are an exam evaluator. Score the candidate's answer out of ${maxMarks}.
Question: ${question}
${modelAnswer ? `Model Answer: ${modelAnswer}` : 'No model answer provided — evaluate based on accuracy and completeness.'}
Candidate Answer: ${candidateAnswer}
Respond ONLY as JSON: {"score": <number>, "feedback": "<string>"}`,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.log(`Model ${model} failed:`, data.error.message);
        continue;
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
      console.log(`AI eval success with model: ${model}`);
      return { score: Math.min(parsed.score, maxMarks), feedback: parsed.feedback };
    } catch (err) {
      console.log(`Model ${model} error:`, err.message);
      continue;
    }
  }

  // all models failed
  return { score: 0, feedback: 'AI evaluation failed — pending manual review' };
}

export const EvaluationService = {
  async evaluateAttempt(attempt_id) {
    const attemptResult = await pool.query('SELECT * FROM exam_attempts WHERE id=$1', [attempt_id]);
    const attempt = attemptResult.rows[0];
    if (!attempt) throw new Error('Attempt not found');

    const examResult = await pool.query('SELECT * FROM exams WHERE id=$1', [attempt.exam_id]);
    const exam = examResult.rows[0];

    const questions = await QuestionModel.findByExamId(attempt.exam_id);
    const answers = attempt.answers || {};

    let totalScore = 0;
    let attempted = 0,
      correct = 0,
      incorrect = 0,
      skipped = 0;
    const questionResults = [];
    const aiFeedback = [];

    for (const question of questions) {
      const candidateAnswer = answers[question.id];

      if (candidateAnswer === undefined || candidateAnswer === null || candidateAnswer === '') {
        skipped++;
        questionResults.push({ question_id: question.id, status: 'skipped', marks_awarded: 0 });
        continue;
      }

      attempted++;
      let marksAwarded = 0;
      let isCorrect = false;

      if (question.question_type === 'descriptive') {
        // AI evaluation
        const aiResult = await evaluateDescriptiveWithAI(
          question.question_text,
          question.model_answer,
          candidateAnswer,
          question.marks
        );
        marksAwarded = aiResult.score;
        totalScore += marksAwarded;
        aiFeedback.push({
          question_id: question.id,
          question_text: question.question_text,
          candidate_answer: candidateAnswer,
          score: aiResult.score,
          max_marks: question.marks,
          feedback: aiResult.feedback,
        });
        questionResults.push({
          question_id: question.id,
          status: 'ai_evaluated',
          marks_awarded: marksAwarded,
        });
        continue;
      }
      // ADD this before the switch block
      if (question.question_type === 'coding') {
        const subResult = await pool.query(
          `SELECT score FROM coding_submissions
     WHERE attempt_id=$1 AND question_id=$2
     ORDER BY submitted_at DESC LIMIT 1`,
          [attempt_id, question.id]
        );
        const codingScore = subResult.rows[0]?.score || 0;
        totalScore += codingScore;
        if (codingScore > 0) correct++;
        else skipped++;
        questionResults.push({
          question_id: question.id,
          status: 'coding_evaluated',
          marks_awarded: codingScore,
        });
        continue;
      }
      switch (question.question_type) {
        case 'mcq':
          isCorrect = this.evaluateMCQ(candidateAnswer, question.correct_answer);
          break;
        case 'true_false':
          isCorrect = this.evaluateTrueFalse(candidateAnswer, question.correct_answer);
          break;
        case 'fill_blank':
          isCorrect = this.evaluateFillBlank(candidateAnswer, question.correct_answer);
          break;
        default:
          isCorrect = null;
      }

      if (isCorrect === true) {
        marksAwarded = question.marks;
        correct++;
        totalScore += marksAwarded;
      } else if (isCorrect === false) {
        marksAwarded = -(question.negative_marks || 0);
        incorrect++;
        totalScore += marksAwarded;
      }

      questionResults.push({
        question_id: question.id,
        status:
          isCorrect === true ? 'correct' : isCorrect === false ? 'incorrect' : 'pending_manual',
        marks_awarded: marksAwarded,
      });
    }

    totalScore = Math.max(0, totalScore);

    await pool.query(`UPDATE exam_attempts SET score=$1, status='evaluated' WHERE id=$2`, [
      totalScore,
      attempt_id,
    ]);

    const percentage = (totalScore / exam.total_marks) * 100;
    const isPassed = totalScore >= exam.pass_marks;

    const resultRecord = await pool.query(
      `INSERT INTO results (attempt_id, candidate_id, exam_id, total_score, percentage, is_passed, ai_feedback)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (attempt_id)
       DO UPDATE SET total_score=$4, percentage=$5, is_passed=$6, ai_feedback=$7
       RETURNING *`,
      [
        attempt_id,
        attempt.candidate_id,
        attempt.exam_id,
        totalScore,
        percentage.toFixed(2),
        isPassed,
        JSON.stringify(aiFeedback),
      ]
    );

    return {
      score: totalScore,
      total_marks: exam.total_marks,
      percentage: percentage.toFixed(2),
      is_passed: isPassed,
      attempted,
      correct,
      incorrect,
      skipped,
      ai_feedback: aiFeedback,
      question_results: questionResults,
      result: resultRecord.rows[0],
    };
  },

  evaluateMCQ(candidateAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer)) {
      if (!Array.isArray(candidateAnswer)) return false;
      const c = correctAnswer.map((a) => a.toString().toLowerCase()).sort();
      const g = candidateAnswer.map((a) => a.toString().toLowerCase()).sort();
      return JSON.stringify(c) === JSON.stringify(g);
    }
    return candidateAnswer.toString().toLowerCase() === correctAnswer.toString().toLowerCase();
  },

  evaluateTrueFalse(candidateAnswer, correctAnswer) {
    const ca = (typeof correctAnswer === 'object' ? JSON.stringify(correctAnswer) : correctAnswer)
      .toString()
      .toLowerCase()
      .replace(/"/g, '');
    return candidateAnswer.toString().toLowerCase() === ca;
  },

  evaluateFillBlank(candidateAnswer, correctAnswer) {
    const given = candidateAnswer.toString().toLowerCase().trim();
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some((a) => a.toString().toLowerCase().trim() === given);
    }
    return given === correctAnswer.toString().toLowerCase().trim();
  },

  async calculateRanks(exam_id) {
    const results = await pool.query(
      `SELECT id, total_score FROM results WHERE exam_id=$1 ORDER BY total_score DESC`,
      [exam_id]
    );
    const total = results.rows.length;
    for (let i = 0; i < total; i++) {
      const percentile = (((total - i - 1) / total) * 100).toFixed(2);
      await pool.query('UPDATE results SET rank=$1, percentile=$2 WHERE id=$3', [
        i + 1,
        percentile,
        results.rows[i].id,
      ]);
    }
  },
};
