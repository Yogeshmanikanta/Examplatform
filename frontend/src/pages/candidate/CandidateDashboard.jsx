import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { S, NAV_ITEMS, PAGE_TITLES, FONT, card } from '../../constants/Candidate';
import { Loader, HomeTab, AnalyticsTab, ExamsTab, ResultsTab } from '../../components/CandidateRes';
import AdminResults from '../admin/AdminResults';

// ─── Main ─────────────────────────────────────────────────────
export default function ExamDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('home');
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [examsRes, statsRes] = await Promise.allSettled([
        api.get('/exams/available'), // ← available not published (includes attempt_status)
        api.get('/candidate/stats'),
      ]);
      if (examsRes.status === 'fulfilled') setExams(examsRes.value.data.data.exams || []);
      if (statsRes.status === 'fulfilled') {
        setResults(statsRes.value.data.data.results || []);
        setStats(statsRes.value.data.data.stats || null);
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const totalExams = Number(stats?.total_exams) || 0;
  const passed = Number(stats?.is_passed) || 0;
  const failed = totalExams - passed;

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoIcon}>EP</div>
          <div>
            <div style={S.logoName}>ExamPlatform</div>
            <div style={S.logoSub}>Candidate Portal</div>
          </div>
        </div>

        <nav style={S.nav}>
          <div style={S.navSection}>Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={S.navLink(tab === item.key)}
            >
              <span style={S.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={S.userBar}>
          <div style={S.userInfo}>
            <div style={S.avatar}>{user?.full_name?.charAt(0)?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={S.userName}>{user?.full_name}</div>
              <div style={S.userRole}>candidate</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={S.logoutBtn}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.topbar}>
          <div style={S.topbarTitle}>{PAGE_TITLES[tab]}</div>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>👋 {user?.full_name}</span>
        </div>

        <div style={S.content}>
          {loading ? (
            <Loader />
          ) : (
            <>
              {tab === 'home' && (
                <HomeTab
                  user={user}
                  stats={stats}
                  exams={exams}
                  results={results}
                  passed={passed}
                  failed={failed}
                  onNav={setTab}
                  navigate={navigate}
                />
              )}
              {tab === 'exams' && <ExamsTab exams={exams} navigate={navigate} />}
              {tab === 'results' && <ResultsTab results={results} navigate={navigate} />}
              {tab === 'analytics' && (
                <AnalyticsTab stats={stats} results={results} passed={passed} failed={failed} />
              )}
              {tab === 'Leaderboard' && <AdminResults />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
