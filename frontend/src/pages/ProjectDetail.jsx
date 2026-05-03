import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Badge from "../components/Badge";
import TaskCard from "../components/TaskCard";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedTo: "",
  });

  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  const isAdmin = project?.admin?._id === user?.id;

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      const [projectRes, tasksRes] = await Promise.all([
        axiosInstance.get(`/projects/${id}`),
        axiosInstance.get(`/tasks/${id}`),
      ]);

      setProject({
        ...projectRes.data,
        members: projectRes.data.members || [],
      });

      setTasks(tasksRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const showAlert = (type, msg) => {
    if (type === "error") {
      setError(msg);
    } else {
      setSuccess(msg);
    }

    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3500);
  };

  // ── Delete Project ──────────────────────────────────────────────
  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/projects/${id}`);
      navigate("/projects", { replace: true });
    } catch (err) {
      setDeleting(false);
      setDeleteConfirm(false);
      showAlert("error", err.response?.data?.message || "Failed to delete project");
    }
  };

  // ── Members ─────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail) return showAlert("error", "Please enter member email");

    try {
      const userRes = await axiosInstance.get(`/users/search?email=${memberEmail}`);
      await axiosInstance.put(`/projects/${id}/add-member`, { userId: userRes.data._id });
      showAlert("success", "Member added successfully");
      setMemberEmail("");
      fetchProjectData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axiosInstance.put(`/projects/${id}/remove-member/${memberId}`);
      fetchProjectData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to remove member");
    }
  };

  // ── Tasks ────────────────────────────────────────────────────────
  const handleTaskChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/tasks", { ...taskData, projectId: id });
      showAlert("success", "Task created successfully");
      setTaskData({ title: "", description: "", dueDate: "", priority: "Medium", assignedTo: "" });
      fetchProjectData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status });
      fetchProjectData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      fetchProjectData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to delete task");
    }
  };

  if (loading) return <Loader />;

  if (!project) {
    return (
      <div style={styles.errorBox}>
        <span>⚠</span> Project not found
      </div>
    );
  }

  const TABS = [
    { key: "tasks", label: "Tasks", count: tasks.length },
    { key: "members", label: "Members", count: project.members?.length || 0 },
    ...(isAdmin ? [{ key: "create", label: "Create Task", count: null }] : []),
  ];

  return (
    <div style={styles.wrapper}>
      {/* ── Header ── */}
      <div style={styles.projectHeader}>
        <div style={styles.projectAvatar}>
          {project.title?.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={styles.heading}>{project.title}</h1>
          <p style={styles.subheading}>{project.description}</p>
        </div>

        {/* Delete button — admin only */}
        {isAdmin && (
          <div>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={styles.deleteBtn}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3.5 3.5l.7 7.5a1 1 0 001 .9h3.6a1 1 0 001-.9l.7-7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete Project
              </button>
            ) : (
              <div style={styles.confirmRow}>
                <span style={styles.confirmText}>Are you sure?</span>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  style={styles.confirmYes}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  style={styles.confirmNo}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div style={styles.errorBox}>
          <span>⚠</span> {error}
        </div>
      )}
      {success && (
        <div style={styles.successBox}>
          <span>✓</span> {success}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <span style={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tasks Tab ── */}
      {activeTab === "tasks" && (
        <div style={styles.section}>
          {tasks.length === 0 ? (
            <p style={styles.emptyText}>No tasks yet. {isAdmin && "Create one in the \"Create Task\" tab."}</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                isAdmin={isAdmin}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      )}

      {/* ── Members Tab ── */}
      {activeTab === "members" && (
        <div style={styles.section}>
          {isAdmin && (
            <form onSubmit={handleAddMember} style={styles.addMemberForm}>
              <input
                type="email"
                placeholder="Enter member email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.addBtn}>
                Add Member
              </button>
            </form>
          )}

          {(project.members || []).map((member) => {
            const isAdminMember = member._id === project.admin?._id;

            return (
              <div key={member._id} style={styles.memberRow}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{member.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{member.email}</p>
                </div>

                <div style={styles.memberRight}>
                  <Badge text={isAdminMember ? "Admin" : "Member"} type="status" />
                  {isAdmin && !isAdminMember && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Task Tab ── */}
      {activeTab === "create" && isAdmin && (
        <div style={styles.section}>
          <form onSubmit={handleCreateTask} style={styles.form}>
            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={taskData.title}
              onChange={handleTaskChange}
              style={styles.input}
              required
            />

            <textarea
              name="description"
              placeholder="Task Description"
              value={taskData.description}
              onChange={handleTaskChange}
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
            />

            <input
              type="date"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleTaskChange}
              style={styles.input}
            />

            <select
              name="priority"
              value={taskData.priority}
              onChange={handleTaskChange}
              style={styles.input}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select
              name="assignedTo"
              value={taskData.assignedTo}
              onChange={handleTaskChange}
              style={styles.input}
            >
              <option value="">Select Member</option>
              {(project.members || []).map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>

            <button type="submit" style={styles.submitBtn}>
              Create Task
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  projectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  projectAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "20px",
    color: "#2563eb",
    flexShrink: 0,
  },

  heading: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    margin: 0,
  },

  subheading: {
    color: "#64748b",
    fontSize: "14px",
    margin: "4px 0 0",
  },

  // ── Delete project controls ──
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background-color 150ms ease",
    whiteSpace: "nowrap",
  },

  confirmRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  confirmText: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#dc2626",
  },

  confirmYes: {
    padding: "7px 14px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  confirmNo: {
    padding: "7px 14px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  errorBox: {
    padding: "12px 16px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
  },

  successBox: {
    padding: "12px 16px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
  },

  tabBar: {
    display: "flex",
    gap: "6px",
    borderBottom: "1px solid rgba(15,23,42,0.07)",
    paddingBottom: "0",
  },

  tab: {
    padding: "10px 16px",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    borderRadius: "8px 8px 0 0",
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
    transition: "background-color 150ms ease, color 150ms ease",
  },

  tabActive: {
    background: "#0f172a",
    color: "#fff",
  },

  tabCount: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "1px 6px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: 700,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  emptyText: {
    fontSize: "14px",
    color: "#94a3b8",
    padding: "24px 0",
  },

  addMemberForm: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },

  addBtn: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },

  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#fff",
  },

  memberRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  removeBtn: {
    padding: "6px 12px",
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "480px",
  },

  submitBtn: {
    padding: "12px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

export default ProjectDetail;