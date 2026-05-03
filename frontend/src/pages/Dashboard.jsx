import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    overdueTasks: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const projectsRes = await axiosInstance.get("/projects");
        const projects = projectsRes.data || [];

        let allTasks = [];
        for (const project of projects) {
          const tasksRes = await axiosInstance.get(`/tasks/${project._id}`);
          allTasks = [...allTasks, ...tasksRes.data];
        }

        const now = new Date();
        setStats({
          totalTasks: allTasks.length,
          todoTasks: allTasks.filter((t) => t.status === "To Do").length,
          inProgressTasks: allTasks.filter((t) => t.status === "In Progress").length,
          doneTasks: allTasks.filter((t) => t.status === "Done").length,
          overdueTasks: allTasks.filter(
            (t) => new Date(t.dueDate) < now && t.status !== "Done"
          ).length,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  if (loading) return <Loader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-wrapper { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="dash-wrapper" style={styles.wrapper}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>
              {greeting},{" "}
              <span style={styles.greetingName}>
                {user?.name?.split(" ")[0] || "there"} 👋
              </span>
            </p>
            <h1 style={styles.heading}>Dashboard</h1>
            <p style={styles.subheading}>
              Here's what's happening across your workspace today.
            </p>
          </div>

          {/* Completion badge */}
          <div style={styles.completionBadge}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(15,23,42,0.07)" strokeWidth="3"/>
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                strokeDashoffset={`${2 * Math.PI * 15 * (1 - completionRate / 100)}`}
                transform="rotate(-90 18 18)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div style={styles.completionText}>
              <p style={styles.completionValue}>{completionRate}%</p>
              <p style={styles.completionLabel}>Done</p>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>!</span>
            {error}
          </div>
        )}

        {/* ── Section label ── */}
        <div style={styles.sectionRow}>
          <p style={styles.sectionLabel}>Overview</p>
          <div style={styles.sectionLine} />
        </div>

        {/* ── Stat Cards ── */}
        <div style={styles.grid}>
          <StatCard title="Total Tasks"   value={stats.totalTasks}      />
          <StatCard title="To Do"         value={stats.todoTasks}        />
          <StatCard title="In Progress"   value={stats.inProgressTasks}  />
          <StatCard title="Done"          value={stats.doneTasks}        />
          <StatCard title="Overdue"       value={stats.overdueTasks}     />
        </div>

        {/* ── Quick summary banner ── */}
        {stats.overdueTasks > 0 && (
          <div style={styles.warningBanner}>
            <span style={styles.warningIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="#92400e" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6v3M8 11v.5" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <p style={styles.warningText}>
              You have <strong>{stats.overdueTasks}</strong> overdue{" "}
              {stats.overdueTasks === 1 ? "task" : "tasks"} that need attention.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  wrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  greeting: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 500,
    marginBottom: "6px",
  },
  greetingName: {
    color: "#475569",
    fontWeight: 600,
  },
  heading: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    marginBottom: "6px",
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 400,
  },

  /* Completion ring */
  completionBadge: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  completionText: {
    position: "absolute",
    textAlign: "center",
  },
  completionValue: {
    fontSize: "10px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  completionLabel: {
    fontSize: "8px",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  /* Error */
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#dc2626",
    fontWeight: 500,
  },
  errorIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#dc2626",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0,
  },

  /* Section label */
  sectionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  sectionLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.07)",
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
  },

  /* Warning banner */
  warningBanner: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#fffbeb",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: "12px",
    padding: "14px 18px",
  },
  warningIcon: {
    flexShrink: 0,
    display: "flex",
  },
  warningText: {
    fontSize: "13px",
    color: "#92400e",
    fontWeight: 500,
    lineHeight: 1.5,
  },
};

export default Dashboard;