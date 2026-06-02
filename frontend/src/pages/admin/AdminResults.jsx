import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { S, FONT } from '../../constants/Adminres';

function StatBox({ label, value, color = '#0f172a', icon }) {
  return (
    <div style={S.statBox}>
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
      <div style={S.statNum(color)}>{value}</div>
      <div style={S.statLbl}>{label}</div>
    </div>
  );
}

function ProgressBar({ pct, passed }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={S.progressBar()}>
        <span style={S.progressFill(pct, passed)} />
      </span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: passed ? '#059669' : '#ef4444' }}>
        {Number(pct).toFixed(1)}%
      </span>
    </span>
  );
}

function AttemptsPanel({ attempts }) {
  if (!attempts?.length)
    return <div style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>No attempts.</div>;
  return (
    <div style={{ padding: '0 18px 16px 52px' }}>
      <table style={S.attemptTable}>
        <thead>
          <tr>
            {['Exam', 'Score', 'Percentage', 'Rank', 'Status', 'Date'].map((h) => (
              <th key={h} style={S.attemptTh}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map((a, i) => (
            <tr key={i}>
              <td style={S.attemptTd}>{a.exam_title}</td>
              <td style={S.attemptTd}>
                <strong>{a.score}</strong>
              </td>
              <td style={S.attemptTd}>
                <ProgressBar pct={Number(a.percentage)} passed={a.passed} />
              </td>
              <td style={S.attemptTd}>{a.rank ? `#${a.rank}` : '—'}</td>
              <td style={S.attemptTd}>
                <span style={S.badge(a.passed)}>{a.passed ? '✓ Pass' : '✗ Fail'}</span>
              </td>
              <td style={S.attemptTd}>
                {a.submitted_at
                  ? new Date(a.submitted_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminResults() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/admin/results');
      setCandidates(res.data.data.candidates || []);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const filtered = candidates.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAttempts = candidates.reduce((s, c) => s + Number(c.total_attempts), 0);
  const totalPassed = candidates.reduce((s, c) => s + Number(c.passed), 0);
  const totalFailed = candidates.reduce((s, c) => s + Number(c.failed), 0);
  const avgPct = candidates.length
    ? (
        candidates.reduce((s, c) => s + Number(c.avg_percentage || 0), 0) / candidates.length
      ).toFixed(1)
    : 0;

  return (
    <div style={S.page}>
      <div style={S.topRow}>
        <div>
          <div style={S.title}>Results Overview</div>
          <div style={S.subtitle}>
            {candidates.length} candidates · {totalAttempts} total attempts
          </div>
        </div>
        <input
          style={S.searchBar}
          placeholder="🔍 Search candidate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={S.statsRow}>
        <StatBox icon="👥" label="Total Candidates" value={candidates.length} color="#3b82f6" />
        <StatBox icon="📝" label="Total Attempts" value={totalAttempts} color="#8b5cf6" />
        <StatBox icon="✅" label="Total Passed" value={totalPassed} color="#10b981" />
        <StatBox icon="📈" label="Platform Avg" value={`${avgPct}%`} color="#f59e0b" />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontSize: '14px' }}>Loading results...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.table, ...S.emptyState }}>
          <div style={S.emptyIcon}>📊</div>
          <div style={S.emptyText}>No results found.</div>
        </div>
      ) : (
        <div style={S.table}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={S.thead}>
              <tr>
                {['Candidate', 'Attempts', 'Passed', 'Failed', 'Avg Score', 'Best Score', ''].map(
                  (h) => (
                    <th key={h} style={S.th}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <>
                  <tr
                    key={c.candidate_id}
                    style={S.tr(hoveredRow === c.candidate_id)}
                    onMouseEnter={() => setHoveredRow(c.candidate_id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => setExpanded(expanded === c.candidate_id ? null : c.candidate_id)}
                  >
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
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
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                            {c.full_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <strong>{c.total_attempts}</strong>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{c.passed}</span>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>
                        {Number(c.total_attempts) - Number(c.passed)}
                      </span>
                    </td>
                    <td style={S.td}>
                      <ProgressBar pct={c.avg_percentage} passed={c.avg_percentage >= 35} />
                    </td>
                    <td style={S.td}>
                      <strong style={{ color: '#0f172a' }}>
                        {Number(c.best_score).toFixed(1)}
                      </strong>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {expanded === c.candidate_id ? '▲ Hide' : '▼ Details'}
                      </span>
                    </td>
                  </tr>
                  {expanded === c.candidate_id && (
                    <tr key={`${c.candidate_id}-exp`} style={S.expandRow}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <AttemptsPanel attempts={c.attempts} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
