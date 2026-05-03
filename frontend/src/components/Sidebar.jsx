import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    to: "/projects",
    label: "Projects",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4.5A1.5 1.5 0 013.5 3h3.086a1.5 1.5 0 011.06.44l.915.914A1.5 1.5 0 009.62 5H12.5A1.5 1.5 0 0114 6.5v6A1.5 1.5 0 0112.5 14h-9A1.5 1.5 0 012 12.5v-8z" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    to: "/tasks",
    label: "Tasks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="13" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M12 11l.8.8 1.2-1.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const Sidebar = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .sidebar-link { text-decoration: none; }
        .sidebar-link:hover .sidebar-link-inner:not(.active-inner) {
          background-color: rgba(15,23,42,0.05) !important;
          color: #0f172a !important;
        }
        .sidebar-help:hover {
          background-color: #0f172a !important;
          color: #fff !important;
        }
        .sidebar-help:hover .help-sub { color: rgba(255,255,255,0.6) !important; }
      `}</style>

      <aside style={styles.aside}>
        <div style={styles.inner}>

          {/* Section Label */}
          <div style={styles.sectionLabel}>
            <span style={styles.pulse} />
            <span style={styles.sectionText}>Navigation</span>
          </div>

          {/* Nav Links */}
          <nav style={styles.nav}>
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className="sidebar-link"
              >
                {({ isActive }) => (
                  <div
                    className={isActive ? "sidebar-link-inner active-inner" : "sidebar-link-inner"}
                    style={{
                      ...styles.linkInner,
                      ...(isActive ? styles.linkActive : {}),
                    }}
                  >
                    <span style={{
                      ...styles.iconWrap,
                      ...(isActive ? styles.iconWrapActive : {}),
                    }}>
                      {icon}
                    </span>
                    <span style={styles.linkLabel}>{label}</span>
                    {isActive && <span style={styles.activeDot} />}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Help Card */}
          <button
            className="sidebar-help"
            onClick={() => window.open("https://github.com/", "_blank")}
            style={styles.helpCard}
          >
            <div style={styles.helpIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="11.5" r=".75" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p style={styles.helpTitle}>Need Help?</p>
              <p style={styles.helpSub} className="help-sub">
                View docs & support
              </p>
            </div>
          </button>

        </div>
      </aside>
    </>
  );
};

const styles = {
  aside: {
    display: "none",
    width: "240px",
    minHeight: "calc(100vh - 64px)",
    borderRight: "1px solid rgba(15,23,42,0.07)",
    backgroundColor: "#ffffff",
    flexShrink: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    // Show on md+
    "@media (min-width: 768px)": { display: "block" },
  },
  inner: {
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    paddingLeft: "12px",
  },
  pulse: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
  },
  sectionText: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  linkInner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    transition: "background-color 150ms ease, color 150ms ease",
    color: "#64748b",
    position: "relative",
  },
  linkActive: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
  },
  iconWrap: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.05)",
    flexShrink: 0,
    transition: "background-color 150ms ease",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  linkLabel: {
    fontSize: "13px",
    fontWeight: 600,
    flex: 1,
    letterSpacing: "-0.01em",
  },
  activeDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    flexShrink: 0,
  },

  divider: {
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.06)",
    margin: "16px 0",
  },

  helpCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(15,23,42,0.08)",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 200ms ease, color 200ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#0f172a",
  },
  helpIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "rgba(15,23,42,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  helpTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "inherit",
    letterSpacing: "-0.01em",
  },
  helpSub: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "1px",
    transition: "color 200ms ease",
  },
};

// Inject display:block for md+ since inline styles can't do media queries
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `@media (min-width: 768px) { aside { display: block !important; } }`;
  document.head.appendChild(style);
}

export default Sidebar;