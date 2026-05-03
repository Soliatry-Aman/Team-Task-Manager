import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.email || !formData.password)
      return setError("Please fill in all fields");
    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/register", formData);
      login(response.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reg-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important;
        }
        .reg-submit:hover:not(:disabled) {
          background-color: #2563eb !important;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35) !important;
        }
        .reg-submit:active:not(:disabled) {
          transform: scale(0.98);
        }
        .reg-footer-link:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Left Panel — Form */}
      <div style={styles.leftPanel}>
        <div style={styles.formCard}>
          {/* Top brand link */}
          <Link to="/login" style={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to login
          </Link>

          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.brandMark}>
              <span style={styles.brandLetter}>T</span>
            </div>
            <h1 style={styles.formTitle}>Create your account</h1>
            <p style={styles.formSubtitle}>Join your team workspace in seconds</p>
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
            {/* Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full name</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Aman Raj"
                  style={styles.input}
                  className="reg-input"
                />
              </div>
            </div>

            {/* Email */}
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
                  className="reg-input"
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Password"
                  style={styles.input}
                  className="reg-input"
                />
              </div>
              <p style={styles.hint}>Use a strong password with letters & numbers</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
              className="reg-submit"
            >
              {loading ? (
                <span style={styles.btnInner}>
                  <span style={styles.spinner} />
                  Creating account…
                </span>
              ) : (
                <span style={styles.btnInner}>
                  Create account
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.footerLink} className="reg-footer-link">
              Sign in →
            </Link>
          </p>

          <p style={styles.legalText}>
            By registering, you agree to our{" "}
            <span style={styles.legalLink}>Terms of Service</span> and{" "}
            <span style={styles.legalLink}>Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* Right Panel — Visual */}
      <div style={styles.rightPanel}>
        <div style={styles.dots} aria-hidden="true" />
        <div style={styles.rightContent}>
          {/* Floating cards */}
          <div style={styles.floatStack}>
            <div style={{ ...styles.floatCard, ...styles.floatCard1 }}>
              <div style={styles.floatCardHeader}>
                <div style={{ ...styles.avatar, backgroundColor: "#dbeafe", color: "#1d4ed8" }}>A</div>
                <div>
                  <p style={styles.floatCardName}>Aman created a task</p>
                  <p style={styles.floatCardSub}>Design System · 2m ago</p>
                </div>
              </div>
              <p style={styles.floatCardBody}>Update button component tokens</p>
              <div style={styles.floatCardFooter}>
                <span style={{ ...styles.pill, backgroundColor: "#fef3c7", color: "#92400e" }}>In Progress</span>
                <span style={styles.floatCardDue}>Due Thu</span>
              </div>
            </div>

            <div style={{ ...styles.floatCard, ...styles.floatCard2 }}>
              <div style={styles.floatCardHeader}>
                <div style={{ ...styles.avatar, backgroundColor: "#dcfce7", color: "#166534" }}>S</div>
                <div>
                  <p style={styles.floatCardName}>Sara marked done</p>
                  <p style={styles.floatCardSub}>API Integration · just now</p>
                </div>
              </div>
              <p style={styles.floatCardBody}>Auth endpoints connected ✓</p>
              <div style={styles.floatCardFooter}>
                <span style={{ ...styles.pill, backgroundColor: "#dcfce7", color: "#166534" }}>Done</span>
              </div>
            </div>

            <div style={{ ...styles.floatCard, ...styles.floatCard3 }}>
              <p style={styles.statLabel}>Team Progress</p>
              <p style={styles.statValue}>84%</p>
              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
              <p style={styles.statSub}>12 of 14 tasks complete</p>
            </div>
          </div>

          <div style={styles.rightCaption}>
            <h3 style={styles.captionTitle}>Built for teams that ship</h3>
            <p style={styles.captionSub}>Real-time collaboration, clear ownership, zero confusion.</p>
          </div>
        </div>

        <div style={styles.rightFooter}>
          <span style={styles.footerBadge}>● Live collaboration</span>
        </div>
      </div>
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

  /* ── Left Panel (Form) ── */
  leftPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 32px",
    backgroundColor: "#f6f5f2",
  },
  formCard: {
    width: "100%",
    maxWidth: "440px",
    animation: "fadeUp 0.45s ease both",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 500,
    marginBottom: "32px",
    textDecoration: "none",
    transition: "color 150ms ease",
  },
  formHeader: {
    marginBottom: "32px",
  },
  brandMark: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  brandLetter: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: "6px",
  },
  formSubtitle: {
    fontSize: "15px",
    color: "#64748b",
  },

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

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginBottom: "24px",
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
  hint: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  inputWrapper: { position: "relative" },
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
    transition: "background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease",
    letterSpacing: "-0.01em",
    marginTop: "4px",
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
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "12px",
  },
  footerLink: {
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "none",
  },
  legalText: {
    textAlign: "center",
    fontSize: "11px",
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  legalLink: {
    color: "#64748b",
    textDecoration: "underline",
    cursor: "pointer",
  },

  /* ── Right Panel (Visual) ── */
  rightPanel: {
    width: "46%",
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
  },
  dots: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
    pointerEvents: "none",
  },
  rightContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "40px",
  },

  /* Floating task cards */
  floatStack: {
    width: "100%",
    maxWidth: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  floatCard: {
    backgroundColor: "#1e2432",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "16px",
  },
  floatCard1: {},
  floatCard2: { marginLeft: "24px" },
  floatCard3: { marginLeft: "12px" },
  floatCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
  },
  floatCardName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#e2e8f0",
    margin: 0,
  },
  floatCardSub: {
    fontSize: "11px",
    color: "#475569",
    margin: 0,
  },
  floatCardBody: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "10px",
  },
  floatCardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pill: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "99px",
  },
  floatCardDue: {
    fontSize: "11px",
    color: "#475569",
  },
  statLabel: {
    fontSize: "11px",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.03em",
    marginBottom: "10px",
  },
  progressBar: {
    width: "100%",
    height: "4px",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: "99px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    width: "84%",
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "99px",
  },
  statSub: {
    fontSize: "11px",
    color: "#475569",
  },

  rightCaption: {
    textAlign: "center",
  },
  captionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.02em",
    marginBottom: "8px",
  },
  captionSub: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
  },
  rightFooter: {
    position: "relative",
    zIndex: 1,
    textAlign: "right",
  },
  footerBadge: {
    fontSize: "11px",
    color: "#22c55e",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
};

export default Register;