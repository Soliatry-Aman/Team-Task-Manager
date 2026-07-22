import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const HEALTH_URL = `${BASE_URL}/api/health`;

// How long between health pings while waking (ms)
const PING_INTERVAL = 4000;
// After this many seconds show the "taking longer than usual" message
const SLOW_THRESHOLD = 20;

const ServerWakeUp = ({ onReady }) => {
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState(".");
  const startedAt = useRef(Date.now());
  const pingRef = useRef(null);
  const timerRef = useRef(null);

  const ping = useCallback(async () => {
    try {
      await axios.get(HEALTH_URL, { timeout: 5000 });
      // Server is awake!
      clearInterval(pingRef.current);
      clearInterval(timerRef.current);
      onReady();
    } catch {
      // Still starting — keep pinging
    }
  }, [onReady]);

  useEffect(() => {
    // Tick elapsed seconds
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 1000);

    // Ping server immediately then on interval
    ping();
    pingRef.current = setInterval(ping, PING_INTERVAL);

    return () => {
      clearInterval(pingRef.current);
      clearInterval(timerRef.current);
    };
  }, [ping]);

  const isSlow = elapsed >= SLOW_THRESHOLD;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bar-fill {
          0%   { width: 0%; }
          40%  { width: 55%; }
          70%  { width: 75%; }
          90%  { width: 90%; }
          100% { width: 95%; }
        }

        .wake-card {
          animation: fadeUp 0.4s ease both;
        }
        .wake-ring {
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid rgba(37,99,235,0.4);
          animation: pulse-ring 1.6s ease-out infinite;
        }
        .wake-spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(37,99,235,0.2);
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        .wake-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          animation: bar-fill 60s cubic-bezier(0.1, 0.4, 0.2, 1) forwards;
        }
      `}</style>

      <div style={styles.overlay}>
        <div className="wake-card" style={styles.card}>
          {/* Animated logo */}
          <div style={styles.iconWrap}>
            <div className="wake-ring" />
            <div style={styles.iconBox}>
              <span style={styles.iconLetter}>T</span>
            </div>
          </div>

          {/* Text */}
          <div style={styles.textBlock}>
            <h2 style={styles.title}>Server is waking up{dots}</h2>
            <p style={styles.subtitle}>
              {isSlow
                ? "This is taking a bit longer than usual — Render's free tier can be slow on the first request. Almost there!"
                : "Render's free servers sleep after inactivity. It usually takes 30–60 seconds to start back up."}
            </p>
          </div>

          {/* Progress bar */}
          <div style={styles.barTrack}>
            <div className="wake-bar-fill" />
          </div>

          {/* Elapsed timer */}
          <div style={styles.timerRow}>
            <span className="wake-spinner" />
            <span style={styles.timerText}>
              {elapsed}s elapsed · checking every {PING_INTERVAL / 1000}s
            </span>
          </div>

          {/* Tips */}
          <div style={styles.tipsBox}>
            <p style={styles.tipsTitle}>Why does this happen?</p>
            <p style={styles.tipsText}>
              The backend is hosted on Render&apos;s free plan, which suspends the server after 15 minutes of inactivity. Your page will load automatically once it&apos;s ready.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#f6f5f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "20px",
    padding: "40px 36px",
    maxWidth: "440px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(15,23,42,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    textAlign: "center",
  },
  iconWrap: {
    position: "relative",
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  iconLetter: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },
  barTrack: {
    width: "100%",
    height: "6px",
    backgroundColor: "rgba(37,99,235,0.1)",
    borderRadius: "99px",
    overflow: "hidden",
  },
  timerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  timerText: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#94a3b8",
  },
  tipsBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.07)",
    borderRadius: "12px",
    padding: "14px 16px",
    textAlign: "left",
    width: "100%",
    boxSizing: "border-box",
  },
  tipsTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
  },
  tipsText: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },
};

export default ServerWakeUp;
