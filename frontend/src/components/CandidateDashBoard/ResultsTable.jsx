function ResultsTable({ results }) {
  if (!results?.length) return (
    <div style={{
      background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
      padding: '48px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>No results yet. Attempt an exam to see your performance.</p>
    </div>
  );

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>My Results</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Exam', 'Score', 'Percentage', 'Rank', 'Status', 'Date'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: '11px', color: '#94a3b8', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.attempt_id || i} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{r.exam_title}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{r.total_marks} marks</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {r.score}/{r.total_marks}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        width: `${Math.min(100, Number(r.percentage))}%`,
                        background: Number(r.percentage) >= 60 ? '#10b981' : '#ef4444'
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{Number(r.percentage).toFixed(1)}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  {r.rank ? `#${r.rank}` : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: r.passed ? '#ecfdf5' : '#fef2f2',
                    color: r.passed ? '#059669' : '#ef4444'
                  }}>{r.passed ? '✓ PASSED' : '✗ FAILED'}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8' }}>
                  {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsTable;