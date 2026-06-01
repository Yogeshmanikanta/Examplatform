import {MiniExamRow,SectionHeader,MiniResultRow,StatCard,Empty} from './index';
import { card } from '../../constants/Candidate';
function HomeTab({ user, stats, exams, results, passed, failed, onNav, navigate }) {
  const available = exams.filter(e => !e.attempt_status || e.attempt_status === 'not_attempted');
  const completed = exams.filter(e => e.attempt_status === 'evaluated' || e.attempt_status === 'submitted');
  const recentResults = results.slice(0, 3);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Track your performance and attempt new exams.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon="📝" label="Total Attempts" value={stats?.total_exams || 0} color="#3b82f6" bg="#eff6ff" />
        <StatCard icon="✅" label="Passed" value={passed} color="#10b981" bg="#ecfdf5" />
        <StatCard icon="❌" label="Failed" value={failed} color="#ef4444" bg="#fef2f2" />
        <StatCard icon="📈" label="Avg Score" value={stats?.avg_percentage ? `${Number(stats.avg_percentage).toFixed(1)}%` : '—'} color="#8b5cf6" bg="#f5f3ff" />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Available exams */}
        <div style={card}>
          <SectionHeader title="Available Exams" count={available.length} onMore={() => onNav('exams')} />
          {available.length === 0 ? (
            <Empty icon="📋" text="No exams available right now" />
          ) : available.slice(0, 3).map(exam => (
            <MiniExamRow key={exam.id} exam={exam} onClick={() => navigate(`/exams/exam/${exam.id}/instructions`)} />
          ))}
        </div>

        {/* Recent results */}
        <div style={card}>
          <SectionHeader title="Recent Results" count={recentResults.length} onMore={() => onNav('results')} />
          {recentResults.length === 0 ? (
            <Empty icon="📊" text="No results yet. Attempt an exam!" />
          ) : recentResults.map(r => (
            <MiniResultRow key={r.id} result={r} />
          ))}
        </div>
      </div>

      {/* Completed exams */}
      {completed.length > 0 && (
        <div style={card}>
          <SectionHeader title="Completed Exams" count={completed.length} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {completed.map(exam => (
              <div key={exam.id} style={{
                padding: '14px', borderRadius: '10px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{exam.title}</div>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 10px',
                  borderRadius: '20px', background: '#ecfdf5', color: '#059669'
                }}>✓ Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default HomeTab;