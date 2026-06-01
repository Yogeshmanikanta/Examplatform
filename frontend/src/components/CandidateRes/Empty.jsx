function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '13px', margin: 0 }}>{text}</p>
    </div>
  );
}

export default Empty;