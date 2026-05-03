const ProjectCard = ({ project, onClick }) => {
  const memberCount = project.members?.length || 0;
  const adminName = project.admin?.name || "Unknown";
  const initial = adminName.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .project-card {
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
        }
        .project-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(15,23,42,0.12) !important;
          border-color: rgba(37,99,235,0.25) !important;
        }
        .project-card:hover .card-arrow {
          transform: translate(2px, -2px);
          opacity: 1 !important;
        }
      `}</style>

      <div className="project-card" onClick={onClick} style={styles.card}>
        {/* Top row */}
        <div style={styles.topRow}>
          {/* Project initial avatar */}
          <div style={styles.projectAvatar}>
            {project.title?.charAt(0).toUpperCase() || "P"}
          </div>
          {/* Arrow icon */}
          <span className="card-arrow" style={styles.arrow}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {/* Title */}
        <h3 style={styles.title}>{project.title}</h3>

        {/* Description */}
        <p style={styles.description}>{project.description}</p>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Footer */}
        <div style={styles.footer}>
          {/* Admin */}
          <div style={styles.adminRow}>
            <div style={styles.adminAvatar}>{initial}</div>
            <div>
              <p style={styles.adminLabel}>Admin</p>
              <p style={styles.adminName}>{adminName}</p>
            </div>
          </div>

          {/* Members pill */}
          <div style={styles.memberPill}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="4.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 10c0-2 1.567-3.5 3.5-3.5S8 8 8 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="9" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9 7c1.5.2 2.5 1.3 2.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </div>
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
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  projectAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "16px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.02em",
  },
  arrow: {
    color: "#cbd5e1",
    opacity: 0.6,
    transition: "transform 200ms ease, opacity 200ms ease",
    display: "flex",
  },
  title: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
  },
  description: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.6,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1,
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.06)",
    margin: "4px 0",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  adminAvatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  adminLabel: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  adminName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "-0.01em",
  },
  memberPill: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "99px",
    padding: "4px 10px",
  },
};

export default ProjectCard;