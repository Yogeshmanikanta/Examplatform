import { QuestionModel } from '../models/question.model.js';
import { ExamModel } from '../models/exam.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── ADD QUESTION ────────────────────────────────────────
export const addQuestion = async (req, res) => {
  try {
    const { exam_id } = req.params;

    // Check exam exists
    const exam = await ExamModel.findById(exam_id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    // Cant add questions to live/completed exams
    if (exam.status === 'live' || exam.status === 'completed') {
      return errorResponse(res, 'Cannot add questions to a live or completed exam');
    }

    const {
      question_text,
      question_type,
      options,
      correct_answer,
      marks,
      negative_marks,
      difficulty,
      subject,
      topic,
      explanation,
      model_answer,
    } = req.body;

    // Validate required fields
    if (!question_text || !question_type) {
      return errorResponse(res, 'Question text and type are required');
    }

    if (question_type !== 'descriptive' && question_type !== 'coding' && !correct_answer) {
      return errorResponse(res, 'Correct answer is required');
    }

    // Validate MCQ has options
    if (question_type === 'mcq' && (!options || options.length < 2)) {
      return errorResponse(res, 'MCQ questions must have at least 2 options');
    }

    const finalCorrectAnswer = question_type === 'coding' ? '{}' : correct_answer;
    const question = await QuestionModel.create({
      exam_id,
      question_text,
      question_type,
      options,
      correct_answer: finalCorrectAnswer,
      marks,
      negative_marks,
      difficulty,
      subject,
      topic,
      explanation,
    });

    return successResponse(res, { question }, 'Question added successfully', 201);
  } catch (error) {
    console.error('Add question error:', error);
    return errorResponse(res, 'Failed to add question', 500);
  }
};

// ─── GET ALL QUESTIONS ───────────────────────────────────
export const getQuestions = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const exam = await ExamModel.findById(exam_id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    const questions = await QuestionModel.findByExamId(exam_id);
    return successResponse(res, {
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('Get questions error:', error);
    return errorResponse(res, 'Failed to fetch questions', 500);
  }
};

// ─── UPDATE QUESTION ─────────────────────────────────────
export const updateQuestion = async (req, res) => {
  try {
    const question = await QuestionModel.findById(req.params.id);
    if (!question) {
      return errorResponse(res, 'Question not found', 404);
    }

    const updated = await QuestionModel.update(req.params.id, {
      ...question,
      ...req.body,
    });

    return successResponse(res, { question: updated }, 'Question updated successfully');
  } catch (error) {
    console.error('Update question error:', error);
    return errorResponse(res, 'Failed to update question', 500);
  }
};

// ─── DELETE QUESTION ─────────────────────────────────────
export const deleteQuestion = async (req, res) => {
  try {
    const question = await QuestionModel.findById(req.params.id);
    if (!question) {
      return errorResponse(res, 'Question not found', 404);
    }

    await QuestionModel.delete(req.params.id);
    return successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    console.error('Delete question error:', error);
    return errorResponse(res, 'Failed to delete question', 500);
  }
};

// ─── BULK ADD QUESTIONS ──────────────────────────────────
export const bulkAddQuestions = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return errorResponse(res, 'Questions array is required');
    }

    const exam = await ExamModel.findById(exam_id);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    const created = await QuestionModel.bulkCreate(exam_id, questions);

    return successResponse(
      res,
      {
        questions: created,
        total: created.length,
      },
      `${created.length} questions added successfully`,
      201
    );
  } catch (error) {
    console.error('Bulk add error:', error);
    return errorResponse(res, 'Failed to bulk add questions', 500);
  }
};
