import ExamCard from './ExamCard';
import { card } from '../../constants/Candidate';
function ExamsTab({ exams, navigate }) {
  const available = exams.filter(e => !e.attempt_status || e.attempt_status === 'not_attempted');
  const completed = exams.filter(e => e.attempt_status === 'evaluated' || e.attempt_status === 'submitted');

  return (
    <div>
      {available.length === 0 && completed.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>No exams available right now.</p>
        </div>
      )}

      {available.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Available to Attempt ({available.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {available.map(exam => <ExamCard key={exam.id} exam={exam} navigate={navigate} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Completed ({completed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completed.map(exam => <ExamCard key={exam.id} exam={exam} navigate={navigate} />)}
          </div>
        </div>
      )}
    </div>
  );
}
export default ExamsTab;