import { CodingModel } from '../models/coding.model.js';
import { QuestionModel } from '../models/question.model.js';
import { evaluateSubmission, SUPPORTED_LANGUAGES } from '../services/compiler.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const setCodingDetails = async (req, res) => {
  try {
    const { question_id } = req.params;
    const question = await QuestionModel.findById(question_id);
    if (!question) return errorResponse(res, 'Question not found', 404);
    if (question.question_type !== 'coding') return errorResponse(res, 'Not a coding question');
    const details = await CodingModel.upsertDetails(question_id, req.body);
    return successResponse(res, { details }, 'Coding details saved');
  } catch (err) {
    console.error('setCodingDetails:', err);
    return errorResponse(res, 'Failed to save coding details', 500);
  }
};

export const getCodingDetails = async (req, res) => {
  try {
    const { question_id } = req.params;
    const [details, testCases] = await Promise.all([
      CodingModel.getDetails(question_id),
      CodingModel.getTestCases(question_id),
    ]);
    return successResponse(res, { details, testCases });
  } catch (err) {
    console.error('getCodingDetails:', err);
    return errorResponse(res, 'Failed to fetch coding details', 500);
  }
};

export const addTestCase = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { input, expected_output, is_hidden, points, order_index } = req.body;
    if (!expected_output) return errorResponse(res, 'expected_output is required');
    const testCase = await CodingModel.addTestCase({
      question_id,
      input,
      expected_output,
      is_hidden,
      points,
      order_index,
    });
    return successResponse(res, { testCase }, 'Test case added', 201);
  } catch (err) {
    console.error('addTestCase:', err);
    return errorResponse(res, 'Failed to add test case', 500);
  }
};

export const bulkAddTestCases = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { testCases } = req.body;
    if (!Array.isArray(testCases) || !testCases.length)
      return errorResponse(res, 'testCases array is required');
    const created = await CodingModel.bulkAddTestCases(question_id, testCases);
    return successResponse(
      res,
      { testCases: created, total: created.length },
      `${created.length} test cases added`,
      201
    );
  } catch (err) {
    console.error('bulkAddTestCases:', err);
    return errorResponse(res, 'Failed to bulk add test cases', 500);
  }
};

export const updateTestCase = async (req, res) => {
  try {
    const updated = await CodingModel.updateTestCase(req.params.tc_id, req.body);
    if (!updated) return errorResponse(res, 'Test case not found', 404);
    return successResponse(res, { testCase: updated }, 'Test case updated');
  } catch (err) {
    console.error('updateTestCase:', err);
    return errorResponse(res, 'Failed to update test case', 500);
  }
};

export const deleteTestCase = async (req, res) => {
  try {
    await CodingModel.deleteTestCase(req.params.tc_id);
    return successResponse(res, null, 'Test case deleted');
  } catch (err) {
    console.error('deleteTestCase:', err);
    return errorResponse(res, 'Failed to delete test case', 500);
  }
};

export const getCodingQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const [details, visibleTestCases] = await Promise.all([
      CodingModel.getDetails(question_id),
      CodingModel.getVisibleForCandidate(question_id),
    ]);
    return successResponse(res, { details, visibleTestCases });
  } catch (err) {
    console.error('getCodingQuestion:', err);
    return errorResponse(res, 'Failed to fetch coding question', 500);
  }
};

export const submitCode = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { attempt_id, language, source_code } = req.body;

    if (!attempt_id || !language || !source_code)
      return errorResponse(res, 'attempt_id, language, source_code are required');
    if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase()))
      return errorResponse(res, `Unsupported language. Use: ${SUPPORTED_LANGUAGES.join(', ')}`);

    const testCases = await CodingModel.getTestCases(question_id);

    if (!testCases.length) return errorResponse(res, 'No test cases configured', 404);

    const result = await evaluateSubmission({
      sourceCode: source_code,
      language: language.toLowerCase(),
      testCases,
    });
    if (result.error) return errorResponse(res, result.error, 502);

    let verdict = 'Wrong Answer';
    if (result.compileError) verdict = 'Compilation Error';
    else if (result.runtimeError) verdict = 'Runtime Error';
    else if (result.allVisiblePassed && result.hiddenPassed === result.hiddenTotal)
      verdict = 'Accepted';
    else if (result.allVisiblePassed) verdict = 'Partial';

    const submission = await CodingModel.createSubmission({
      attempt_id,
      question_id,
      candidate_id: req.user.id,
      language: language.toLowerCase(),
      source_code,
      visible_passed: result.visiblePassed,
      visible_total: result.visibleTotal,
      hidden_passed: result.hiddenPassed,
      hidden_total: result.hiddenTotal,
      score: result.score,
      verdict,
    });

    return successResponse(
      res,
      {
        submission_id: submission.id,
        verdict,
        compile_error: result.compileError || null,
        runtime_error: result.runtimeError || null,
        visible_results: result.visibleResults || [],
        visible_passed: result.visiblePassed,
        visible_total: result.visibleTotal,
        hidden_passed: result.hiddenPassed,
        hidden_total: result.hiddenTotal,
        score: result.score,
      },
      'Evaluated successfully'
    );
  } catch (err) {
    console.error('submitCode:', err);
    return errorResponse(res, 'Code evaluation failed', 500);
  }
};
