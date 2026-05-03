const Loader = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap');
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Spinner ring */}
          <div style={styles.spinnerWrap}>
            <div style={styles.track} />
            <div style={styles.ring} />
            <div style={styles.innerDot} />
          </div>

          {/* Text */}
          <div style={styles.textWrap}>
            <p style={styles.title}>Loading</p>
            <div style={styles.dots}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    ...styles.dot,
                    animationDelay: `${i * 0.18}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <p style={styles.sub}>Please wait a moment</p>
        </div>
      </div>
    </>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "320px",
    width: "100%",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    animation: "fadeIn 0.3s ease both",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  spinnerWrap: {
    position: "relative",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid rgba(15,23,42,0.08)",
  },
  ring: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid transparent",
    borderTopColor: "#2563eb",
    animation: "spin 0.75s cubic-bezier(0.4,0,0.2,1) infinite",
  },
  innerDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    opacity: 0.3,
  },
  textWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  dots: {
    display: "flex",
    gap: "3px",
    alignItems: "center",
    paddingTop: "1px",
  },
  dot: {
    display: "inline-block",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    animation: "pulse-dot 1s ease-in-out infinite",
  },
  sub: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 400,
  },
};

export default Loader;