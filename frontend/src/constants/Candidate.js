export const FONT = "'DM Sans', 'Segoe UI', sans-serif";

// ─── Styles ───────────────────────────────────────────────────
export const S = {
  root: { display: 'flex', minHeight: '100vh', fontFamily: FONT, background: '#f8fafc' },

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
  logoSub: { fontSize: '11px', color: '#475569', marginTop: '1px' },

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
    border: 'none', width: '100%', boxSizing: 'border-box', fontFamily: FONT,
  }),
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' },

  userBar: { padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' },
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
    fontSize: '11px', display: 'inline-block',
    background: 'rgba(59,130,246,0.1)', padding: '1px 8px',
    borderRadius: '20px', marginTop: '2px', color: '#60a5fa',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '9px', borderRadius: '9px', width: '100%', boxSizing: 'border-box',
    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.12)',
    color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    fontFamily: FONT, transition: 'all 0.15s',
  },

  main: { marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: {
    background: '#fff', borderBottom: '1px solid #f1f5f9',
    padding: '0 32px', height: '62px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  topbarTitle: { fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' },
  content: { padding: '28px 32px', flex: 1 },
};

export const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', key: 'home' },
  { icon: '📋', label: 'Available Exams', key: 'exams' },
  { icon: '📊', label: 'My Results', key: 'results' },
  { icon: '📈', label: 'Analytics', key: 'analytics' },
  { icon: '🏆', label: 'Leaderboard', key: 'Leaderboard' },
];

export  const PAGE_TITLES = {
  home: 'Dashboard',
  exams: 'Available Exams',
  results: 'My Results',
  analytics: 'Analytics',
  Leaderboard: 'Leaderboard',
};

export const card = {
  background: '#fff', borderRadius: '14px',
  border: '1px solid #f1f5f9', padding: '22px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};