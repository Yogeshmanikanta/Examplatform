import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ExamsPage from './ExamsPage';
import CreateExamPage from './CreateExamPage';
import ExamDetailPage from './ExamDetailPage';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminResults from './AdminResults';
import CandidatesPage from './CandidatesPage';
import axios from 'axios';

const FONT = "'DM Sans', 'Segoe UI', sans-serif";

const S = {
  root: { display: 'flex', minHeight: '100vh', fontFamily: FONT },

  // Sidebar
  sidebar: {
    width: '240px', minWidth: '240px', height: '100vh', position: 'fixed',
    left: 0, top: 0, zIndex: 100,
    background: '#0a0f1e',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
  },
  sidebarLogo: {
    padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  logoIcon: {
    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 900, fontSize: '13px', color: '#fff',
    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
  },
  logoName: { fontWeight: 800, fontSize: '15px', color: '#f1f5f9', letterSpacing: '-0.3px' },
  logoSub: { fontSize: '11px', color: '#334155', marginTop: '1px' },

  nav: { flex: 1, padding: '16px 10px', overflowY: 'auto' },
  navSection: {
    fontSize: '10px', fontWeight: 800, color: '#334155',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '0 10px', marginBottom: '8px', marginTop: '8px',
  },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '9px', marginBottom: '2px',
    color: active ? '#93c5fd' : '#64748b',
    background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
    borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
    fontSize: '13.5px', fontWeight: active ? 600 : 500,
    transition: 'all 0.15s', cursor: 'pointer', textDecoration: 'none',
  }),
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' },

  userBar: {
    padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
    padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '13px', color: '#fff',
  },
  userName: { fontSize: '13px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: {
    fontSize: '11px', 
    display: 'inline-block', background: 'rgba(59,130,246,0.1)',
    padding: '1px 8px', borderRadius: '20px', marginTop: '2px',
    color: '#60a5fa',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '9px', borderRadius: '9px', width: '100%', boxSizing: 'border-box',
    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.12)',
    color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    fontFamily: FONT, transition: 'all 0.15s',
  },

  // Main
  main: { marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: {
    background: '#fff', borderBottom: '1px solid #f1f5f9',
    padding: '0 32px', height: '62px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  topbarTitle: { fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' },
  createBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', padding: '9px 18px', borderRadius: '9px',
    fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: '0 2px 8px rgba(59,130,246,0.35)', textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
  content: { padding: '28px 32px', flex: 1, background: '#f8fafc' },

  // Home Stats
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px',
  },
  statCard: {
    background: '#fff', borderRadius: '14px', padding: '22px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
  },
  statIconWrap: (bg) => ({
    width: '44px', height: '44px', borderRadius: '11px',
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '20px', marginBottom: '16px',
  }),
  statValue: { fontSize: '34px', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-1px' },
  statLabel: { fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: 500 },

  quickCard: {
    background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  quickTitle: { fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.2px' },
  quickBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  quickBtn: (primary) => ({
    padding: '10px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
    background: primary ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#f8fafc',
    color: primary ? '#fff' : '#475569',
    border: primary ? 'none' : '1px solid #e2e8f0',
    boxShadow: primary ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
    cursor: 'pointer', textDecoration: 'none', fontFamily: FONT,
    transition: 'opacity 0.2s',
  }),
};

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', path: '/admin' },
  { icon: '📋', label: 'Exams', path: '/admin/exams' },
  { icon: '👥', label: 'Candidates', path: '/admin/candidates' },
  { icon: '📊', label: 'Results', path: '/admin/results' },
];

const PAGE_TITLE = {
  '/admin': 'Dashboard',
  '/admin/exams/create': 'Create Exam',
  '/admin/exams': 'Exams',
  '/admin/candidates': 'Candidates',
  '/admin/results': 'Results',
};

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const title = Object.entries(PAGE_TITLE).reverse().find(([k]) => location.pathname.startsWith(k))?.[1] || 'Dashboard';

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoIcon}>EP</div>
          <div>
            <div style={S.logoName}>ExamPlatform</div>
            <div style={S.logoSub}>Admin Console</div>
          </div>
        </div>

        <nav style={S.nav}>
          <div style={S.navSection}>Menu</div>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} style={S.navLink(active)}>
                <span style={S.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={S.userBar}>
          <div style={S.userInfo}>
            <div style={S.avatar}>{user?.full_name?.charAt(0)?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={S.userName}>{user?.full_name}</div>
              <div style={S.userRole}>{user?.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={S.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.topbar}>
          <div style={S.topbarTitle}>{title}</div>
          <Link to="/admin/exams/create" style={S.createBtn}>
            ＋ New Exam
          </Link>
        </div>
        <div style={S.content}>
          <Routes>
            <Route path="/" element={<AdminHome user={user} />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/exams/create" element={<CreateExamPage />} />
            <Route path="/exams/:id" element={<ExamDetailPage />} />
            <Route path="/results" element={<AdminResults />} />
            <Route path="/candidates" element={<CandidatesPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AdminHome({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_exams: 0, total_candidates: 0, total_questions: 0, results_published: 0 });

  useEffect(() => {
    api.get('/exams/admin/stats').then(res => setStats(res.data.data)).catch(err => {
      console.error('Error fetching admin stats:', err);
    });
  }, []);

  const statCards = [
  { label: 'Total Exams', value: stats.total_exams, icon: '📋', bg: '#eff6ff' },
  { label: 'Total Candidates', value: stats.total_candidates, icon: '👥', bg: '#f0fdf4' },
  { label: 'Results Published', value: stats.results_published, icon: '📊', bg: '#faf5ff' },
  { label: 'Total Questions', value: stats.total_questions, icon: '❓', bg: '#fffbeb' },
];
  // rest of JSX same, replace stats.map with statCards.map

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Welcome back, {user?.full_name} 👋
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '5px', fontSize: '14px' }}>
          Here's what's happening on your platform today.
        </p>
      </div>

      <div style={S.statsGrid}>
        {statCards.map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={S.statIconWrap(s.bg)}>{s.icon}</div>
            <div style={S.statValue}>{s.value}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.quickCard}>
        <div style={S.quickTitle}>Quick Actions</div>
        <div style={S.quickBtns}>
          {[
            { label: '＋ Create Exam', path: '/admin/exams/create', primary: true },
            { label: '📋 View Exams', path: '/admin/exams', primary: false },
            { label: '👥 Candidates', path: '/admin/Candidates', primary: false },
          ].map(a => (
            <Link key={a.label} to={a.path} style={S.quickBtn(a.primary)}>{a.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}