import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import {
  TYPE_LABELS,
  TYPE_COLORS,
  DIFF_STYLES,
  STATUS_STYLES,
  S,
  FONT,
  EMPTY_FORM,
} from '../../constants/Exam';
function TestCaseModal({ examId, questionId, onClose }) {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ input: '', expected_output: '', is_hidden: false, points: 1 });
  const [editingTc, setEditingTc] = useState(null);

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const res = await api.get(`/exams/${examId}/questions/${questionId}/coding`);
      setTestCases(res.data.data.testCases || []);
    } catch {
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ input: '', expected_output: '', is_hidden: false, points: 1 });
    setEditingTc(null);
  };

  const handleSave = async () => {
    if (!form.expected_output.trim()) {
      toast.error('Expected output is required');
      return;
    }
    setSaving(true);
    try {
      // ← add this
      if (editingTc) {
        await api.put(
          `/exams/${examId}/questions/${questionId}/coding/testcases/${editingTc.id}`,
          form
        );
        toast.success('Updated');
      } else {
        await api.post(`/exams/${examId}/questions/${questionId}/coding/testcases`, {
          ...form,
          order_index: testCases.length,
        });
        toast.success('Added');
      }
      resetForm();
      fetchTestCases();
    } catch (err) {
      console.log(err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tcId) => {
    try {
      await api.delete(`/exams/${examId}/questions/${questionId}/coding/testcases/${tcId}`);
      toast.success('Deleted');
      fetchTestCases();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (tc) => {
    setEditingTc(tc);
    setForm({
      input: tc.input,
      expected_output: tc.expected_output,
      is_hidden: tc.is_hidden,
      points: tc.points,
    });
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, maxWidth: '700px' }}>
        <div style={S.modalHead}>
          <div style={S.modalTitle}>🧪 Manage Test Cases</div>
          <button style={S.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={S.modalBody}>
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '20px',
            }}
          >
            <div style={{ ...S.sectionLbl, marginBottom: '14px' }}>
              {editingTc ? 'Edit Test Case' : 'Add Test Case'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={S.lbl}>Input (stdin)</label>
              <textarea
                rows={2}
                value={form.input}
                onChange={(e) => set('input', e.target.value)}
                placeholder="Leave empty if no input needed"
                style={{ ...S.textarea(false), fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={S.lbl}>Expected Output *</label>
              <textarea
                rows={2}
                value={form.expected_output}
                onChange={(e) => set('expected_output', e.target.value)}
                placeholder="Exact expected output"
                style={{ ...S.textarea(false), fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={S.lbl}>Points</label>
                <input
                  type="number"
                  min={1}
                  value={form.points}
                  onChange={(e) => set('points', parseInt(e.target.value))}
                  style={S.inp(false)}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                }}
              >
                <input
                  type="checkbox"
                  id="hidden"
                  checked={form.is_hidden}
                  onChange={(e) => set('is_hidden', e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label
                  htmlFor="hidden"
                  style={{ fontSize: '13px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}
                >
                  Hidden test case
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              {editingTc && (
                <button onClick={resetForm} style={S.cancelModalBtn}>
                  Cancel Edit
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...S.saveBtn(saving), flex: 'unset', padding: '10px 24px' }}
              >
                {saving ? 'Saving…' : editingTc ? '✓ Update' : '＋ Add Test Case'}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Loading…</div>
          ) : testCases.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
              No test cases yet
            </div>
          ) : (
            testCases.map((tc, i) => (
              <div
                key={tc.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '10px',
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>
                      TC {i + 1}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: tc.is_hidden ? '#fef3c7' : '#f0fdf4',
                        color: tc.is_hidden ? '#d97706' : '#16a34a',
                      }}
                    >
                      {tc.is_hidden ? '🔒 Hidden' : '👁 Visible'}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#eff6ff',
                        color: '#2563eb',
                      }}
                    >
                      {tc.points} pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => startEdit(tc)} style={S.iconBtn('#3b82f6')}>
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(tc.id)} style={S.iconBtn('#ef4444')}>
                      🗑
                    </button>
                  </div>
                </div>
                {tc.input && (
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                      INPUT:{' '}
                    </span>
                    <code
                      style={{
                        fontSize: '12px',
                        background: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {tc.input}
                    </code>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                    EXPECTED:{' '}
                  </span>
                  <code
                    style={{
                      fontSize: '12px',
                      background: '#f1f5f9',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {tc.expected_output}
                  </code>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={S.modalFoot}>
          <button style={S.cancelModalBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestCaseModal;
