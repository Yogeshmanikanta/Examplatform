import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const FONT = "'DM Sans', 'Segoe UI', sans-serif";

export default function CandidatesPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null); // candidate obj or null
  const [deleteModal, setDeleteModal] = useState(null); // candidate obj or null
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      candidates.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.mobile?.includes(q)
      )
    );
  }, [search, candidates]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/candidates');
      setCandidates(res.data.data.candidates || []);
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editModal.full_name || !editModal.email) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/candidates/${editModal.id}`, {
        full_name: editModal.full_name,
        email: editModal.email,
        mobile: editModal.mobile,
      });
      toast.success('Candidate updated');
      setEditModal(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/candidates/${deleteModal.id}`);
      toast.success('Candidate deleted');
      setDeleteModal(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Candidates
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
            {candidates.length} registered candidate{candidates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name, email or mobile..."
          style={{
            padding: '9px 16px',
            borderRadius: '9px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            width: '280px',
            fontFamily: FONT,
            outline: 'none',
            background: '#f8fafc',
            color: '#0f172a',
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
            <p style={{ fontSize: '14px' }}>Loading candidates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
            <p style={{ fontSize: '14px' }}>
              {search ? 'No candidates match your search.' : 'No candidates registered yet.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                {['#', 'Name', 'Email', 'Mobile', 'Joined', isSuperAdmin ? 'Actions' : '']
                  .filter(Boolean)
                  .map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      width: '40px',
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#fff',
                        }}
                      >
                        {c.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {c.full_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                    {c.email}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                    {c.mobile || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  {isSuperAdmin && (
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditModal({ ...c })}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '7px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#475569',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal(c)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '7px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <Modal title="Edit Candidate" onClose={() => setEditModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Full Name">
              <input
                value={editModal.full_name || ''}
                onChange={(e) => setEditModal((p) => ({ ...p, full_name: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                value={editModal.email || ''}
                onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Mobile">
              <input
                value={editModal.mobile || ''}
                onChange={(e) => setEditModal((p) => ({ ...p, mobile: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={handleUpdate} disabled={saving} style={btnPrimary}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditModal(null)} style={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal title="Delete Candidate" onClose={() => setDeleteModal(null)}>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: '#0f172a' }}>{deleteModal.full_name}</strong>? This will
            permanently remove their account and all exam data.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{ ...btnPrimary, background: '#ef4444', boxShadow: 'none' }}
            >
              {saving ? 'Deleting...' : '🗑️ Yes, Delete'}
            </button>
            <button onClick={() => setDeleteModal(null)} style={btnSecondary}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#94a3b8',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#64748b',
          display: 'block',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '13px',
  fontFamily: FONT,
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f8fafc',
};

const btnPrimary = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: FONT,
  boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
};

const btnSecondary = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: FONT,
};
