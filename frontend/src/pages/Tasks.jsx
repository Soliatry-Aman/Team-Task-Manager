import {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

import Loader from "../components/Loader";
import TaskCard from "../components/TaskCard";

const Tasks = () => {
  const { user } = useAuth();

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Fetch all tasks from all projects
  const fetchTasks =
    async () => {
      try {
        setLoading(true);

        const projectsRes =
          await axiosInstance.get(
            "/projects"
          );

        const projects =
          projectsRes.data || [];

        let allTasks = [];

        for (const project of projects) {
          const tasksRes =
            await axiosInstance.get(
              `/tasks/${project._id}`
            );

          const projectTasks =
            tasksRes.data.map(
              (task) => ({
                ...task,
                projectTitle:
                  project.title,
                isAdmin:
                  project.admin
                    ?._id ===
                  user?.id,
              })
            );

          allTasks = [
            ...allTasks,
            ...projectTasks,
          ];
        }

        setTasks(allTasks);
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to load tasks"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Update task status
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

        fetchTasks();
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

        fetchTasks();
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

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Tasks
        </h1>

        <p className="text-gray-600 mt-1">
          All tasks across your projects
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tasks List */}
      {tasks.length ===
      0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-gray-500">
          No tasks found.
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map(
            (task) => (
              <div
                key={
                  task._id
                }
              >
                {/* Project Title */}
                <div className="mb-2 text-sm text-gray-500 font-medium">
                  Project:{" "}
                  {
                    task.projectTitle
                  }
                </div>

                <TaskCard
                  task={task}
                  isAdmin={
                    task.isAdmin
                  }
                  onStatusUpdate={
                    handleStatusUpdate
                  }
                  onDelete={
                    handleDeleteTask
                  }
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;