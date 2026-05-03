import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Badge from "../components/Badge";
import TaskCard from "../components/TaskCard";

const ProjectDetail = () => {
  const { id } = useParams();
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

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail) {
      return showAlert("error", "Please enter member email");
    }

    try {
      const userRes = await axiosInstance.get(
        `/users/search?email=${memberEmail}`
      );

      await axiosInstance.put(`/projects/${id}/add-member`, {
        userId: userRes.data._id,
      });

      showAlert("success", "Member added successfully");
      setMemberEmail("");
      fetchProjectData();
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to add member"
      );
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axiosInstance.put(`/projects/${id}/remove-member/${memberId}`);
      fetchProjectData();
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to remove member"
      );
    }
  };

  const handleTaskChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/tasks", {
        ...taskData,
        projectId: id,
      });

      showAlert("success", "Task created successfully");

      setTaskData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedTo: "",
      });

      fetchProjectData();
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to create task"
      );
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status });
      fetchProjectData();
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update task"
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      fetchProjectData();
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to delete task"
      );
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
    {
      key: "members",
      label: "Members",
      count: project.members?.length || 0,
    },
    ...(isAdmin
      ? [{ key: "create", label: "Create Task", count: null }]
      : []),
  ];

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.projectHeader}>
        <div style={styles.projectAvatar}>
          {project.title?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 style={styles.heading}>{project.title}</h1>
          <p style={styles.subheading}>{project.description}</p>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
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

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div style={styles.section}>
          {tasks.length === 0 ? (
            <p>No tasks available.</p>
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

      {/* Members Tab */}
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
                  <p>{member.name}</p>
                  <p>{member.email}</p>
                </div>

                <div style={styles.memberRight}>
                  <Badge
                    text={isAdminMember ? "Admin" : "Member"}
                    type="status"
                  />

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

      {/* Create Task Tab */}
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
            />

            <textarea
              name="description"
              placeholder="Task Description"
              value={taskData.description}
              onChange={handleTaskChange}
              style={styles.input}
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
  },

  projectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
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
  },

  heading: {
    fontSize: "24px",
    fontWeight: "bold",
  },

  subheading: {
    color: "#64748b",
  },

  errorBox: {
    padding: "12px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
  },

  successBox: {
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
  },

  tabBar: {
    display: "flex",
    gap: "10px",
  },

  tab: {
    padding: "10px 16px",
    cursor: "pointer",
    border: "none",
    background: "#f1f5f9",
  },

  tabActive: {
    background: "#2563eb",
    color: "#fff",
  },

  tabCount: {
    marginLeft: "6px",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  addMemberForm: {
    display: "flex",
    gap: "10px",
  },

  input: {
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
  },

  addBtn: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },

  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },

  memberRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  removeBtn: {
    padding: "6px 10px",
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
    cursor: "pointer",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  submitBtn: {
    padding: "12px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
};

export default ProjectDetail;