import {card} from '../../constants/Candidate';
function ResultsTab({ results, navigate }) {
  if (results.length === 0) return (
    <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>No results yet. Attempt an exam to see your scores.</p>
    </div>
  );

  return (
    <div style={card}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            {['Exam', 'Score', 'Percentage', 'Status', 'Rank', 'Date'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={r.id} style={{ borderBottom: i < results.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <td style={{ padding: '14px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{r.exam_title || 'Exam'}</td>
              <td style={{ padding: '14px', fontSize: '13px', color: '#475569' }}>{r.total_score}/{r.total_marks || '—'}</td>
              <td style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', minWidth: '60px' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${r.percentage}%`, background: r.percentage >= 50 ? '#10b981' : '#ef4444' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{Number(r.percentage).toFixed(1)}%</span>
                </div>
              </td>
              <td style={{ padding: '14px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                  background: r.is_passed ? '#ecfdf5' : '#fef2f2',
                  color: r.is_passed ? '#059669' : '#ef4444',
                }}>
                  {r.is_passed ? '✓ Passed' : '✗ Failed'}
                </span>
              </td>
              <td style={{ padding: '14px', fontSize: '13px', color: '#475569' }}>
                {r.rank ? `#${r.rank}` : '—'}
              </td>
              <td style={{ padding: '14px', fontSize: '12px', color: '#94a3b8' }}>
                {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default ResultsTab;