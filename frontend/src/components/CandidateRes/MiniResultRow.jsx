function MiniResultRow({ result }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>{result.exam_title || 'Exam'}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{Number(result.percentage).toFixed(0)}%</span>
        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, background: result.is_passed ? '#ecfdf5' : '#fef2f2', color: result.is_passed ? '#059669' : '#ef4444' }}>
          {result.is_passed ? 'P' : 'F'}
        </span>
      </div>
    </div>
  );
}
export default MiniResultRow;