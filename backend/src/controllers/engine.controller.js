import { AttemptModel } from '../models/attempt.model.js';
import { ExamModel } from '../models/exam.model.js';
import { QuestionModel } from '../models/question.model.js';
import { EvaluationService } from '../services/evaluation.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import pool from '../config/db.js';

// Start exam
export const startExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const exam = await ExamModel.findById(exam_id);
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    if (exam.status !== 'published' && exam.status !== 'live') {
      return errorResponse(res, 'Exam is not available');
    }
     
    const attempt = await AttemptModel.startAttempt(exam_id, req.user.id);
    console.log('ATTEMPT:', attempt)
    const questions = await QuestionModel.findForCandidate(
      exam_id, exam.shuffle_questions
    );

    // Calculate time remaining
    
    const totalSeconds = exam.duration_minutes * 60;
    const startedAt = new Date(attempt.started_at).getTime();
const nowUTC = Date.now() - (new Date().getTimezoneOffset() * -60000);
const elapsed = Math.max(0, Math.floor((nowUTC - startedAt) / 1000) - 19800);
const timeRemaining = Math.max(0, totalSeconds - elapsed);
    console.log('elapsed:', elapsed, 'total:', totalSeconds, 'remaining:', timeRemaining);

    return successResponse(res, {
      attempt_id: attempt.id,
      exam: {
        title: exam.title,
        instructions: exam.instructions,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        negative_marking: exam.negative_marking
      },
      questions,
      time_remaining_seconds: timeRemaining,
      saved_answers: attempt.answers || {}
    }, 'Exam started');

  } catch (error) {
    console.error('Start exam error:', error);
    return errorResponse(res, 'Failed to start exam', 500);
  }
};

// Auto-save answer
export const saveAnswer = async (req, res) => {
  try {
    const { attempt_id } = req.params;
    const { question_id, answer } = req.body;

    const attempt = await AttemptModel.findById(attempt_id);
    if (!attempt) return errorResponse(res, 'Attempt not found', 404);
    if (attempt.candidate_id !== req.user.id) {
      return errorResponse(res, 'Unauthorized', 403);
    }
    if (attempt.status !== 'in_progress') {
      return errorResponse(res, 'Exam already submitted');
    }
  
    await AttemptModel.saveAnswer(attempt_id, question_id, answer);
    

    return successResponse(res, null, 'Answer saved');

  } catch (error) {
    console.error('Save answer error:', error);
    return errorResponse(res, 'Failed to save answer', 500);
  }
};

// Submit exam
export const submitExam = async (req, res) => {
  try {
    const { attempt_id } = req.params;

    const attempt = await AttemptModel.findById(attempt_id);
    if (!attempt) return errorResponse(res, 'Attempt not found', 404);
    if (attempt.candidate_id !== req.user.id) {
      return errorResponse(res, 'Unauthorized', 403);
    }
    if (attempt.status !== 'in_progress') {
      return errorResponse(res, 'Exam already submitted');
    }

    // Submit the attempt
    await AttemptModel.submit(attempt_id);

    // Auto evaluate immediately
    const evaluation = await EvaluationService.evaluateAttempt(attempt_id);

    // Recalculate ranks for all candidates
    await EvaluationService.calculateRanks(attempt.exam_id);

    return successResponse(res, { evaluation }, 'Exam submitted successfully');

  } catch (error) {
    console.error('Submit exam error:', error);
    return errorResponse(res, 'Failed to submit exam', 500);
  }
};

// Record tab switch
export const tabSwitch = async (req, res) => {
  try {
    const { attempt_id } = req.params;
    await AttemptModel.recordTabSwitch(attempt_id);
    return successResponse(res, null, 'Recorded');
  } catch (error) {
    return errorResponse(res, 'Failed to record', 500);
  }
};