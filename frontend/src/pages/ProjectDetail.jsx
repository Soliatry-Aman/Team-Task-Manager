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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Delete Project ────────────────────────────────────────────
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

  // ── Members ──────────────────────────────────────────────────
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

  // ── Tasks ─────────────────────────────────────────────────────
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @media (max-width: 767px) {
          .proj-header {
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          .proj-title-group {
            flex: 1;
            min-width: 0;
          }
          .proj-delete-row {
            width: 100% !important;
            order: 3 !important;
          }
          .proj-heading {
            font-size: 20px !important;
          }
          .add-member-form {
            flex-direction: column !important;
          }
          .add-member-form input {
            width: 100% !important;
          }
          .add-member-form button {
            width: 100% !important;
          }
          .create-task-form {
            max-width: 100% !important;
          }
          .confirm-row {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* ── Header ── */}
        <div className="proj-header" style={styles.projectHeader}>
          <div style={styles.projectAvatar}>
            {project.title?.charAt(0).toUpperCase()}
          </div>

          <div className="proj-title-group" style={{ flex: 1, minWidth: 0 }}>
            <h1 className="proj-heading" style={styles.heading}>{project.title}</h1>
            <p style={styles.subheading}>{project.description}</p>
          </div>

          {/* Delete button — admin only */}
          {isAdmin && (
            <div className="proj-delete-row">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={styles.deleteBtn}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3.5 3.5l.7 7.5a1 1 0 001 .9h3.6a1 1 0 001-.9l.7-7.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Delete Project
                </button>
              ) : (
                <div className="confirm-row" style={styles.confirmRow}>
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

        {/* ── Tabs — horizontally scrollable on mobile ── */}
        <div className="scroll-x" style={styles.tabBar}>
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
                <span
                  style={{
                    ...styles.tabCount,
                    ...(activeTab === tab.key ? {} : styles.tabCountInactive),
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tasks Tab ── */}
        {activeTab === "tasks" && (
          <div style={styles.section}>
            {tasks.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4M3 6h18M3 12h12M3 18h8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p style={styles.emptyTitle}>No tasks yet</p>
                <p style={styles.emptySub}>
                  {isAdmin ? 'Create one in the "Create Task" tab.' : "Wait for the admin to assign tasks."}
                </p>
              </div>
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
              <form className="add-member-form" onSubmit={handleAddMember} style={styles.addMemberForm}>
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
                  <div style={styles.memberAvatar}>
                    {member.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.memberName}>{member.name}</p>
                    <p style={styles.memberEmail}>{member.email}</p>
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
            <form className="create-task-form" onSubmit={handleCreateTask} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Task Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Design homepage mockup"
                  value={taskData.title}
                  onChange={handleTaskChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the task..."
                  value={taskData.description}
                  onChange={handleTaskChange}
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskData.dueDate}
                    onChange={handleTaskChange}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label style={styles.label}>Priority</label>
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
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Assign To</label>
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
              </div>

              <button type="submit" style={styles.submitBtn}>
                Create Task
              </button>
            </form>
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
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  projectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  projectAvatar: {
    width: "48px",
    height: "48px",
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
    wordBreak: "break-word",
  },

  subheading: {
    color: "#64748b",
    fontSize: "13px",
    margin: "4px 0 0",
    wordBreak: "break-word",
  },

  deleteBtn: {
    display: "inline-flex",
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
    whiteSpace: "nowrap",
  },

  confirmRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  confirmText: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#dc2626",
    whiteSpace: "nowrap",
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
    whiteSpace: "nowrap",
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
    whiteSpace: "nowrap",
  },

  errorBox: {
    padding: "12px 16px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  successBox: {
    padding: "12px 16px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  // scroll-x class handles the overflow behavior
  tabBar: {
    borderBottom: "1px solid rgba(15,23,42,0.07)",
    paddingBottom: "0",
    gap: "4px",
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
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    flexShrink: 0,
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

  tabCountInactive: {
    backgroundColor: "rgba(15,23,42,0.07)",
    color: "#64748b",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    backgroundColor: "#fff",
    border: "1px dashed rgba(15,23,42,0.12)",
    borderRadius: "14px",
    textAlign: "center",
    gap: "8px",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
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

  addMemberForm: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
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
    color: "#0f172a",
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
    flexShrink: 0,
  },

  memberRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "10px",
    backgroundColor: "#fff",
  },

  memberAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "14px",
    flexShrink: 0,
  },

  memberName: {
    margin: 0,
    fontWeight: 600,
    fontSize: "13px",
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },

  memberEmail: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
    wordBreak: "break-all",
  },

  memberRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexShrink: 0,
  },

  removeBtn: {
    padding: "5px 10px",
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
    gap: "14px",
    maxWidth: "520px",
  },

  formRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "-0.01em",
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
    transition: "background-color 150ms ease",
  },
};

export default ProjectDetail;