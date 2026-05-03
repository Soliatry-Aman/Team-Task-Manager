import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password)
      return setError("Please fill in all fields");
    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/login", formData);
      login(response.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Left Panel — Brand */}
      <div style={styles.leftPanel}>
        <div style={styles.grid} aria-hidden="true" />
        <div style={styles.leftContent}>
          <div style={styles.brandMark}>
            <span style={styles.brandLetter}>T</span>
          </div>
          <h2 style={styles.brandName}>TeamTask</h2>
          <p style={styles.brandTagline}>
            Your workspace.<br />Your momentum.
          </p>
          <div style={styles.featureList}>
            {["Manage projects effortlessly", "Collaborate in real-time", "Track every task to done"].map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span style={styles.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.leftFooter}>
          <span style={styles.footerBadge}>Internal Workspace</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Welcome back</h1>
            <p style={styles.formSubtitle}>Sign in to your workspace</p>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 6.5l7.5 5 7.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="1.5" y="4.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
              onMouseEnter={e => !loading && Object.assign(e.target.style, styles.submitBtnHover)}
              onMouseLeave={e => !loading && Object.assign(e.target.style, styles.submitBtnLeave)}
            >
              {loading ? (
                <span style={styles.btnInner}>
                  <span style={styles.spinner} />
                  Signing in…
                </span>
              ) : (
                <span style={styles.btnInner}>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.footerLink}>
              Create one →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    backgroundColor: "#f6f5f2",
  },

  /* ── Left Panel ── */
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "42%",
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    marginTop: "80px",
  },
  brandMark: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    boxShadow: "0 0 0 8px rgba(37,99,235,0.15)",
  },
  brandLetter: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  brandName: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
    marginBottom: "12px",
  },
  brandTagline: {
    fontSize: "18px",
    fontWeight: 400,
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: "48px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    flexShrink: 0,
  },
  featureText: {
    fontSize: "14px",
    color: "#cbd5e1",
    fontWeight: 400,
  },
  leftFooter: {
    position: "relative",
    zIndex: 1,
  },
  footerBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  /* ── Right Panel ── */
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 32px",
    backgroundColor: "#f6f5f2",
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    animation: "fadeUp 0.5s var(--ease-out, ease) both",
  },
  formHeader: {
    marginBottom: "36px",
  },
  formTitle: {
    fontSize: "30px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: "6px",
  },
  formSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    fontWeight: 400,
  },

  /* Error */
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#dc2626",
    fontWeight: 500,
  },
  errorIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#dc2626",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0,
  },

  /* Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "28px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "-0.01em",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "16px",
    height: "16px",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    fontSize: "14px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "10px",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.12)",
  },
  inputBlur: {
    borderColor: "rgba(15,23,42,0.12)",
    boxShadow: "none",
  },

  /* Submit Button */
  submitBtn: {
    width: "100%",
    padding: "13px 20px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, transform 100ms ease, box-shadow 150ms ease",
    letterSpacing: "-0.01em",
    marginTop: "4px",
  },
  submitBtnHover: {
    backgroundColor: "#2563eb",
    boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
  },
  submitBtnLeave: {
    backgroundColor: "#0f172a",
    boxShadow: "none",
  },
  submitBtnDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },

  /* Footer */
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
  },
  footerLink: {
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default Login;