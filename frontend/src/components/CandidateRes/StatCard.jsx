function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '30px', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}
export default StatCard;