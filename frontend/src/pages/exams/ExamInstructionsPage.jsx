import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

export default function ExamInstructionsPage() {
  const { exam_id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    axios.get(`/exams/details/${exam_id}`)
      .then(res => setExam(res.data.data || res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load exam details."))
      .finally(() => setLoading(false));
  }, [exam_id]);

  const handleStartExam = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    navigate(`/exams/exam/${exam_id}/live`);
  };

  if (loading) return <div style={s.centered}>Loading exam details...</div>;
  if (error) return <div style={{ ...s.centered, color: "#ef4444" }}>{error}</div>;
  if (!exam) return null;

  const hasNegative = exam.negative_marking && exam.negative_marks_per_question > 0;
  const durationHrs = Math.floor(exam.duration_minutes / 60);
  const durationMins = exam.duration_minutes % 60;
  const durationLabel = durationHrs > 0
    ? `${durationHrs}h${durationMins > 0 ? ` ${durationMins}m` : ""}`
    : `${durationMins} min`;

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.card}>
          <div style={s.badge}>EXAM</div>
          <h1 style={s.title}>{exam.title}</h1>
          {exam.description && <p style={s.desc}>{exam.description}</p>}
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <StatCard icon="⏱" label="Duration" value={durationLabel} />
          <StatCard icon="📋" label="Questions" value={exam.total_questions ?? "—"} />
          <StatCard icon="🏆" label="Total marks" value={exam.total_marks ?? "—"} />
          <StatCard icon="%" label="Pass mark" value={exam.pass_percentage != null ? `${exam.pass_percentage}%` : "—"} />
        </div>

        {/* Marking scheme */}
        <div style={s.card}>
          <p style={s.sectionTitle}>Marking scheme</p>
          <div style={s.markingRow}>
            <span style={{ ...s.markingLeft, color: "#16a34a" }}>✓ Correct answer</span>
            <span style={{ ...s.markingVal, color: "#16a34a" }}>
              +{exam.marks_per_question ?? 1} mark{exam.marks_per_question !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={s.markingRow}>
            <span style={{ ...s.markingLeft, color: "#dc2626" }}>✗ Wrong answer</span>
            <span style={{ ...s.markingVal, color: hasNegative ? "#dc2626" : "#64748b" }}>
              {hasNegative ? `−${exam.negative_marks_per_question} mark${exam.negative_marks_per_question !== 1 ? "s" : ""}` : "No negative marking"}
            </span>
          </div>
          <div style={{ ...s.markingRow, borderBottom: "none", paddingBottom: 0 }}>
            <span style={{ ...s.markingLeft, color: "#64748b" }}>— Unanswered</span>
            <span style={{ ...s.markingVal, color: "#64748b" }}>0 marks</span>
          </div>
        </div>

        {/* Instructions */}
        <div style={s.card}>
          <p style={s.sectionTitle}>Instructions</p>
          <ul style={s.list}>
            {[
              "Ensure you have a stable internet connection before starting.",
              "The exam will open in fullscreen mode. Do not exit fullscreen.",
              "Switching browser tabs will be recorded and may lead to disqualification.",
              "Your answers are auto-saved every few seconds.",
              "Do not refresh or close the browser during the exam.",
              "Once the timer reaches zero, your exam will be submitted automatically.",
            ].map((text, i) => (
              <li key={i} style={s.listItem}>
                <span style={s.dot} />
                {text}
              </li>
            ))}
          </ul>

          {exam.instructions && (
            <div style={s.examinerNote}>
              <p style={s.examinerLabel}>EXAMINER NOTES</p>
              <p style={s.examinerText}>{exam.instructions}</p>
            </div>
          )}
        </div>

        {/* Agreement + Start */}
        <div style={s.card}>
          <label style={s.checkLabel}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
            />
            I have read all instructions and agree to the exam rules.
          </label>
          <button
            onClick={handleStartExam}
            disabled={!agreed}
            style={{
              ...s.startBtn,
              ...(agreed ? s.startBtnReady : {}),
              opacity: agreed ? 1 : 0.4,
              cursor: agreed ? "pointer" : "not-allowed",
            }}
          >
            ▶ I agree &amp; start exam
          </button>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={stat.card}>
      <span style={stat.icon}>{icon}</span>
      <p style={stat.value}>{value}</p>
      <p style={stat.label}>{label}</p>
    </div>
  );
}

const FONT = "'Plus Jakarta Sans', sans-serif";

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: FONT,
  },
  container: {
    width: "100%",
    maxWidth: 700,
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  centered: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    color: "#64748b",
    fontFamily: FONT,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
  },
  badge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    padding: "3px 10px",
    borderRadius: "6px",
    background: "#eff6ff",
    color: "#3b82f6",
    marginBottom: ".75rem",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.3,
    margin: "0 0 .4rem",
    fontFamily: FONT,
  },
  desc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 1rem",
    fontFamily: FONT,
  },
  markingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
  },
  markingLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: FONT,
  },
  markingVal: {
    fontWeight: 600,
    fontSize: 14,
    fontFamily: FONT,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
    fontFamily: FONT,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#cbd5e1",
    flexShrink: 0,
    marginTop: 7,
  },
  examinerNote: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: ".75rem 1rem",
    marginTop: ".75rem",
  },
  examinerLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.06em",
    marginBottom: 6,
    fontFamily: FONT,
  },
  examinerText: {
    fontSize: 14,
    color: "#0f172a",
    lineHeight: 1.6,
    margin: 0,
    fontFamily: FONT,
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "#0f172a",
    cursor: "pointer",
    userSelect: "none",
    fontFamily: FONT,
  },
  startBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "11px 28px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: FONT,
    marginTop: ".75rem",
    transition: "background .15s",
  },
  startBtnReady: {
    border: "1px solid #bfdbfe",
    color: "#2563eb",
    background: "#eff6ff",
  },
};

const stat = {
  card: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: ".9rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  icon: {
    fontSize: 18,
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  label: {
    fontSize: 12,
    margin: 0,
    color: "#64748b",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};