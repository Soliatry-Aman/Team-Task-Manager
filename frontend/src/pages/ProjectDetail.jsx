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
    title: "", description: "", dueDate: "", priority: "Medium", assignedTo: "",
  });
  const [loading, setLoading] = useState(true);
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
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  const showAlert = (type, msg) => {
    if (type === "error") setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  };

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

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/projects/${id}`);
      showAlert("success", "Project deleted successfully");
      setTimeout(() => navigate("/projects"), 1500);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading) return <Loader />;
  if (!project) return (
    <div style={styles.errorBox}><span>⚠</span> Project not found</div>
  );

  const TABS = [
    { key: "tasks", label: "Tasks", count: tasks.length },
    { key: "members", label: "Members", count: project.members?.length || 0 },
    ...(isAdmin ? [{ key: "create", label: "Create Task", count: null }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pd-wrap { animation: fadeUp 0.35s ease both; }
        .pd-tab:hover { color: #0f172a !important; }
        .form-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
        }
        .pd-submit:hover:not(:disabled) {
          background-color: #2563eb !important;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3) !important;
        }
        .remove-btn:hover {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
          border-color: rgba(239,68,68,0.2) !important;
        }
        .add-btn:hover {
          background-color: #2563eb !important;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3) !important;
        }
        .delete-project-btn:hover {
          background-color: #fee2e2 !important;
          border-color: #fca5a5 !important;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15) !important;
        }
        .delete-project-btn:active {
          transform: scale(0.97);
        }
      `}</style>

      <div className="pd-wrap" style={styles.wrapper}>
        {/* ── Project Header ── */}
        <div style={styles.projectHeaderContainer}>
          <div style={styles.projectHeader}>
            <div style={styles.projectAvatar}>
              {project.title?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={styles.heading}>{project.title}</h1>
              <p style={styles.subheading}>{project.description}</p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={handleDeleteProject}
              className="delete-project-btn"
              style={styles.deleteProjectBtn}
              title="Delete this project"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M6.5 7v4M9.5 7v4M3 4l.5 9.5c0 .5.5 1 1 1h7c.5 0 1-.5 1-1L13 4M5 4V3c0-.5.5-1 1-1h4c.5 0 1 .5 1 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete Project
            </button>
          )}
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div style={styles.errorBox}><span>⚠</span> {error}</div>
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
              className="pd-tab"
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.key ? styles.tabActive : {}),
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  ...styles.tabCount,
                  ...(activeTab === tab.key ? styles.tabCountActive : {}),
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Tasks ── */}
        {activeTab === "tasks" && (
          <div style={styles.section}>
            {tasks.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h10M4 18h7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={styles.emptyTitle}>No tasks yet</p>
                <p style={styles.emptySub}>
                  {isAdmin ? "Use the \"Create Task\" tab to add your first task." : "Tasks will appear here once created."}
                </p>
              </div>
            ) : (
              <div style={styles.taskList}>
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Members ── */}
        {activeTab === "members" && (
          <div style={styles.section}>
            {/* Add member form (admin only) */}
            {isAdmin && (
              <form onSubmit={handleAddMember} style={styles.addMemberForm}>
                <div style={styles.addMemberInputWrap}>
                  <svg style={styles.addMemberIcon} viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M2.5 6.5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  </svg>
                  <input
                    type="email"
                    placeholder="Enter member email to add"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    style={styles.addMemberInput}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="add-btn" style={styles.addBtn}>
                  Add Member
                </button>
              </form>
            )}

            {/* Members list */}
            <div style={styles.memberList}>
              {project.members.map((member) => {
                const isAdminMember = member._id === project.admin._id;
                return (
                  <div key={member._id} style={styles.memberRow}>
                    <div style={styles.memberLeft}>
                      <div style={styles.memberAvatar}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={styles.memberName}>{member.name}</p>
                        <p style={styles.memberEmail}>{member.email}</p>
                      </div>
                    </div>
                    <div style={styles.memberRight}>
                      <Badge
                        text={isAdminMember ? "Admin" : "Member"}
                        type="status"
                      />
                      {isAdmin && !isAdminMember && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="remove-btn"
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
          </div>
        )}

        {/* ── Tab: Create Task ── */}
        {activeTab === "create" && isAdmin && (
          <div style={styles.section}>
            <form onSubmit={handleCreateTask} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Task Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Update landing page"
                    value={taskData.title}
                    onChange={handleTaskChange}
                    style={styles.input}
                    className="form-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskData.dueDate}
                    onChange={handleTaskChange}
                    style={styles.input}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the task..."
                  value={taskData.description}
                  onChange={handleTaskChange}
                  rows={3}
                  style={{ ...styles.input, resize: "vertical", lineHeight: 1.6 }}
                  className="form-input"
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    name="priority"
                    value={taskData.priority}
                    onChange={handleTaskChange}
                    style={styles.input}
                    className="form-input"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select
                    name="assignedTo"
                    value={taskData.assignedTo}
                    onChange={handleTaskChange}
                    style={styles.input}
                    className="form-input"
                  >
                    <option value="">Select member</option>
                    {project.members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formFooter}>
                <button
                  type="submit"
                  className="pd-submit"
                  style={styles.submitBtn}
                >
                  Create Task
                </button>
              </div>
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
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  projectHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  projectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
    minWidth: 0,
  },
  projectAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "22px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "-0.02em",
  },
  heading: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: "4px",
  },
  subheading: {
    fontSize: "13px",
    color: "#64748b",
  },
  deleteProjectBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 200ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    flexShrink: 0,
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
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f0fdf4",
    border: "1px solid rgba(34,197,94,0.25)",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#166534",
    fontWeight: 500,
  },
  tabBar: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    paddingBottom: "0",
  },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#94a3b8",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    transition: "color 150ms ease, border-color 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    marginBottom: "-1px",
    letterSpacing: "-0.01em",
  },
  tabActive: {
    color: "#0f172a",
    borderBottomColor: "#2563eb",
  },
  tabCount: {
    fontSize: "10px",
    fontWeight: 700,
    backgroundColor: "rgba(15,23,42,0.07)",
    color: "#94a3b8",
    borderRadius: "99px",
    padding: "1px 6px",
  },
  tabCountActive: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
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
    width: "50px",
    height: "50px",
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
  addMemberForm: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  addMemberInputWrap: {
    flex: 1,
    position: "relative",
    minWidth: "200px",
  },
  addMemberIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  addMemberInput: {
    width: "100%",
    padding: "10px 14px 10px 36px",
    fontSize: "13px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.1)",
    borderRadius: "9px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  },
  addBtn: {
    padding: "10px 18px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, box-shadow 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    whiteSpace: "nowrap",
  },
  memberList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  memberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "12px",
    gap: "12px",
  },
  memberLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  memberAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    fontSize: "13px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memberName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  memberEmail: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "1px",
  },
  memberRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  removeBtn: {
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    backgroundColor: "transparent",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "7px",
    cursor: "pointer",
    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  form: {
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
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
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "13px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.1)",
    borderRadius: "9px",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    boxSizing: "border-box",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  submitBtn: {
    padding: "10px 24px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, box-shadow 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

export default ProjectDetail;