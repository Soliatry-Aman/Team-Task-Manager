import Badge from "./Badge";
import { useAuth } from "../context/AuthContext";

const TaskCard = ({ task, isAdmin = false, onStatusUpdate, onDelete }) => {
  const { user } = useAuth();
  const canUpdate = isAdmin || task.assignedTo?._id === user?.id;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "Done";

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .task-card {
          transition: box-shadow 200ms ease, border-color 200ms ease;
        }
        .task-card:hover {
          box-shadow: 0 6px 20px rgba(15,23,42,0.09) !important;
          border-color: rgba(15,23,42,0.14) !important;
        }
        .task-status-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 28px !important;
          cursor: pointer;
        }
        .task-delete-btn:hover {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
          border-color: rgba(239,68,68,0.2) !important;
        }
      `}</style>

      <div className="task-card" style={styles.card}>
        {/* Overdue stripe */}
        {isOverdue && <div style={styles.overdueStripe} />}

        <div style={styles.inner}>
          {/* Left */}
          <div style={styles.left}>
            {/* Title row */}
            <div style={styles.titleRow}>
              <h3 style={styles.title}>{task.title}</h3>
              {isOverdue && (
                <span style={styles.overdueTag}>Overdue</span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p style={styles.description}>{task.description}</p>
            )}

            {/* Meta pills */}
            <div style={styles.metaRow}>
              {/* Assigned */}
              <div style={styles.metaPill}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 11c0-2.485 2.015-4.5 4.5-4.5S10.5 8.515 10.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {task.assignedTo?.name || "Unassigned"}
              </div>

              {/* Created by */}
              <div style={styles.metaPill}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10V8.5A1.5 1.5 0 013.5 7h5A1.5 1.5 0 0110 8.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="6" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {task.createdBy?.name || "Unknown"}
              </div>

              {/* Due date */}
              <div style={{
                ...styles.metaPill,
                ...(isOverdue ? styles.metaPillOverdue : {}),
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="2.5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 1.5v2M8 1.5v2M1.5 5.5h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {dueDateStr}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={styles.right}>
            <Badge text={task.priority} type="priority" />

            {canUpdate ? (
              <select
                value={task.status}
                onChange={(e) => onStatusUpdate(task._id, e.target.value)}
                style={styles.statusSelect}
                className="task-status-select"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            ) : (
              <Badge text={task.status} type="status" />
            )}

            {/* Strictly admin-only — double-guarded */}
            {isAdmin === true && typeof onDelete === "function" && (
              <button
                onClick={() => onDelete(task._id)}
                style={styles.deleteBtn}
                className="task-delete-btn"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.75 7a.5.5 0 01-.5.5H3.75a.5.5 0 01-.5-.5L2.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete Task
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    overflow: "hidden",
    position: "relative",
  },
  overdueStripe: {
    height: "3px",
    backgroundColor: "#ef4444",
    width: "100%",
  },
  inner: {
    padding: "18px 20px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: 0,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
  },
  overdueTag: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "99px",
    padding: "2px 8px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  description: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.6,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "2px",
  },
  metaPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#64748b",
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.07)",
    borderRadius: "99px",
    padding: "3px 10px",
  },
  metaPillOverdue: {
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    borderColor: "rgba(239,68,68,0.15)",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    flexShrink: 0,
    minWidth: "130px",
  },
  statusSelect: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.1)",
    borderRadius: "8px",
    padding: "6px 10px",
    outline: "none",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    width: "100%",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    backgroundColor: "transparent",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "8px",
    padding: "5px 10px",
    cursor: "pointer",
    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    width: "100%",
    justifyContent: "center",
  },
};

export default TaskCard;