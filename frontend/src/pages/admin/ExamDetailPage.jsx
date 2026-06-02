import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

import {
  TYPE_LABELS,
  TYPE_COLORS,
  DIFF_STYLES,
  STATUS_STYLES,
  S,
  FONT,
  EMPTY_FORM,
} from '../../constants/Exam';

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState(null); // null = add, obj = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // qId or null

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [examRes, qRes] = await Promise.all([
        api.get(`/exams/${id}`),
        api.get(`/exams/${id}/questions`),
      ]);
      setExam(examRes.data.data.exam || examRes.data.data);
      setQuestions(qRes.data.data.questions || qRes.data.data || []);
    } catch {
      toast.error('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingQ(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditingQ(q);
    setForm({
      question_text: q.question_text || '',
      question_type: q.question_type || 'mcq',
      marks: q.marks || 1,
      negative_marks: q.negative_marks || 0,
      difficulty: q.difficulty || 'medium',
      subject: q.subject || '',
      topic: q.topic || '',
      option_a: q.options?.a || '',
      option_b: q.options?.b || '',
      option_c: q.options?.c || '',
      option_d: q.options?.d || '',
      correct_answer: q.correct_answer || 'a',
      tf_answer: q.correct_answer || 'true',
      fill_answer: q.correct_answer || '',
      model_answer: q.model_answer || '',
      language: q.language || 'javascript',
      starter_code: q.starter_code || '',
      expected_output: q.expected_output || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) {
      toast.error('Question text is required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editingQ) {
        await api.put(`/exams/${id}/questions/${editingQ.id}`, payload);
        toast.success('Question updated!');
      } else {
        await api.post(`/exams/${id}/questions`, payload);
        toast.success('Question added!');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qId) => {
    setDeleting(true);
    try {
      await api.delete(`/exams/${id}/questions/${qId}`);
      toast.success('Question deleted');
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      toast.error('Add at least one question before publishing');
      return;
    }
    setPublishing(true);
    try {
      await api.patch(`/exams/${id}/publish`);
      toast.success('Exam published!');
      setExam((prev) => ({ ...prev, status: 'published' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fi = (name) => ({
    style: S.inp(focused === name),
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(''),
  });
  const ta = (name) => ({
    style: S.textarea(focused === name),
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(''),
  });

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          fontFamily: FONT,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading exam…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!exam)
    return (
      <div style={{ fontFamily: FONT, color: '#94a3b8', padding: '48px', textAlign: 'center' }}>
        Exam not found.
      </div>
    );

  const st = STATUS_STYLES[exam.status] || STATUS_STYLES.draft;
  const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div style={S.page}>
      {/* Header Card */}
      <div style={S.headerCard}>
        <div style={S.headerTop}>
          <div>
            <div style={S.examTitle}>{exam.title}</div>
            {exam.description && <div style={S.examDesc}>{exam.description}</div>}
          </div>
          <div style={S.headerActions}>
            <button style={S.backBtn} onClick={() => navigate('/admin/exams')}>
              ← Back
            </button>
            <button
              style={S.publishBtn(exam.status === 'published' || exam.status === 'completed')}
              onClick={handlePublish}
              disabled={publishing || exam.status === 'published' || exam.status === 'completed'}
            >
              {publishing
                ? 'Publishing…'
                : exam.status === 'published'
                  ? '✓ Published'
                  : '🚀 Publish Exam'}
            </button>
          </div>
        </div>
        <div style={S.metaRow}>
          <span style={S.metaChip(st.color, st.bg)}>
            <span style={S.statsDot(st.dot)} />
            {exam.status}
          </span>
          <span style={S.metaChip('#64748b', '#f1f5f9')}>⏱ {exam.duration_minutes} mins</span>
          <span style={S.metaChip('#64748b', '#f1f5f9')}>🎯 {exam.total_marks} marks</span>
          <span style={S.metaChip('#64748b', '#f1f5f9')}>✅ Pass: {exam.pass_marks}</span>
          {exam.negative_marking > 0 && (
            <span style={S.metaChip('#dc2626', '#fef2f2')}>−{exam.negative_marking} negative</span>
          )}
          {exam.shuffle_questions && (
            <span style={S.metaChip('#7c3aed', '#faf5ff')}>🔀 Shuffled</span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={S.statsRow}>
        {[
          { label: 'Total Questions', value: questions.length, icon: '❓' },
          { label: 'Total Marks', value: totalMarks, icon: '🎯' },
          {
            label: 'MCQ',
            value: questions.filter((q) => q.question_type === 'mcq').length,
            icon: '☑️',
          },
          {
            label: 'Descriptive',
            value: questions.filter((q) => q.question_type === 'descriptive').length,
            icon: '✍️',
          },
        ].map((s) => (
          <div key={s.label} style={S.statBox}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={S.statNum}>{s.value}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Questions Section */}
      <div style={S.qSection}>
        <div style={S.qHeader}>
          <div style={S.qTitle}>Questions ({questions.length})</div>
          <button style={S.addBtn} onClick={openAdd}>
            ＋ Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>❓</div>
            <div style={S.emptyTitle}>No questions yet</div>
            <div style={S.emptyText}>Add your first question to get started</div>
          </div>
        ) : (
          questions.map((q, i) => {
            const tc = TYPE_COLORS[q.question_type] || TYPE_COLORS.mcq;
            const dc = DIFF_STYLES[q.difficulty] || DIFF_STYLES.medium;
            return (
              <div
                key={q.id}
                style={S.qRow(i, questions.length)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={S.qNum}>{i + 1}</div>
                <div style={S.qBody}>
                  <div style={S.qText}>{q.question_text}</div>
                  <div style={S.qMeta}>
                    <span style={S.qTag(tc.bg, tc.color)}>
                      {TYPE_LABELS[q.question_type] || q.question_type}
                    </span>
                    <span style={S.qTag(dc.bg, dc.color)}>{q.difficulty}</span>
                    <span style={S.qTag('#f1f5f9', '#64748b')}>
                      {q.marks} mark{q.marks !== 1 ? 's' : ''}
                    </span>
                    {q.subject && <span style={S.qTag('#f8fafc', '#94a3b8')}>{q.subject}</span>}
                  </div>
                </div>
                <div style={S.qActions}>
                  <button
                    style={S.iconBtn('#3b82f6')}
                    title="Edit"
                    onClick={() => openEdit(q)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#eff6ff';
                      e.currentTarget.style.borderColor = '#bfdbfe';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    ✏️
                  </button>

                  <button
                    style={S.iconBtn('#ef4444')}
                    title="Delete"
                    onClick={() => setDeleteConfirm(q.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.borderColor = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <div style={S.modalTitle}>{editingQ ? 'Edit Question' : 'Add Question'}</div>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div style={S.modalBody}>
              {/* Question Type Tabs */}
              <div style={{ marginBottom: '6px' }}>
                <div style={S.sectionLbl}>Question Type</div>
                <div style={S.typeTabs}>
                  {Object.entries(TYPE_LABELS).map(([val, lbl]) => (
                    <button
                      key={val}
                      style={S.typeTab(form.question_type === val)}
                      onClick={() => set('question_type', val)}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div style={S.formRow}>
                <label style={S.lbl}>Question Text *</label>
                <textarea
                  rows={3}
                  value={form.question_text}
                  onChange={(e) => set('question_text', e.target.value)}
                  placeholder="Enter your question here…"
                  {...ta('qtext')}
                />
              </div>

              {/* Meta row */}
              <div style={S.formGrid3}>
                <div>
                  <label style={S.lbl}>Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={form.marks}
                    onChange={(e) => set('marks', parseFloat(e.target.value))}
                    {...fi('marks')}
                  />
                </div>
                <div>
                  <label style={S.lbl}>Negative Marks</label>
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={form.negative_marks}
                    onChange={(e) => set('negative_marks', parseFloat(e.target.value))}
                    {...fi('neg')}
                  />
                </div>
                <div>
                  <label style={S.lbl}>Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => set('difficulty', e.target.value)}
                    style={S.sel}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div style={S.formGrid2}>
                <div>
                  <label style={S.lbl}>Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    placeholder="e.g. Physics"
                    onChange={(e) => set('subject', e.target.value)}
                    {...fi('subj')}
                  />
                </div>
                <div>
                  <label style={S.lbl}>Topic</label>
                  <input
                    type="text"
                    value={form.topic}
                    placeholder="e.g. Kinematics"
                    onChange={(e) => set('topic', e.target.value)}
                    {...fi('topic')}
                  />
                </div>
              </div>

              <div style={S.divider} />

              {/* MCQ */}
              {form.question_type === 'mcq' && (
                <div>
                  <div style={S.sectionLbl}>Options</div>
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} style={S.optionRow}>
                      <div style={S.optionLetter}>{opt.toUpperCase()}</div>
                      <input
                        type="text"
                        value={form[`option_${opt}`]}
                        onChange={(e) => set(`option_${opt}`, e.target.value)}
                        placeholder={`Option ${opt.toUpperCase()}`}
                        style={{ ...S.inp(focused === `opt_${opt}`), marginBottom: 0 }}
                        onFocus={() => setFocused(`opt_${opt}`)}
                        onBlur={() => setFocused('')}
                      />
                    </div>
                  ))}
                  <div style={{ marginTop: '16px' }}>
                    <div style={S.sectionLbl}>Correct Answer</div>
                    <div style={S.radioGroup}>
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          style={S.radioBtn(form.correct_answer === opt)}
                          onClick={() => set('correct_answer', opt)}
                        >
                          Option {opt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* True/False */}
              {form.question_type === 'true_false' && (
                <div>
                  <div style={S.sectionLbl}>Correct Answer</div>
                  <div style={S.radioGroup}>
                    {['true', 'false'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        style={S.radioBtn(form.tf_answer === opt)}
                        onClick={() => set('tf_answer', opt)}
                      >
                        {opt === 'true' ? '✓ True' : '✗ False'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fill in the Blank */}
              {form.question_type === 'fill_blank' && (
                <div>
                  <div style={S.sectionLbl}>Correct Answer</div>
                  <input
                    type="text"
                    value={form.fill_answer}
                    placeholder="The exact correct answer"
                    onChange={(e) => set('fill_answer', e.target.value)}
                    {...fi('fill')}
                  />
                </div>
              )}

              {/* Descriptive */}
              {form.question_type === 'descriptive' && (
                <div>
                  <div style={S.sectionLbl}>Model Answer (for evaluator reference)</div>
                  <textarea
                    rows={4}
                    value={form.model_answer}
                    placeholder="Write the ideal answer here for evaluators to reference…"
                    onChange={(e) => set('model_answer', e.target.value)}
                    {...ta('model')}
                  />
                </div>
              )}

              {/* Coding */}
              {form.question_type === 'coding' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={S.lbl}>Language</label>
                    <select
                      value={form.language}
                      onChange={(e) => set('language', e.target.value)}
                      style={S.sel}
                    >
                      {['javascript', 'python', 'java', 'cpp', 'c'].map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={S.lbl}>Starter Code</label>
                    <textarea
                      rows={4}
                      value={form.starter_code}
                      placeholder="function solution() { ... }"
                      onChange={(e) => set('starter_code', e.target.value)}
                      style={{
                        ...S.textarea(focused === 'starter'),
                        fontFamily: 'monospace',
                        fontSize: '13px',
                      }}
                      onFocus={() => setFocused('starter')}
                      onBlur={() => setFocused('')}
                    />
                  </div>
                  <div>
                    <label style={S.lbl}>Expected Output</label>
                    <textarea
                      rows={3}
                      value={form.expected_output}
                      placeholder="Expected output or test cases"
                      onChange={(e) => set('expected_output', e.target.value)}
                      style={{
                        ...S.textarea(focused === 'output'),
                        fontFamily: 'monospace',
                        fontSize: '13px',
                      }}
                      onFocus={() => setFocused('output')}
                      onBlur={() => setFocused('')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={S.modalFoot}>
              <button style={S.cancelModalBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button style={S.saveBtn(saving)} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingQ ? '✓ Update Question' : '＋ Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={S.overlay}
          onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}
        >
          <div style={S.modal}>
            <div style={S.modalHead}>
              <div style={S.modalTitle}>Delete Question</div>
              <button style={S.closeBtn} onClick={() => setDeleteConfirm(null)}>
                ✕
              </button>
            </div>
            <div style={S.modalBody}>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
            </div>
            <div style={S.modalFoot}>
              <button
                style={S.cancelModalBtn}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                style={{
                  ...S.saveBtn(deleting),
                  background: '#ef4444',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                }}
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : '🗑 Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Build API payload from form ──────────────────────────────────────────────
function buildPayload(form) {
  const base = {
    question_text: form.question_text.trim(),
    question_type: form.question_type,
    marks: form.marks,
    negative_marks: form.negative_marks,
    difficulty: form.difficulty,
    subject: form.subject,
    topic: form.topic,
  };
  switch (form.question_type) {
    case 'mcq':
      return {
        ...base,
        options: { a: form.option_a, b: form.option_b, c: form.option_c, d: form.option_d },
        correct_answer: form.correct_answer,
      };
    case 'true_false':
      return { ...base, correct_answer: form.tf_answer };
    case 'fill_blank':
      return { ...base, correct_answer: form.fill_answer };
    case 'descriptive':
      return { ...base, model_answer: form.model_answer };
    case 'coding':
      return {
        ...base,
        language: form.language,
        starter_code: form.starter_code,
        expected_output: form.expected_output,
      };
    default:
      return base;
  }
}
