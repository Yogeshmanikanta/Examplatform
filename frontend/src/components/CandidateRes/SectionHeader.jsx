import {FONT} from '../../constants/Candidate';
function SectionHeader({ title, count, onMore }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{title} {count > 0 && <span style={{ color: '#94a3b8', fontWeight: 500 }}>({count})</span>}</span>
      {onMore && <button onClick={onMore} style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>View all →</button>}
    </div>
  );
}
export default SectionHeader;