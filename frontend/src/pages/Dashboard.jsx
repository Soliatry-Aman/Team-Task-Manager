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
    recentTasks: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // Single API call — no more N+1
        const res = await axiosInstance.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Completion %
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

        @media (max-width: 767px) {
          .dash-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .dash-heading {
            font-size: 22px !important;
          }
          .dash-ring {
            align-self: flex-end;
            margin-top: -36px;
          }
          .dash-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <div className="dash-wrapper" style={styles.wrapper}>
        {/* Header */}
        <div className="dash-header" style={styles.header}>
          <div style={{ flex: 1 }}>
            <p style={styles.greeting}>
              {greeting},{" "}
              <span style={styles.greetingName}>
                {user?.name?.split(" ")[0] || "there"} 👋
              </span>
            </p>

            <h1 className="dash-heading" style={styles.heading}>Dashboard</h1>

            <p style={styles.subheading}>
              Here&apos;s what&apos;s happening across your workspace today.
            </p>
          </div>

          {/* Completion Ring */}
          <div className="dash-ring" style={styles.completionBadge}>
            <svg width="56" height="56" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="rgba(15,23,42,0.07)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15 * (1 - completionRate / 100)}
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

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>!</span>
            {error}
          </div>
        )}

        {/* Section Label */}
        <div style={styles.sectionRow}>
          <p style={styles.sectionLabel}>Overview</p>
          <div style={styles.sectionLine} />
        </div>

        {/* Stats Grid */}
        <div className="dash-grid" style={styles.grid}>
          <StatCard title="Total Tasks" value={stats.totalTasks} />
          <StatCard title="To Do" value={stats.todoTasks} />
          <StatCard title="In Progress" value={stats.inProgressTasks} />
          <StatCard title="Done" value={stats.doneTasks} />
          <StatCard title="Overdue" value={stats.overdueTasks} />
        </div>

        {/* Warning */}
        {stats.overdueTasks > 0 && (
          <div style={styles.warningBanner}>
            <span style={styles.warningIcon}>⚠️</span>
            <p style={styles.warningText}>
              You have <strong>{stats.overdueTasks}</strong>{" "}
              overdue {stats.overdueTasks === 1 ? "task" : "tasks"} that
              need attention.
            </p>
          </div>
        )}

        {/* Recent Tasks */}
        {stats.recentTasks?.length > 0 && (
          <>
            <div style={styles.sectionRow}>
              <p style={styles.sectionLabel}>Recent Activity</p>
              <div style={styles.sectionLine} />
            </div>

            <div style={styles.recentList}>
              {stats.recentTasks.map((task) => (
                <div key={task._id} style={styles.recentItem}>
                  <div style={styles.recentDot(task.status)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.recentTitle}>{task.title}</p>
                    <p style={styles.recentSub}>
                      {task.project?.title || "Unknown Project"}
                      {task.assignedTo?.name
                        ? ` · ${task.assignedTo.name}`
                        : ""}
                    </p>
                  </div>
                  <span style={styles.recentStatus(task.status)}>{task.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const statusColors = {
  "To Do": "#94a3b8",
  "In Progress": "#f59e0b",
  "Done": "#22c55e",
};

const styles = {
  wrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
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
  },

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
    fontSize: "11px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
  },

  completionLabel: {
    fontSize: "8px",
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
  },

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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px",
  },

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
    fontSize: "18px",
    flexShrink: 0,
  },

  warningText: {
    fontSize: "13px",
    color: "#92400e",
    fontWeight: 500,
    lineHeight: 1.5,
  },

  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.07)",
    borderRadius: "10px",
  },

  recentDot: (status) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: statusColors[status] || "#94a3b8",
    flexShrink: 0,
  }),

  recentTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  recentSub: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  recentStatus: (status) => ({
    fontSize: "11px",
    fontWeight: 700,
    color: statusColors[status] || "#94a3b8",
    backgroundColor:
      status === "Done"
        ? "rgba(34,197,94,0.1)"
        : status === "In Progress"
        ? "rgba(245,158,11,0.1)"
        : "rgba(148,163,184,0.1)",
    padding: "3px 8px",
    borderRadius: "99px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  }),
};

export default Dashboard;