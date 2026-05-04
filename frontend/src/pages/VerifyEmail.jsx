import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Loader from "../components/Loader";

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Prevent double-call from React StrictMode's double-mount in development
  const hasCalled = useRef(false);

  useEffect(() => {
    // Guard: only call the API once even if effect fires twice (StrictMode)
    if (hasCalled.current) return;
    hasCalled.current = true;

    const verifyEmail = async () => {
      try {
        const response = await axiosInstance.get(
          `/auth/verify-email/${token}`
        );
        setMessage(response.data?.message || "Email verified successfully");
      } catch (err) {
        setError(
          err.response?.data?.message || "Email verification failed"
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.brandMark}>T</div>

        <h1 style={styles.title}>
          {error ? "Verification failed" : "Email verified"}
        </h1>

        <p style={error ? styles.errorText : styles.successText}>
          {error || message}
        </p>

        <Link to="/login" style={styles.link}>
          Back to login
        </Link>
      </div>
    </div>
  );
};

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#f6f5f2",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "14px",
    padding: "32px",
    textAlign: "center",
    boxShadow: "0 8px 28px rgba(15,23,42,0.08)",
  },

  brandMark: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#0f172a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "20px",
    fontWeight: 800,
  },

  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "10px",
  },

  successText: {
    fontSize: "14px",
    color: "#166534",
    lineHeight: 1.6,
    marginBottom: "24px",
  },

  errorText: {
    fontSize: "14px",
    color: "#b91c1c",
    lineHeight: 1.6,
    marginBottom: "24px",
  },

  link: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 18px",
    borderRadius: "9px",
    backgroundColor: "#0f172a",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
  },
};

export default VerifyEmail;
