// Piston API — no key needed
const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;
// Language config for JDOODLE
const LANGUAGE_CONFIG = {
  python: { language: 'python3', versionIndex: '3' },
  java: { language: 'java', versionIndex: '4' },
  cpp: { language: 'cpp17', versionIndex: '0' },
  c: { language: 'c', versionIndex: '5' },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIG);

// Run code against a single stdin input
async function runOnce(sourceCode, language, stdin) {
  const config = LANGUAGE_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const res = await fetch(JDOODLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      script: sourceCode,
      language: config.language,
      versionIndex: config.versionIndex,
      stdin: stdin || '',
    }),
  });

  if (!res.ok) throw new Error(`JDoodle API error: ${res.status}`);
  const data = await res.json();

  // Normalize to same shape rest of code expects
  return {
    stdout: data.output || '',
    stderr: data.error || '',
    code: data.isExecutionSuccess ? 0 : 1,
  };
}

// ─── MAIN EVALUATOR ───────────────────────────────────────────────────────────
export async function evaluateSubmission({ sourceCode, language, testCases }) {
  const visibleCases = testCases.filter((tc) => !tc.is_hidden);
  const hiddenCases = testCases.filter((tc) => tc.is_hidden);

  async function runBatch(cases) {
    if (!cases.length) return [];

    const combinedStdin = cases.map((tc) => (tc.input || '').trim()).join('\n');

    let run;
    try {
      run = await runOnce(sourceCode, language, combinedStdin);
    } catch (err) {
      return { error: err.message };
    }

    if (run.code !== 0 && !run.stdout) {
      const errMsg = run.stderr || 'Runtime error';
      const isCompile = /error:|cannot find symbol|SyntaxError|undefined reference/i.test(errMsg);
      return { fatalError: true, isCompile, errMsg };
    }

    const outputLines = run.stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    return cases.map((tc, i) => ({
      order_index: tc.order_index,
      passed: (outputLines[i] ?? '') === tc.expected_output.trim(),
      input: tc.input,
      expected_output: tc.expected_output.trim(),
      actual_output: outputLines[i] ?? '',
      stderr: run.stderr || null,
    }));
  }

  // ── Visible ──────────────────────────────────────────────────────────────
  const visibleResult = await runBatch(visibleCases);

  if (visibleResult?.error) return { error: visibleResult.error };

  if (visibleResult?.fatalError) {
    return {
      compileError: visibleResult.isCompile ? visibleResult.errMsg : null,
      runtimeError: visibleResult.isCompile ? null : visibleResult.errMsg,
      visibleResults: [],
      visiblePassed: 0,
      visibleTotal: visibleCases.length,
      hiddenPassed: 0,
      hiddenTotal: hiddenCases.length,
      score: 0,
      allVisiblePassed: false,
    };
  }

  const visiblePassed = visibleResult.filter((r) => r.passed).length;
  const allVisiblePassed = visiblePassed === visibleCases.length;

  if (!allVisiblePassed) {
    return {
      visibleResults: visibleResult,
      visiblePassed,
      visibleTotal: visibleCases.length,
      hiddenPassed: 0,
      hiddenTotal: hiddenCases.length,
      score: 0,
      allVisiblePassed: false,
    };
  }

  // ── Hidden ───────────────────────────────────────────────────────────────
  const hiddenResult = await runBatch(hiddenCases);
  let hiddenPassed = 0,
    earnedPoints = 0;

  if (!hiddenResult?.fatalError && !hiddenResult?.error) {
    hiddenResult.forEach((r, i) => {
      if (r.passed) {
        hiddenPassed++;
        earnedPoints += hiddenCases[i].points;
      }
    });
  }
  const visiblePoints = visibleCases.reduce((s, tc) => s + tc.points, 0);
  const score = visiblePoints + earnedPoints;

  return {
    visibleResults: visibleResult,
    visiblePassed,
    visibleTotal: visibleCases.length,
    hiddenPassed,
    hiddenTotal: hiddenCases.length,
    score,
    allVisiblePassed: true,
  };
}
