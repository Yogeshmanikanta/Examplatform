import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { S, FONT, STATUS_STYLES } from '../../constants/Exam';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteExam, setDeleteExam] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.data.exams);
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      setExams((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete exam');
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: '14px', fontFamily: FONT }}>Loading exams…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (exams.length === 0)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          padding: '72px 32px',
          textAlign: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '20px',
          }}
        >
          📋
        </div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px',
            fontFamily: FONT,
          }}
        >
          No exams yet
        </h3>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', fontFamily: FONT }}>
          Create your first exam to get started
        </p>
        <Link
          to="/admin/exams/create"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            padding: '11px 24px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
            fontFamily: FONT,
          }}
        >
          ＋ Create Exam
        </Link>
      </div>
    );

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        fontFamily: FONT,
      }}
    >
      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 120px 120px 130px 100px',
          padding: '0 24px',
          background: '#f8fafc',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {['Title', 'Duration', 'Total Marks', 'Status', 'Actions'].map((h) => (
          <div
            key={h}
            style={{
              padding: '13px 0',
              fontSize: '11px',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {exams.map((exam, i) => {
        const st = STATUS_STYLES[exam.status] || STATUS_STYLES.draft;
        return (
          <div
            key={exam.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 120px 120px 130px 100px',
              padding: '0 24px',
              alignItems: 'center',
              borderBottom: i < exams.length - 1 ? '1px solid #f8fafc' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                {exam.title}
              </div>
              {exam.description && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                  }}
                >
                  {exam.description}
                </div>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {exam.duration_minutes} mins
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {exam.total_marks}
            </div>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: st.bg,
                  color: st.color,
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: st.dot,
                    flexShrink: 0,
                  }}
                />
                {exam.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => navigate(`/admin/exams/${exam.id}`)}
                title="View"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                👁
              </button>
              <button
                onClick={() => setDeleteConfirm(exam.id)}
                title="Delete"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                🗑
              </button>
            </div>
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
              <div
                style={S.overlay}
                onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}
              >
                <div style={S.modal}>
                  <div style={S.modalHead}>
                    <div style={S.modalTitle}>Delete Exam</div>
                    <button style={S.closeBtn} onClick={() => setDeleteConfirm(null)}>
                      ✕
                    </button>
                  </div>
                  <div style={S.modalBody}>
                    <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
                      Are you sure you want to delete this exam ? This action cannot be undone.
                    </p>
                  </div>
                  <div style={S.modalFoot}>
                    <button
                      style={S.cancelModalBtn}
                      onClick={() => setDeleteConfirm(null)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      style={{
                        ...S.saveBtn(deleting),
                        background: '#ef4444',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                      }}
                      onClick={() => handleDeleteExam(deleteConfirm)}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : '🗑 Yes, Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Footer count */}
      <div
        style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: '12px',
          color: '#94a3b8',
          fontWeight: 500,
        }}
      >
        {exams.length} exam{exams.length !== 1 ? 's' : ''} total
      </div>
    </div>
  );
}
