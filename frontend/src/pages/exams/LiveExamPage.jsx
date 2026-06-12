import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import Editor from '@monaco-editor/react';
const TEMPLATES = {
  python: `import sys\nfor line in sys.stdin:\n    line = line.strip()\n    if line:\n        n = int(line)\n        # your code here\n        print(n)\n`,
  java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        while (sc.hasNextLine()) {\n            int n = Integer.parseInt(sc.nextLine().trim());\n            // your code here\n            System.out.println(n);\n        }\n    }\n}\n`,
  cpp: `#include<iostream>\nusing namespace std;\nint main(){\n    int n;\n    while(cin>>n){\n        // your code here\n        cout<<n<<endl;\n    }\n    return 0;\n}\n`,
  c: `#include<stdio.h>\nint main(){\n    int n;\n    while(scanf("%d",&n)==1){\n        // your code here\n        printf("%d\\n",n);\n    }\n    return 0;\n}\n`,
};

const parseOptions = (options) => {
  if (!options) return [];
  // already array format [{id, text}]
  if (Array.isArray(options)) return options;
  // string — parse first
  const parsed = typeof options === 'string' ? JSON.parse(options) : options;
  // plain object {a: 'text', b: 'text'}
  if (!Array.isArray(parsed)) {
    return Object.entries(parsed).map(([k, v]) => ({ id: k, text: v }));
  }
  return parsed;
};

function CodingPanel({ question, attemptId, examId, onCodeChange }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(TEMPLATES.python);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Write some code first');
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const res = await api.post(`/exams/${examId}/questions/${question.id}/coding/submit`, {
        attempt_id: attemptId,
        language,
        source_code: code,
      });
      setResult(res.data.data);
      console.log(res.data.data);
      onCodeChange(question.id, code);
      if (res.data.data.verdict === 'Accepted') toast.success('✅ All test cases passed!');
      else if (res.data.data.verdict === 'Partial') toast('⚠️ Partial score', { icon: '⚠️' });
      else toast.error(`❌ ${res.data.data.verdict}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setRunning(false);
    }
  };

  const vStyle = (v) =>
    ({
      Accepted: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
      Partial: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
      'Wrong Answer': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
      'Compilation Error': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
      'Runtime Error': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    })[v] || { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>LANGUAGE:</span>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setCode(TEMPLATES[e.target.value]);
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1.5px solid #e2e8f0',
            fontSize: '13px',
            fontWeight: 600,
            background: '#f8fafc',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {['python', 'java', 'cpp', 'c'].map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          disabled={running}
          style={{
            marginLeft: 'auto',
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg,#10b981,#059669)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: running ? 0.7 : 1,
          }}
        >
          {running ? '⏳ Running…' : '📤 Submit Code'}
        </button>
      </div>

      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <Editor
          height="320px"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={(val) => setCode(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>

      {result && (
        <div
          style={{
            borderRadius: '12px',
            border: `1px solid ${vStyle(result.verdict).border}`,
            background: vStyle(result.verdict).bg,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${vStyle(result.verdict).border}`,
            }}
          >
            <span
              style={{ fontWeight: 800, fontSize: '14px', color: vStyle(result.verdict).color }}
            >
              {result.verdict === 'Accepted' ? '✅' : result.verdict === 'Partial' ? '⚠️' : '❌'}{' '}
              {result.verdict}
            </span>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748b',
              }}
            >
              <span>
                Visible: {result.visible_passed}/{result.visible_total}
              </span>
              {result.hidden_total > 0 && (
                <span>
                  Hidden: {result.hidden_passed}/{result.hidden_total}
                </span>
              )}
              <span style={{ color: '#10b981' }}>Score: {result.score} pts</span>
            </div>
          </div>

          {(result.compile_error || result.runtime_error) && (
            <div style={{ padding: '12px 16px' }}>
              <div
                style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', marginBottom: '6px' }}
              >
                {result.compile_error ? 'COMPILATION ERROR' : 'RUNTIME ERROR'}
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#7f1d1d',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  background: '#fff5f5',
                  padding: '10px',
                  borderRadius: '6px',
                }}
              >
                {result.compile_error || result.runtime_error}
              </pre>
            </div>
          )}

          {result.visible_results?.map((tc, i) => (
            <div
              key={i}
              style={{
                margin: '0 12px 10px',
                background: '#fff',
                borderRadius: '8px',
                border: `1px solid ${tc.passed ? '#bbf7d0' : '#fecaca'}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: tc.passed ? '#f0fdf4' : '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{tc.passed ? '✅' : '❌'}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: tc.passed ? '#16a34a' : '#dc2626',
                  }}
                >
                  Test {i + 1} — {tc.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              {!tc.passed && (
                <div
                  style={{
                    padding: '10px 12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  {tc.input && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#94a3b8',
                          marginBottom: '4px',
                        }}
                      >
                        INPUT
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          background: '#f8fafc',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {tc.input}
                      </pre>
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#94a3b8',
                        marginBottom: '4px',
                      }}
                    >
                      EXPECTED
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        background: '#f0fdf4',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        color: '#16a34a',
                      }}
                    >
                      {tc.expected_output}
                    </pre>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#94a3b8',
                        marginBottom: '4px',
                      }}
                    >
                      YOUR OUTPUT
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        background: '#fef2f2',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        color: '#dc2626',
                      }}
                    >
                      {tc.actual_output || '(no output)'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}

          {result.hidden_total > 0 && (
            <div
              style={{
                padding: '10px 16px',
                borderTop: `1px solid ${vStyle(result.verdict).border}`,
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                🔒 Hidden: {result.hidden_passed}/{result.hidden_total} passed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default function LiveExamPage() {
  const { exam_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});
  const [examReady, setExamReady] = useState(false);

  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const attemptIdRef = useRef(null);
  const timeTotalRef = useRef(0);

  // Start exam on mount
  useEffect(() => {
    startExam();
    enterFullscreen();

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordTabSwitch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Prevent right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent copy paste
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());

    return () => {
      clearInterval(timerRef.current);
      clearInterval(autoSaveRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auto save every 15 seconds
  useEffect(() => {
    if (attemptId) {
      autoSaveRef.current = setInterval(() => {
        // silent auto-save — no toast
      }, 15000);
    }
    return () => clearInterval(autoSaveRef.current);
  }, [attemptId]);

  // Timer countdown
  useEffect(() => {
    if (!examReady || timeTotalRef.current <= 0) return;
    setTimeLeft(timeTotalRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [examReady]); // ← just put timeLeft directly, React handles it

  const startExam = async () => {
    try {
      const res = await api.post(`/exams/${exam_id}/start`);
      const data = res.data.data;
      setExam(data.exam);
      setQuestions(data.questions);
      setAttemptId(data.attempt_id);
      attemptIdRef.current = data.attempt_id;
      timeTotalRef.current = data.time_remaining_seconds; // ← just assign
      setTimeLeft(data.time_remaining_seconds);
      if (data.saved_answers) setAnswers(data.saved_answers);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start exam');
      navigate('/exams');
    } finally {
      setLoading(false);
      setExamReady(true); // ← triggers timer AFTER data is set
    }
  };

  const recordTabSwitch = async () => {
    setTabSwitchCount((prev) => prev + 1);
    setTabWarning(true);
    try {
      if (attemptIdRef.current) {
        await api.post(`/exams/${exam_id}/${attemptIdRef.current}/tab-switch`);
      }
    } catch {}
  };

  const enterFullscreen = () => {
    try {
      document.documentElement.requestFullscreen?.();
    } catch {}
  };

  const debouncedSave = useCallback(
    debounce(async (questionId, answer) => {
      try {
        await api.post(`/exams/${exam_id}/${attemptIdRef.current}/save-answer`, {
          question_id: questionId,
          answer,
        });
      } catch (err) {
        console.error('SAVE ERROR:', err.response?.data);
      }
    }, 1000), // wait 1 second after typing stops
    [exam_id]
  );
  const saveAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    debouncedSave(questionId, answer);
  };

  const handleAutoSubmit = async () => {
    toast('⏰ Time up! Submitting your exam...', { icon: '⏰' });
    await submitExam();
  };

  const submitExam = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/exams/${exam_id}/${attemptIdRef.current}/submit`);
      console.log('SUBMIT RESPONSE:', JSON.stringify(res.data));
      toast.success('Exam submitted successfully!');
      document.exitFullscreen?.();
      navigate(`/exams/result/${exam_id}`, {
        replace: true,
        state: { evaluation: res.data.data.evaluation },
      });
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      toast.error(err.response?.data?.error || 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  // Format timer
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Question status for nav panel
  const getQuestionStatus = (index) => {
    const q = questions[index];
    if (!q) return 'not-visited';
    if (markedForReview[q.id]) return 'review';
    if (answers[q.id] !== undefined && answers[q.id] !== '') return 'answered';
    if (index === currentIndex) return 'current';
    return 'not-visited';
  };

  const statusColors = {
    answered: { bg: '#10b981', color: '#fff' },
    review: { bg: '#f59e0b', color: '#fff' },
    current: { bg: '#3b82f6', color: '#fff' },
    'not-visited': { bg: '#e2e8f0', color: '#64748b' },
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Loading your exam...</div>
          <div style={{ color: '#64748b', marginTop: '8px' }}>Please wait</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== '').length;
  const isTimeLow = timeLeft < 300; // less than 5 minutes

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f8fafc',
        userSelect: 'none',
      }}
    >
      {/* Tab switch warning */}
      {tabWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '440px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2
              style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}
            >
              Tab Switch Detected!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '8px' }}>
              You switched tabs or minimized the window.
            </p>
            <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '24px' }}>
              Warning {tabSwitchCount}/3 — After 3 warnings your exam may be flagged.
            </p>
            <button
              onClick={() => {
                setTabWarning(false);
                enterFullscreen();
              }}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continue Exam
            </button>
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '440px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
            <h2
              style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}
            >
              Submit Exam?
            </h2>
            <p style={{ color: '#64748b', marginBottom: '6px' }}>
              Answered: <strong style={{ color: '#10b981' }}>{answeredCount}</strong> /{' '}
              {questions.length}
            </p>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Unanswered:{' '}
              <strong style={{ color: '#ef4444' }}>{questions.length - answeredCount}</strong>
            </p>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>
              You cannot change answers after submitting.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitExam}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          background: '#0f172a',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
              color: '#fff',
            }}
          >
            EP
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px' }}>{exam?.title}</div>
            <div style={{ color: '#475569', fontSize: '11px' }}>
              {questions.length} questions • {exam?.total_marks} marks
            </div>
          </div>
        </div>

        {/* Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isTimeLow ? '#fef2f2' : '#1e293b',
            border: `2px solid ${isTimeLow ? '#fca5a5' : '#334155'}`,
            padding: '8px 16px',
            borderRadius: '10px',
            animation: isTimeLow ? 'pulse 1s infinite' : 'none',
          }}
        >
          <span style={{ fontSize: '16px' }}>⏱</span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: isTimeLow ? '#ef4444' : '#f8fafc',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '9px 20px',
            borderRadius: '9px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Submit Exam
        </button>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Question area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                {answeredCount} answered
              </span>
            </div>
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '4px' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

          {/* Question card */}
          {currentQuestion && (
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              {/* Question header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#3b82f6',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Q{currentIndex + 1}
                  </span>
                  <span
                    style={{
                      background: '#f8fafc',
                      color: '#64748b',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                  {currentQuestion.subject && (
                    <span
                      style={{
                        background: '#f5f3ff',
                        color: '#8b5cf6',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {currentQuestion.subject}
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    setMarkedForReview((prev) => ({
                      ...prev,
                      [currentQuestion.id]: !prev[currentQuestion.id],
                    }))
                  }
                  style={{
                    background: markedForReview[currentQuestion.id] ? '#fef3c7' : '#f8fafc',
                    color: markedForReview[currentQuestion.id] ? '#d97706' : '#94a3b8',
                    border: `1px solid ${markedForReview[currentQuestion.id] ? '#fcd34d' : '#e2e8f0'}`,
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {markedForReview[currentQuestion.id] ? '🔖 Marked' : '🔖 Mark for Review'}
                </button>
              </div>

              {/* Question text */}
              <div style={{ padding: '24px' }}>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0f172a',
                    lineHeight: 1.7,
                    marginBottom: '24px',
                  }}
                >
                  {currentQuestion.question_text}
                </p>

                {/* MCQ Options */}
                {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {parseOptions(currentQuestion.options).map((opt) => {
                      const selected = answers[currentQuestion.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => saveAnswer(currentQuestion.id, opt.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '14px 18px',
                            borderRadius: '10px',
                            textAlign: 'left',
                            border: `2px solid ${selected ? '#3b82f6' : '#e2e8f0'}`,
                            background: selected ? '#eff6ff' : '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            width: '100%',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              flexShrink: 0,
                              background: selected ? '#3b82f6' : '#f1f5f9',
                              color: selected ? '#fff' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {opt.id.toUpperCase()}
                          </div>
                          <span
                            style={{
                              fontSize: '14px',
                              color: selected ? '#1d4ed8' : '#374151',
                              fontWeight: selected ? 600 : 400,
                            }}
                          >
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.question_type === 'true_false' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['true', 'false'].map((val) => {
                      const selected = answers[currentQuestion.id] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => saveAnswer(currentQuestion.id, val)}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '10px',
                            border: `2px solid ${selected ? '#3b82f6' : '#e2e8f0'}`,
                            background: selected ? '#eff6ff' : '#fff',
                            color: selected ? '#1d4ed8' : '#374151',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {val === 'true' ? '✓ True' : '✗ False'}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill in blank / Descriptive */}
                {(currentQuestion.question_type === 'fill_blank' ||
                  currentQuestion.question_type === 'descriptive') && (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                    placeholder={
                      currentQuestion.question_type === 'fill_blank'
                        ? 'Type your answer...'
                        : 'Write your answer in detail...'
                    }
                    rows={currentQuestion.question_type === 'descriptive' ? 8 : 2}
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.6,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      color: '#0f172a',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                )}

                {/* Coding */}
                {currentQuestion.question_type === 'coding' && (
                  <CodingPanel
                    question={currentQuestion}
                    attemptId={attemptId}
                    examId={exam_id}
                    onCodeChange={(qId, code) => saveAnswer(qId, code)}
                  />
                )}

                {/* Clear answer — not for coding */}
                {currentQuestion.question_type !== 'coding' && answers[currentQuestion.id] && (
                  <button
                    onClick={() => saveAnswer(currentQuestion.id, '')}
                    style={{
                      marginTop: '12px',
                      background: 'none',
                      border: '1px solid #fca5a5',
                      color: '#ef4444',
                      padding: '5px 14px',
                      borderRadius: '7px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Clear Answer
                  </button>
                )}
              </div>

              {/* Navigation buttons */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1.5px solid #e2e8f0',
                    background: '#fff',
                    color: '#475569',
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === 0 ? 0.4 : 1,
                  }}
                >
                  ← Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                  disabled={currentIndex === questions.length - 1}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#fff',
                    cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === questions.length - 1 ? 0.4 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — Question navigator */}
        <div
          style={{
            width: '260px',
            minWidth: '260px',
            background: '#fff',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}
          >
            Question Navigator
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '16px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
            }}
          >
            {[
              { color: '#10b981', label: 'Answered' },
              { color: '#f59e0b', label: 'Marked for Review' },
              { color: '#3b82f6', label: 'Current' },
              { color: '#e2e8f0', label: 'Not Visited' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    background: l.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Question grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {questions.map((q, index) => {
              const status = getQuestionStatus(index);
              const style = statusColors[status];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '7px',
                    border: index === currentIndex ? '2px solid #3b82f6' : '2px solid transparent',
                    background: style.bg,
                    color: style.color,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Summary
            </div>
            {[
              { label: 'Answered', count: answeredCount, color: '#10b981' },
              {
                label: 'Not Answered',
                count:
                  questions.length -
                  answeredCount -
                  Object.keys(markedForReview).filter((k) => markedForReview[k]).length,
                color: '#ef4444',
              },
              {
                label: 'For Review',
                count: Object.keys(markedForReview).filter((k) => markedForReview[k]).length,
                color: '#f59e0b',
              },
              { label: 'Total', count: questions.length, color: '#3b82f6' },
            ].map((s) => (
              <div
                key={s.label}
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}
              >
                <span style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📤 Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}
