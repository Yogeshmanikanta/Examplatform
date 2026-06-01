import {FONT} from '../../constants/Candidate';
function ExamCard({ exam, onStart }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
      padding: '24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '20px'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{exam.title}</h3>
          <span style={{
            background: '#ecfdf5', color: '#059669',
            padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
          }}>LIVE</span>
        </div>
        {exam.description && (
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px', marginTop: 0 }}>
            {exam.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { icon: '⏱', label: `${exam.duration_minutes} min` },
            { icon: '📊', label: `${exam.total_marks} marks` },
            { icon: '✅', label: `Pass: ${exam.pass_marks || 'N/A'}` },
            { icon: '➖', label: `Negative: ${exam.negative_marking || 0}` },
          ].map(info => (
            <div key={info.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px' }}>{info.icon}</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{info.label}</span>
            </div>
          ))}
        </div>
      </div>
      {exam.attempt_status === 'evaluated' || exam.attempt_status === 'submitted' ? (
        <div style={{
          padding: '12px 24px', borderRadius: '10px',
          background: '#f1f5f9', color: '#64748b',
          fontSize: '13px', fontWeight: 700
        }}>✓ Completed</div>
      ) : (
        <button onClick={() => onStart(exam.id)} style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff', border: 'none', padding: '12px 24px',
          borderRadius: '10px', fontSize: '13px', fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
        }}>Start →</button>
      )}
    </div>
  );
}

export default ExamCard;