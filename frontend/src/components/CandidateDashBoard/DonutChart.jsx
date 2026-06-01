function DonutChart({ passed, failed }) {
  const total = passed + failed;
  if (!total) return null;
  const passPct = Math.round((passed / total) * 100);
  const r = 40, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const passArc = (passed / total) * circ;

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        Pass / Fail Ratio
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fee2e2" strokeWidth="16" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="16"
            strokeDasharray={`${passArc} ${circ}`}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
          />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">{passPct}%</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">Pass Rate</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Passed', count: passed, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Failed', count: failed, color: '#ef4444', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color }} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: s.color, marginLeft: 'auto', paddingLeft: '16px' }}>{s.count}</span>
            </div>
          ))}
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Total: {total} exams
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonutChart;