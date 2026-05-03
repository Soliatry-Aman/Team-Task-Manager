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
        setError("");

        // Get all projects safely
        const projectsRes = await axiosInstance.get("/projects");
        const projects = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : [];

        // Fetch all project tasks in parallel (FASTER + BETTER)
        const taskResponses = await Promise.all(
          projects.map((project) =>
            axiosInstance
              .get(`/tasks/${project._id}`)
              .catch(() => ({ data: [] }))
          )
        );

        // Flatten all tasks
        const allTasks = taskResponses.flatMap((res) =>
          Array.isArray(res.data) ? res.data : []
        );

        const now = new Date();

        // Calculate stats safely
        const totalTasks = allTasks.length;

        const todoTasks = allTasks.filter(
          (task) => task?.status === "To Do"
        ).length;

        const inProgressTasks = allTasks.filter(
          (task) => task?.status === "In Progress"
        ).length;

        const doneTasks = allTasks.filter(
          (task) => task?.status === "Done"
        ).length;

        const overdueTasks = allTasks.filter((task) => {
          if (!task?.dueDate || task?.status === "Done") return false;

          const dueDate = new Date(task.dueDate);

          return !isNaN(dueDate) && dueDate < now;
        }).length;

        setStats({
          totalTasks,
          todoTasks,
          inProgressTasks,
          doneTasks,
          overdueTasks,
        });
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
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  // Completion %
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  // Loading state
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dash-wrapper {
          animation: fadeUp 0.4s ease both;
        }

        @media (max-width: 768px) {
          .dash-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div className="dash-wrapper" style={styles.wrapper}>
        {/* Header */}
        <div className="dash-header" style={styles.header}>
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

          {/* Completion Ring */}
          <div style={styles.completionBadge}>
            <svg width="56" height="56" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgba(15,23,42,0.07)"
                strokeWidth="3"
              />

              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={
                  2 * Math.PI * 15 * (1 - completionRate / 100)
                }
                transform="rotate(-90 18 18)"
                style={{
                  transition: "stroke-dashoffset 0.6s ease",
                }}
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
        <div style={styles.grid}>
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
  },

  sectionLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.07)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
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
};

export default Dashboard;