import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

import Loader from "../components/Loader";
import Badge from "../components/Badge";
import TaskCard from "../components/TaskCard";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] =
    useState(null);

  const [tasks, setTasks] =
    useState([]);

  const [memberEmail, setMemberEmail] =
    useState("");

  const [taskData, setTaskData] =
    useState({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      assignedTo: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const isAdmin =
    project?.admin?._id ===
    user?.id;

  // Fetch project + tasks
  const fetchProjectData =
    async () => {
      try {
        setLoading(true);

        const projectRes =
          await axiosInstance.get(
            `/projects/${id}`
          );

        const tasksRes =
          await axiosInstance.get(
            `/tasks/${id}`
          );

        setProject(
          projectRes.data
        );

        setTasks(
          tasksRes.data
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Add member
  const handleAddMember =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (!memberEmail) {
        return setError(
          "Please enter member email"
        );
      }

      try {
        const userRes =
          await axiosInstance.get(
            `/users/search?email=${memberEmail}`
          );

        await axiosInstance.put(
          `/projects/${id}/add-member`,
          {
            userId:
              userRes.data._id,
          }
        );

        setSuccess(
          "Member added successfully"
        );

        setMemberEmail("");

        fetchProjectData();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to add member"
        );
      }
    };

  // Remove member
  const handleRemoveMember =
    async (memberId) => {
      try {
        await axiosInstance.put(
          `/projects/${id}/remove-member/${memberId}`
        );

        fetchProjectData();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to remove member"
        );
      }
    };

  // Task form change
  const handleTaskChange = (
    e
  ) => {
    setTaskData({
      ...taskData,
      [e.target.name]:
        e.target.value,
    });
  };

  // Create task
  const handleCreateTask =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      try {
        await axiosInstance.post(
          "/tasks",
          {
            ...taskData,
            projectId: id,
          }
        );

        setSuccess(
          "Task created successfully"
        );

        setTaskData({
          title: "",
          description: "",
          dueDate: "",
          priority:
            "Medium",
          assignedTo: "",
        });

        fetchProjectData();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to create task"
        );
      }
    };

  // Update task
  const handleStatusUpdate =
    async (
      taskId,
      status
    ) => {
      try {
        await axiosInstance.put(
          `/tasks/${taskId}`,
          {
            status,
          }
        );

        fetchProjectData();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to update task"
        );
      }
    };

  // Delete task
  const handleDeleteTask =
    async (taskId) => {
      try {
        await axiosInstance.delete(
          `/tasks/${taskId}`
        );

        fetchProjectData();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to delete task"
        );
      }
    };

  if (loading) {
    return <Loader />;
  }

  if (!project) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded">
        Project not found
      </div>
    );
  }

  return (
    <div>
      {/* Project */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {project.title}
        </h1>

        <p className="text-gray-600 mt-2">
          {
            project.description
          }
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Members */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Team Members
        </h2>

        {isAdmin && (
          <form
            onSubmit={
              handleAddMember
            }
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <input
              type="email"
              placeholder="Enter member email"
              value={
                memberEmail
              }
              onChange={(
                e
              ) =>
                setMemberEmail(
                  e.target
                    .value
                )
              }
              className="flex-1 border rounded px-3 py-2"
            />

            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Add Member
            </button>
          </form>
        )}

        <div className="space-y-3">
          {project.members.map(
            (member) => (
              <div
                key={
                  member._id
                }
                className="flex justify-between items-center border rounded p-3"
              >
                <div>
                  <p className="font-medium">
                    {
                      member.name
                    }
                  </p>

                  <p className="text-sm text-gray-500">
                    {
                      member.email
                    }
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    text={
                      member._id ===
                      project
                        .admin
                        ._id
                        ? "Admin"
                        : "Member"
                    }
                    type="status"
                  />

                  {isAdmin &&
                    member._id !==
                      project
                        .admin
                        ._id && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member._id
                          )
                        }
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Create Task */}
      {isAdmin && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Create Task
          </h2>

          <form
            onSubmit={
              handleCreateTask
            }
            className="space-y-4"
          >
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={
                taskData.title
              }
              onChange={
                handleTaskChange
              }
              className="w-full border rounded px-3 py-2"
            />

            <textarea
              name="description"
              placeholder="Task description"
              value={
                taskData.description
              }
              onChange={
                handleTaskChange
              }
              className="w-full border rounded px-3 py-2"
            />

            <input
              type="date"
              name="dueDate"
              value={
                taskData.dueDate
              }
              onChange={
                handleTaskChange
              }
              className="w-full border rounded px-3 py-2"
            />

            <select
              name="priority"
              value={
                taskData.priority
              }
              onChange={
                handleTaskChange
              }
              className="w-full border rounded px-3 py-2"
            >
              <option>
                Low
              </option>
              <option>
                Medium
              </option>
              <option>
                High
              </option>
            </select>

            <select
              name="assignedTo"
              value={
                taskData.assignedTo
              }
              onChange={
                handleTaskChange
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">
                Select Member
              </option>

              {project.members.map(
                (
                  member
                ) => (
                  <option
                    key={
                      member._id
                    }
                    value={
                      member._id
                    }
                  >
                    {
                      member.name
                    }
                  </option>
                )
              )}
            </select>

            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded"
            >
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Project Tasks
        </h2>

        {tasks.length ===
        0 ? (
          <p className="text-gray-500">
            No tasks found yet.
          </p>
        ) : (
          <div className="space-y-4">
            {tasks.map(
              (task) => (
                <TaskCard
                  key={
                    task._id
                  }
                  task={task}
                  isAdmin={
                    isAdmin
                  }
                  onStatusUpdate={
                    handleStatusUpdate
                  }
                  onDelete={
                    handleDeleteTask
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;