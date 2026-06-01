import {card} from '../../constants/Candidate';
import Empty from './Empty';
function AnalyticsTab({ stats, results, passed, failed }) {
  const total = passed + failed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(0) : 0;
  const last6 = results.slice(0, 6).reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Personal Best Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {[
          { label: 'Best Score', value: stats?.best_score ? `${stats.best_score}%` : '—', icon: '🏆', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Best Rank', value: stats?.best_rank ? `#${stats.best_rank}` : '—', icon: '🥇', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: '🎯', color: '#10b981', bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Trend */}
      <div style={card}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Score Trend (Last 6 Exams)</div>
        {last6.length === 0 ? (
          <Empty icon="📈" text="No data yet" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
            {last6.map((r, i) => {
              const pct = Number(r.percentage) || 0;
              const h = Math.max(8, (pct / 100) * 110);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: pct >= 50 ? '#10b981' : '#ef4444' }}>{pct.toFixed(0)}%</div>
                  <div style={{
                    width: '100%', height: `${h}px`, borderRadius: '6px 6px 0 0',
                    background: pct >= 50 ? 'linear-gradient(180deg,#10b981,#059669)' : 'linear-gradient(180deg,#f87171,#ef4444)',
                    transition: 'height 0.3s',
                  }} />
                  <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {r.exam_title?.slice(0, 8) || `E${i + 1}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pass/Fail Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={card}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Pass / Fail Ratio</div>
          {total === 0 ? <Empty icon="🍩" text="No data yet" /> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                {(() => {
                  const passAngle = (passed / total) * 360;
                  const r = 38; const cx = 50; const cy = 50;
                  const toRad = (deg) => (deg - 90) * Math.PI / 180;
                  const arc = (startDeg, endDeg, color) => {
                    const start = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
                    const end = { x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg)) };
                    const large = endDeg - startDeg > 180 ? 1 : 0;
                    return <path d={`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`} fill={color} />;
                  };
                  return (<>
                    {arc(0, passAngle, '#10b981')}
                    {arc(passAngle, 360, '#ef4444')}
                    <circle cx={cx} cy={cy} r="22" fill="#fff" />
                    <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0f172a">{passRate}%</text>
                  </>);
                })()}
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'Passed', val: passed, color: '#10b981' }, { label: 'Failed', val: failed, color: '#ef4444' }].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: '13px', color: '#475569' }}>{s.label}: <strong style={{ color: '#0f172a' }}>{s.val}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Performance Summary</div>
          {[
            { label: 'Total Exams Taken', value: stats?.total_exams || 0 },
            { label: 'Average Score', value: stats?.avg_percentage ? `${Number(stats.avg_percentage).toFixed(1)}%` : '—' },
            { label: 'Highest Score', value: stats?.best_score ? `${stats.best_score}%` : '—' },
            { label: 'Best Rank', value: stats?.best_rank ? `#${stats.best_rank}` : '—' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AnalyticsTab;