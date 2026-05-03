import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import TaskCard from "../components/TaskCard";

const FILTERS = ["All", "To Do", "In Progress", "Done", "Overdue"];

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const projectsRes = await axiosInstance.get("/projects");
      const projects = projectsRes.data || [];

      let allTasks = [];
      for (const project of projects) {
        const tasksRes = await axiosInstance.get(`/tasks/${project._id}`);
        const projectTasks = tasksRes.data.map((task) => ({
          ...task,
          projectTitle: project.title,
          isAdmin: project.admin?._id === user?.id,
        }));
        allTasks = [...allTasks, ...projectTasks];
      }
      setTasks(allTasks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  const now = new Date();
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Overdue")
      return new Date(task.dueDate) < now && task.status !== "Done";
    return task.status === activeFilter;
  });

  // Group by project
  const grouped = filteredTasks.reduce((acc, task) => {
    const key = task.projectTitle || "Unknown Project";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  if (loading) return <Loader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tasks-wrap { animation: fadeUp 0.35s ease both; }
        .filter-pill:hover { background-color: #f1f5f9 !important; }
      `}</style>

      <div className="tasks-wrap" style={styles.wrapper}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Tasks</h1>
            <p style={styles.subheading}>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} across all projects
            </p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Filter Pills ── */}
        <div style={styles.filters}>
          {FILTERS.map((f) => {
            const count =
              f === "All" ? tasks.length :
              f === "Overdue"
                ? tasks.filter((t) => new Date(t.dueDate) < now && t.status !== "Done").length
                : tasks.filter((t) => t.status === f).length;

            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                className="filter-pill"
                onClick={() => setActiveFilter(f)}
                style={{
                  ...styles.filterPill,
                  ...(isActive ? styles.filterPillActive : {}),
                }}
              >
                {f}
                <span style={{
                  ...styles.filterCount,
                  ...(isActive ? styles.filterCountActive : {}),
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Tasks ── */}
        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M3 6.5h20M3 13h12M3 19.5h8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={styles.emptyTitle}>No tasks found</p>
            <p style={styles.emptySub}>
              {activeFilter === "All"
                ? "Tasks assigned to you will appear here."
                : `No "${activeFilter}" tasks right now.`}
            </p>
          </div>
        ) : (
          <div style={styles.groupList}>
            {Object.entries(grouped).map(([projectTitle, projectTasks]) => (
              <div key={projectTitle} style={styles.group}>
                {/* Project group header */}
                <div style={styles.groupHeader}>
                  <div style={styles.groupDot} />
                  <p style={styles.groupTitle}>{projectTitle}</p>
                  <span style={styles.groupCount}>{projectTasks.length}</span>
                  <div style={styles.groupLine} />
                </div>

                {/* Task cards */}
                <div style={styles.taskList}>
                  {projectTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isAdmin={task.isAdmin}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            ))}
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
    gap: "24px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  heading: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: "4px",
  },
  subheading: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 500,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#dc2626",
    fontWeight: 500,
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  filterPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.09)",
    cursor: "pointer",
    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: "-0.01em",
  },
  filterPillActive: {
    backgroundColor: "#0f172a",
    color: "#fff",
    borderColor: "#0f172a",
  },
  filterCount: {
    fontSize: "10px",
    fontWeight: 700,
    backgroundColor: "rgba(15,23,42,0.07)",
    color: "#64748b",
    borderRadius: "99px",
    padding: "1px 6px",
  },
  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    backgroundColor: "#fff",
    border: "1px dashed rgba(15,23,42,0.12)",
    borderRadius: "16px",
    textAlign: "center",
    gap: "8px",
  },
  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  emptySub: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  groupList: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  groupDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    flexShrink: 0,
  },
  groupTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#374151",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
  groupCount: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#94a3b8",
    backgroundColor: "#f1f5f9",
    borderRadius: "99px",
    padding: "1px 7px",
  },
  groupLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.07)",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
};

export default Tasks;