import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      doneTasks: 0,
      overdueTasks: 0,
    });

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard =
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

            allTasks = [
              ...allTasks,
              ...tasksRes.data,
            ];
          }

          const now =
            new Date();

          setStats({
            totalTasks:
              allTasks.length,

            todoTasks:
              allTasks.filter(
                (task) =>
                  task.status ===
                  "To Do"
              ).length,

            inProgressTasks:
              allTasks.filter(
                (task) =>
                  task.status ===
                  "In Progress"
              ).length,

            doneTasks:
              allTasks.filter(
                (task) =>
                  task.status ===
                  "Done"
              ).length,

            overdueTasks:
              allTasks.filter(
                (task) =>
                  new Date(
                    task.dueDate
                  ) < now &&
                  task.status !==
                    "Done"
              ).length,
          });
        } catch (err) {
          setError(
            err.response?.data
              ?.message ||
              "Failed to load dashboard"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2 text-lg">
          Overview of your tasks and productivity
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Tasks"
          value={
            stats.totalTasks
          }
        />

        <StatCard
          title="To Do"
          value={
            stats.todoTasks
          }
        />

        <StatCard
          title="In Progress"
          value={
            stats.inProgressTasks
          }
        />

        <StatCard
          title="Done"
          value={
            stats.doneTasks
          }
        />

        <StatCard
          title="Overdue"
          value={
            stats.overdueTasks
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;