function MiniExamRow({ exam, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}>
      <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>{exam.title}</span>
      <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>Start →</span>
    </div>
  );
}
export default MiniExamRow;