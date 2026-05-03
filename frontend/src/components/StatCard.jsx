const CARD_THEMES = {
  "Total Tasks": { accent: "#2563eb", bg: "#eff6ff", icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  "To Do": { accent: "#64748b", bg: "#f1f5f9", icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )},
  "In Progress": { accent: "#f59e0b", bg: "#fffbeb", icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  "Done": { accent: "#22c55e", bg: "#f0fdf4", icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  "Overdue": { accent: "#ef4444", bg: "#fef2f2", icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
};

const StatCard = ({ title, value }) => {
  const theme = CARD_THEMES[title] || { accent: "#2563eb", bg: "#eff6ff", icon: null };

  return (
    <>
      <style>{`
        .stat-card { transition: transform 200ms ease, box-shadow 200ms ease; }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15,23,42,0.1) !important;
        }
      `}</style>
      <div className="stat-card" style={styles.card}>
        {/* Top row */}
        <div style={styles.topRow}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.bg, color: theme.accent }}>
            {theme.icon}
          </div>
          <span style={{ ...styles.accent, color: theme.accent }}>
            {value > 0 ? `+${value}` : value}
          </span>
        </div>

        {/* Value */}
        <p style={{ ...styles.value, color: theme.accent }}>{value}</p>

        {/* Title */}
        <p style={styles.title}>{title}</p>

        {/* Bottom bar */}
        <div style={styles.barTrack}>
          <div style={{ ...styles.barFill, backgroundColor: theme.accent }} />
        </div>
      </div>
    </>
  );
};

const styles = {
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    cursor: "default",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  iconBox: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accent: {
    fontSize: "11px",
    fontWeight: 700,
    opacity: 0.6,
  },
  value: {
    fontSize: "36px",
    fontWeight: 700,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },
  title: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  barTrack: {
    height: "3px",
    backgroundColor: "rgba(15,23,42,0.06)",
    borderRadius: "99px",
    overflow: "hidden",
    marginTop: "8px",
  },
  barFill: {
    height: "100%",
    width: "60%",
    borderRadius: "99px",
    opacity: 0.4,
  },
};

export default StatCard;