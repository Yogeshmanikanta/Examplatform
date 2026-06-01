import {FONT} from '../../constants/Candidate';
function ExamCard({ exam, navigate }) {
  const isCompleted = exam.attempt_status === 'evaluated' || exam.attempt_status === 'submitted';
  const isInProgress = exam.attempt_status === 'in_progress';

  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: `1px solid ${isCompleted ? '#d1fae5' : '#e2e8f0'}`,
      padding: '20px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '16px',
      opacity: isCompleted ? 0.85 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{exam.title}</span>
          {isCompleted && (
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#ecfdf5', color: '#059669' }}>✓ Completed</span>
          )}
          {isInProgress && (
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#fffbeb', color: '#d97706' }}>⏳ In Progress</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            exam.duration_minutes && `⏱ ${exam.duration_minutes} mins`,
            exam.total_marks && `📝 ${exam.total_marks} marks`,
            exam.pass_marks && `✅ Pass: ${exam.pass_marks}`,
          ].filter(Boolean).map(t => (
            <span key={t} style={{ fontSize: '12px', color: '#64748b' }}>{t}</span>
          ))}
        </div>
      </div>
      <button
        disabled={isCompleted}
        onClick={() => !isCompleted && navigate(`/exams/exam/${exam.id}/instructions`)}
        style={{
          padding: '10px 20px', borderRadius: '9px', border: 'none',
          background: isCompleted ? '#f1f5f9' : isInProgress ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
          color: isCompleted ? '#94a3b8' : '#fff',
          fontSize: '13px', fontWeight: 700,
          cursor: isCompleted ? 'not-allowed' : 'pointer',
          fontFamily: FONT, whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: isCompleted ? 'none' : '0 2px 8px rgba(59,130,246,0.3)',
        }}
      >
        {isCompleted ? '✓ Done' : isInProgress ? 'Resume' : 'Start Exam →'}
      </button>
    </div>
  );
}
export default ExamCard;