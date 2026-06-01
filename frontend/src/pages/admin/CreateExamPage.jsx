import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FONT = "'DM Sans', 'Segoe UI', sans-serif";

const S = {
  wrap: { maxWidth: '720px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', fontFamily: FONT },
  subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px', fontFamily: FONT },

  card: {
    background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
    fontFamily: FONT,
  },
  section: { padding: '24px 28px', borderBottom: '1px solid #f8fafc' },
  sectionTitle: { fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px' },

  field: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '7px' },
  required: { color: '#ef4444', marginLeft: '2px' },
  input: (focused) => ({
    width: '100%', padding: '12px 14px', fontSize: '14px', boxSizing: 'border-box',
    border: `1.5px solid ${focused ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '10px', outline: 'none', color: '#111827',
    background: focused ? '#fff' : '#fafafa',
    boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
    transition: 'all 0.2s', fontFamily: FONT,
  }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  grid4: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' },

  numCard: {
    background: '#f8fafc', borderRadius: '12px', padding: '16px',
    border: '1px solid #f1f5f9', textAlign: 'center',
  },
  numLabel: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' },
  numInput: (focused) => ({
    width: '100%', padding: '10px', fontSize: '22px', fontWeight: 900,
    boxSizing: 'border-box', textAlign: 'center', color: '#0f172a',
    background: 'transparent', border: 'none', outline: 'none',
    fontFamily: FONT,
  }),

  toggleRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  toggleItem: (on) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
    border: `1.5px solid ${on ? '#bfdbfe' : '#e5e7eb'}`,
    background: on ? '#eff6ff' : '#fafafa',
    transition: 'all 0.2s', userSelect: 'none',
  }),
  toggleDot: (on) => ({
    width: '38px', height: '22px', borderRadius: '11px', position: 'relative', flexShrink: 0,
    background: on ? '#3b82f6' : '#e2e8f0', transition: 'background 0.2s',
  }),
  toggleThumb: (on) => ({
    position: 'absolute', top: '3px', left: on ? '19px' : '3px',
    width: '16px', height: '16px', borderRadius: '50%',
    background: '#fff', transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  }),
  toggleLabel: { fontSize: '13px', fontWeight: 600, color: '#374151' },

  footer: { padding: '20px 28px', display: 'flex', gap: '12px', background: '#fafafa' },
  submitBtn: (loading) => ({
    flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700,
    background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', border: 'none', borderRadius: '10px',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : '0 2px 8px rgba(59,130,246,0.35)',
    fontFamily: FONT, transition: 'all 0.2s',
  }),
  cancelBtn: {
    flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700,
    background: '#fff', color: '#64748b',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    cursor: 'pointer', fontFamily: FONT,
  },
};

export default function CreateExamPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', instructions: '',
    duration_minutes: 60, total_marks: 100,
    pass_marks: 40, negative_marking: 0,
    shuffle_questions: false, shuffle_options: false,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/exams', form);
      toast.success('Exam created!');
      navigate('/admin/exams');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <h1 style={S.title}>Create New Exam</h1>
        <p style={S.subtitle}>Fill in the details below to set up your exam</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={S.card}>

          {/* Basic Info */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Basic Information</div>
            <div style={S.field}>
              <label style={S.label}>Exam Title <span style={S.required}>*</span></label>
              <input
                type="text" required value={form.title}
                placeholder="e.g. JEE Mock Test 1"
                style={S.input(focused === 'title')}
                onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
                onChange={e => set('title', e.target.value)}
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Description</label>
              <textarea
                value={form.description} rows={3}
                placeholder="Brief description of this exam"
                style={{ ...S.input(focused === 'desc'), resize: 'vertical' }}
                onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
                onChange={e => set('description', e.target.value)}
              />
            </div>
            <div style={{ ...S.field, marginBottom: 0 }}>
              <label style={S.label}>Instructions for Candidates</label>
              <textarea
                value={form.instructions} rows={3}
                placeholder="e.g. Read each question carefully. No calculator allowed."
                style={{ ...S.input(focused === 'inst'), resize: 'vertical' }}
                onFocus={() => setFocused('inst')} onBlur={() => setFocused('')}
                onChange={e => set('instructions', e.target.value)}
              />
            </div>
          </div>

          {/* Numbers */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Exam Configuration</div>
            <div style={S.grid4}>
              {[
                { label: 'Duration (min)', key: 'duration_minutes', min: 1, suffix: 'min' },
                { label: 'Total Marks', key: 'total_marks', min: 1, suffix: 'pts' },
                { label: 'Pass Marks', key: 'pass_marks', min: 0, suffix: 'pts' },
                { label: 'Negative Marking', key: 'negative_marking', min: 0, step: 0.25, suffix: 'pts' },
              ].map(f => (
                <div key={f.key} style={S.numCard}>
                  <div style={S.numLabel}>{f.label}</div>
                  <input
                    type="number" min={f.min} step={f.step || 1}
                    value={form[f.key]}
                    onChange={e => set(f.key, parseFloat(e.target.value))}
                    style={S.numInput(focused === f.key)}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused('')}
                  />
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>{f.suffix}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Options</div>
            <div style={S.toggleRow}>
              {[
                { label: 'Shuffle Questions', key: 'shuffle_questions' },
                { label: 'Shuffle Options', key: 'shuffle_options' },
              ].map(t => (
                <div key={t.key} style={S.toggleItem(form[t.key])} onClick={() => set(t.key, !form[t.key])}>
                  <div style={S.toggleDot(form[t.key])}>
                    <div style={S.toggleThumb(form[t.key])} />
                  </div>
                  <span style={S.toggleLabel}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
              {loading ? 'Creating…' : '✓ Create Exam'}
            </button>
            <button type="button" onClick={() => navigate('/admin/exams')} style={S.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}