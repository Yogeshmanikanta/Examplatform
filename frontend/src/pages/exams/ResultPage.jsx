import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const evaluation = state?.evaluation;
  const isPassed = evaluation?.is_passed ?? null;
 useEffect(() => {
  if (!state?.evaluation) navigate('/exams');
}, []);

if (!evaluation) return null; // just blank while redirecting

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '48px', maxWidth: '560px', width: '100%', textAlign: 'center' }}>

        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {isPassed ? '🎉' : '📊'}
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          {isPassed === true ? 'Congratulations!' : isPassed === false ? 'Better luck next time!' : 'Exam Submitted!'}
        </h1>

        {isPassed !== null && (
          <div style={{
            display: 'inline-block', padding: '6px 20px', borderRadius: '20px', marginBottom: '24px',
            background: isPassed ? '#ecfdf5' : '#fef2f2',
            color: isPassed ? '#059669' : '#ef4444',
            fontWeight: 700, fontSize: '14px'
          }}>
            {isPassed ? '✓ PASSED' : '✗ NOT PASSED'}
          </div>
        )}

        {/* Score */}
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '52px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {evaluation.score}
            <span style={{ fontSize: '24px', color: '#94a3b8' }}>/{evaluation.total_marks}</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>
            {evaluation.percentage}%
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Correct', value: evaluation.correct, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Incorrect', value: evaluation.incorrect, color: '#ef4444', bg: '#fef2f2' },
            { label: 'Skipped', value: evaluation.skipped, color: '#f59e0b', bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/exams')} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer'
        }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}