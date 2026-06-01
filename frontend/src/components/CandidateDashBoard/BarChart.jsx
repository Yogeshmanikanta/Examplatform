function BarChart({ results }) {
  if (!results?.length) return null;
  const last6 = results.slice(0, 6).reverse();
  const max = Math.max(...last6.map(r => Number(r.percentage) || 0), 100);

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        Score Trend (Last 6 Exams)
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px' }}>
        {last6.map((r, i) => {
          const pct = Number(r.percentage) || 0;
          const h = Math.max(4, (pct / max) * 120);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{pct}%</div>
              <div style={{
                width: '100%', height: `${h}px`, borderRadius: '6px 6px 0 0',
                background: r.passed ? 'linear-gradient(180deg,#10b981,#059669)' : 'linear-gradient(180deg,#f87171,#ef4444)',
                transition: 'height 0.3s'
              }} />
              <div style={{
                fontSize: '9px', color: '#94a3b8', textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%'
              }}>{r.exam_title?.split(' ').slice(0, 2).join(' ')}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
        {[{ color: '#10b981', label: 'Passed' }, { color: '#ef4444', label: 'Failed' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default BarChart;