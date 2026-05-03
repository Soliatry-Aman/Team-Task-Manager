import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Loader from "../components/Loader";
import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/projects");
      setProjects(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title || !formData.description)
      return setError("Please fill in all fields");
    try {
      setSubmitting(true);
      await axiosInstance.post("/projects", formData);
      setFormData({ title: "", description: "" });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .projects-wrap { animation: fadeUp 0.35s ease both; }
        .new-project-btn:hover {
          background-color: #2563eb !important;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3) !important;
        }
        .cancel-btn:hover { background-color: #f1f5f9 !important; }
        .form-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #2563eb !important;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3) !important;
        }
      `}</style>

      <div className="projects-wrap" style={styles.wrapper}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Projects</h1>
            <p style={styles.subheading}>
              {projects.length} {projects.length === 1 ? "project" : "projects"} in your workspace
            </p>
          </div>
          <button
            className="new-project-btn"
            onClick={() => setShowForm(!showForm)}
            style={styles.newBtn}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            New Project
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Create Form (collapsible) ── */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formCardHeader}>
              <h2 style={styles.formTitle}>Create New Project</h2>
              <button
                className="cancel-btn"
                onClick={() => { setShowForm(false); setError(""); }}
                style={styles.cancelBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Project Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Website Redesign"
                  value={formData.title}
                  onChange={handleChange}
                  style={styles.input}
                  className="form-input"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="What is this project about?"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ ...styles.input, resize: "vertical", lineHeight: 1.6 }}
                  className="form-input"
                />
              </div>

              <div style={styles.formFooter}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => { setShowForm(false); setError(""); }}
                  style={styles.cancelBtnText}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="submit-btn"
                  style={{
                    ...styles.submitBtn,
                    ...(submitting ? styles.submitBtnDisabled : {}),
                  }}
                >
                  {submitting ? "Creating…" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Section label ── */}
        <div style={styles.sectionRow}>
          <p style={styles.sectionLabel}>All Projects</p>
          <div style={styles.sectionLine} />
        </div>

        {/* ── Projects Grid ── */}
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 8A2.5 2.5 0 016.5 5.5h5.144a2.5 2.5 0 011.768.732l1.524 1.524A2.5 2.5 0 0016.704 8.5H21.5A2.5 2.5 0 0124 11v10a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 014 21V8z" stroke="#94a3b8" strokeWidth="1.5"/>
              </svg>
            </div>
            <p style={styles.emptyTitle}>No projects yet</p>
            <p style={styles.emptySub}>Create your first project to get started.</p>
            <button
              className="new-project-btn"
              onClick={() => setShowForm(true)}
              style={{ ...styles.newBtn, marginTop: "16px" }}
            >
              + New Project
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onClick={() => navigate(`/projects/${project._id}`)}
              />
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
  newBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 18px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, box-shadow 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: "-0.01em",
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
  formCard: {
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.09)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(15,23,42,0.07)",
  },
  formCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  cancelBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    border: "1px solid rgba(15,23,42,0.08)",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
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
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "4px",
  },
  cancelBtnText: {
    padding: "9px 16px",
    backgroundColor: "transparent",
    border: "1px solid rgba(15,23,42,0.1)",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
    cursor: "pointer",
    transition: "background-color 150ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  submitBtn: {
    padding: "9px 20px",
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
  submitBtnDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  sectionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  sectionLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.07)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
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
    width: "56px",
    height: "56px",
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
};

export default Projects;