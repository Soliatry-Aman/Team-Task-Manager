const THEMES = {
  status: {
    "To Do":       { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", border: "rgba(71,85,105,0.15)" },
    "In Progress": { bg: "#fffbeb", color: "#92400e", dot: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    "Done":        { bg: "#f0fdf4", color: "#166534", dot: "#22c55e", border: "rgba(34,197,94,0.25)"  },
    "Admin":       { bg: "#eff6ff", color: "#1e40af", dot: "#2563eb", border: "rgba(37,99,235,0.2)"  },
    "Member":      { bg: "#faf5ff", color: "#6b21a8", dot: "#a855f7", border: "rgba(168,85,247,0.2)" },
  },
  priority: {
    "Low":    { bg: "#f0fdf4", color: "#166534", dot: "#22c55e", border: "rgba(34,197,94,0.2)"   },
    "Medium": { bg: "#fffbeb", color: "#92400e", dot: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    "High":   { bg: "#fef2f2", color: "#991b1b", dot: "#ef4444", border: "rgba(239,68,68,0.25)"  },
  },
};

const DEFAULT = { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", border: "rgba(71,85,105,0.15)" };

const Badge = ({ text, type }) => {
  const theme = THEMES[type]?.[text] ?? DEFAULT;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px",
      borderRadius: "99px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.01em",
      backgroundColor: theme.bg,
      color: theme.color,
      border: `1px solid ${theme.border}`,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        backgroundColor: theme.dot,
        flexShrink: 0,
      }} />
      {text}
    </span>
  );
};

export default Badge;