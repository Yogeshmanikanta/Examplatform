import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { S, FONT } from '../../constants/Adminres';

// ── unchanged sub-components ──────────────────────────────────────────────────

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

// ── filter popover ────────────────────────────────────────────────────────────

function FilterPopover({ type, draft, setDraft, onApply, onReset, sortField, pos }) {
  const asc = draft.sortBy === sortField && draft.order === 'asc';
  const desc = draft.sortBy === sortField && draft.order === 'desc';

  const setSortOnly = (order) => setDraft((p) => ({ ...p, sortBy: sortField, order }));

  return (
    <div
      style={{ ...S.popover, top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Sort */}
      <div style={S.popoverLabel}>Sort</div>
      <button style={S.sortBtn(asc)} onClick={() => setSortOnly('asc')}>
        {type === 'text' ? '🔤 A → Z' : '↑ Low → High'}
      </button>
      <button style={S.sortBtn(desc)} onClick={() => setSortOnly('desc')}>
        {type === 'text' ? '🔤 Z → A' : '↓ High → Low'}
      </button>

      <div style={S.popoverDivider} />

      {/* Filter inputs */}
      {type === 'text' && (
        <>
          <div style={S.popoverLabel}>Search</div>
          <input
            style={S.popoverInput}
            placeholder="Name or email..."
            value={draft.candidateSearch}
            onChange={(e) => setDraft((p) => ({ ...p, candidateSearch: e.target.value }))}
            autoFocus
          />
        </>
      )}

      {type === 'range' && (
        <>
          <div style={S.popoverLabel}>Range</div>
          <div style={S.popoverRow}>
            <div style={S.popoverHalf}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Min</div>
              <input
                style={S.popoverInput}
                type="number"
                placeholder="0"
                value={draft[`min_${sortField}`] ?? ''}
                onChange={(e) => setDraft((p) => ({ ...p, [`min_${sortField}`]: e.target.value }))}
              />
            </div>
            <div style={S.popoverHalf}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Max</div>
              <input
                style={S.popoverInput}
                type="number"
                placeholder="∞"
                value={draft[`max_${sortField}`] ?? ''}
                onChange={(e) => setDraft((p) => ({ ...p, [`max_${sortField}`]: e.target.value }))}
              />
            </div>
          </div>
        </>
      )}

      <div style={S.popoverActions}>
        <button style={S.applyBtn} onClick={onApply}>
          Apply
        </button>
        <button style={S.resetBtn} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

// ── column header with filter ─────────────────────────────────────────────────

function FilterHeader({ label, type, sortField, filters, draft, setDraft, onApply, onReset }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef();
  const btnRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    // calculate position from button
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
    setOpen((p) => !p);
  };
  const isActive = (() => {
    if (type === 'text') return !!filters.candidateSearch;
    return (
      filters[`min_${sortField}`] !== undefined ||
      filters[`max_${sortField}`] !== undefined ||
      filters.sortBy === sortField
    );
  })();

  return (
    <th style={S.th} ref={ref}>
      <div style={S.thWrap}>
        {label}
        <button
          ref={btnRef}
          style={{ ...S.filterBtn, ...(isActive ? S.filterBtnActive : {}) }}
          onClick={handleOpen}
          title="Filter / Sort"
        >
          {isActive ? '▼' : '⬍'}
        </button>
        {isActive && <span style={S.activeDot} />}
        {open && (
          <FilterPopover
            type={type}
            draft={draft}
            setDraft={setDraft}
            sortField={sortField}
            onApply={() => {
              onApply();
              setOpen(false);
            }}
            onReset={() => {
              onReset(sortField, type);
              setOpen(false);
            }}
            pos={pos}
          />
        )}
      </div>
    </th>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const EMPTY_FILTERS = {
  candidateSearch: '',
  sortBy: 'attempts',
  order: 'desc',
};

export default function AdminResults() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // applied filters (trigger fetch)
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // draft filters (edited inside popover before Apply)
  const [draft, setDraft] = useState(EMPTY_FILTERS);

  const debounceRef = useRef();

  const buildParams = (f, pg) => {
    const p = { page: pg, limit };
    if (f.candidateSearch) p.candidateSearch = f.candidateSearch;
    if (f.sortBy) p.sortBy = f.sortBy;
    if (f.order) p.order = f.order;

    ['attempts', 'passed', 'failed', 'avg_score', 'best_score'].forEach((field) => {
      const apiMin = {
        attempts: 'minAttempts',
        passed: 'minPassed',
        failed: 'minFailed',
        avg_score: 'minAvgScore',
        best_score: 'minBestScore',
      }[field];
      const apiMax = {
        attempts: 'maxAttempts',
        passed: 'maxPassed',
        failed: 'maxFailed',
        avg_score: 'maxAvgScore',
        best_score: 'maxBestScore',
      }[field];
      if (f[`min_${field}`] !== undefined && f[`min_${field}`] !== '')
        p[apiMin] = f[`min_${field}`];
      if (f[`max_${field}`] !== undefined && f[`max_${field}`] !== '')
        p[apiMax] = f[`max_${field}`];
    });
    return p;
  };

  const fetchResults = useCallback(async (f, pg) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/results', { params: buildParams(f, pg) });
      setCandidates(res.data.data.candidates || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(filters, page);
  }, [filters, page]);

  const applyFilters = () => {
    setFilters({ ...draft });
    setPage(1);
  };

  const resetField = (sortField, type) => {
    const next = { ...draft };
    if (type === 'text') {
      next.candidateSearch = '';
    } else {
      delete next[`min_${sortField}`];
      delete next[`max_${sortField}`];
    }
    if (next.sortBy === sortField) {
      next.sortBy = 'attempts';
      next.order = 'desc';
    }
    setDraft(next);
    setFilters(next);
    setPage(1);
  };

  const totalAttempts = candidates.reduce((s, c) => s + Number(c.total_attempts), 0);
  const totalPassed = candidates.reduce((s, c) => s + Number(c.passed), 0);
  const avgPct = candidates.length
    ? (
        candidates.reduce((s, c) => s + Number(c.avg_percentage || 0), 0) / candidates.length
      ).toFixed(1)
    : 0;

  const totalPages = Math.ceil(total / limit);

  const COLUMNS = [
    { label: 'Candidate', type: 'text', sortField: 'candidate_name' },
    { label: 'Attempts', type: 'range', sortField: 'attempts' },
    { label: 'Passed', type: 'range', sortField: 'passed' },
    { label: 'Failed', type: 'range', sortField: 'failed' },
    { label: 'Avg Score', type: 'range', sortField: 'avg_score' },
    { label: 'Best Score', type: 'range', sortField: 'best_score' },
  ];

  return (
    <div style={S.page}>
      <div style={S.topRow}>
        <div>
          <div style={S.title}>Results Overview</div>
          <div style={S.subtitle}>{total} candidates</div>
        </div>
      </div>

      <div style={S.statsRow}>
        <StatBox icon="👥" label="Total Candidates" value={total} color="#3b82f6" />
        <StatBox icon="📝" label="Total Attempts" value={totalAttempts} color="#8b5cf6" />
        <StatBox icon="✅" label="Total Passed" value={totalPassed} color="#10b981" />
        <StatBox icon="📈" label="Page Avg" value={`${avgPct}%`} color="#f59e0b" />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontSize: '14px' }}>Loading results...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ ...S.table, ...S.emptyState }}>
          <div style={S.emptyIcon}>📊</div>
          <div style={S.emptyText}>No results found.</div>
        </div>
      ) : (
        <>
          <div style={S.table}>
            <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
              <thead style={S.thead}>
                <tr>
                  {COLUMNS.map((col) => (
                    <FilterHeader
                      key={col.sortField}
                      {...col}
                      filters={filters}
                      draft={draft}
                      setDraft={setDraft}
                      onApply={applyFilters}
                      onReset={resetField}
                    />
                  ))}
                  <th style={S.th} />
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <>
                    <tr
                      key={c.candidate_id}
                      style={S.tr(hoveredRow === c.candidate_id)}
                      onMouseEnter={() => setHoveredRow(c.candidate_id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() =>
                        setExpanded(expanded === c.candidate_id ? null : c.candidate_id)
                      }
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ ...S.resetBtn, width: '80px', opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ ...S.resetBtn, width: '80px', opacity: page === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
