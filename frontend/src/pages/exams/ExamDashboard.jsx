import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ExamDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/available');
      setExams(res.data.data.exams);
    } catch (err) {
      // fallback — fetch all published exams
      try {
        const res2 = await api.get('/exams/published');
        setExams(res2.data.data.exams);
      } catch {
        toast.error('Failed to load exams');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: '#0f172a', padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '13px', color: '#fff'
          }}>EP</div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#f8fafc' }}>ExamPlatform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}  onClick={() => navigate('/candidate')}>
            👋 {user?.full_name}
          </span>
          <button onClick={handleLogout} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', padding: '7px 16px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          Available Exams
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
          Select an exam to begin. Make sure you have a stable internet connection.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
            <p>Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
            padding: '60px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              No exams available
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              There are no published exams right now. Check back later.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {exams.map(exam => {
              const isCompleted = exam.attempt_status === 'evaluated' || exam.attempt_status === 'submitted';
              return (
              <div key={exam.id} style={{
                background: '#fff', borderRadius: '16px',
                border: '1px solid #e2e8f0', padding: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '20px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{exam.title}</h3>
                    <span style={{
                      background: '#ecfdf5', color: '#059669',
                      padding: '2px 10px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: 700
                    }}>AVAILABLE</span>
                  </div>
                  {exam.description && (
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>
                      {exam.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {[
                      { icon: '⏱', label: `${exam.duration_minutes} minutes` },
                      { icon: '📊', label: `${exam.total_marks} marks` },
                      { icon: '✅', label: `Pass: ${exam.pass_marks || 'N/A'}` },
                      { icon: '➖', label: `Negative: ${exam.negative_marking || 0}` },
                    ].map(info => (
                      <div key={info.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '13px' }}>{info.icon}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{info.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  disabled={isCompleted}
                  onClick={() => !isCompleted && navigate(`/exams/exam/${exam.id}/instructions`)}
                  style={{
                    background: isCompleted ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: isCompleted ? '#94a3b8' : '#fff',
                    border: 'none', padding: '12px 28px',
                    borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                    cursor: isCompleted ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0
                  }}
                >
                  {isCompleted ? '✓ Completed' : 'Start Exam'}
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}