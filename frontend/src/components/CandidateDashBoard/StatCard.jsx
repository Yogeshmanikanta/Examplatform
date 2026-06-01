function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
      padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '22px', flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 800, color }}>{value ?? '—'}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}


export default StatCard;