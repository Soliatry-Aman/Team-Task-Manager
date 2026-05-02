import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import Loader from "../components/Loader";
import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // Fetch projects
  const fetchProjects =
    async () => {
      try {
        setLoading(true);

        const response =
          await axiosInstance.get(
            "/projects"
          );

        setProjects(
          response.data || []
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // Create project
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    if (
      !formData.title ||
      !formData.description
    ) {
      return setError(
        "Please fill in all fields"
      );
    }

    try {
      setSubmitting(true);

      await axiosInstance.post(
        "/projects",
        formData
      );

      setFormData({
        title: "",
        description: "",
      });

      fetchProjects();
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Failed to create project"
      );
    } finally {
      setSubmitting(false);
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
          Projects
        </h1>

        <p className="text-gray-600 mt-1">
          Create and manage your projects
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Create New Project
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Project title"
            value={
              formData.title
            }
            onChange={
              handleChange
            }
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            name="description"
            placeholder="Project description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
            className="w-full border rounded px-3 py-2"
          />

          <button
            type="submit"
            disabled={
              submitting
            }
            className="bg-black text-white px-6 py-2 rounded"
          >
            {submitting
              ? "Creating..."
              : "Create Project"}
          </button>
        </form>
      </div>

      {/* Projects List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          My Projects
        </h2>

        {projects.length ===
        0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-500">
            No projects yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(
              (project) => (
                <ProjectCard
                  key={
                    project._id
                  }
                  project={
                    project
                  }
                  onClick={() =>
                    navigate(
                      `/projects/${project._id}`
                    )
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

export default Projects;