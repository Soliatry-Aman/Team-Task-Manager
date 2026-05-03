import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .nav-logo:hover .nav-logo-box { transform: rotate(6deg) scale(1.05); }
        .nav-logout:hover {
          background-color: #2563eb !important;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35) !important;
        }
        .nav-logout:active { transform: scale(0.97); }
        .nav-menu-btn:hover {
          background-color: rgba(15,23,42,0.08) !important;
        }
        @media (min-width: 768px) {
          .nav-menu-btn { display: none !important; }
        }
      `}</style>

      <nav style={styles.nav}>
        {/* Left — Brand + Menu Button */}
        <div style={styles.brandWrapper}>
          <button
            onClick={onMenuToggle}
            style={styles.menuBtn}
            className="nav-menu-btn"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div
            className="nav-logo"
            onClick={() => navigate("/")}
            style={styles.brand}
          >
            <div style={styles.logoBox} className="nav-logo-box">
              <span style={styles.logoLetter}>T</span>
            </div>
            <div style={styles.brandText}>
              <span style={styles.brandName}>TeamTask</span>
              <span style={styles.brandSub}>Workspace</span>
            </div>
          </div>
        </div>

        {/* Right — User + Logout */}
        <div style={styles.right}>
          {/* User info */}
          <div style={styles.userInfo}>
            <div style={styles.userMeta}>
              <p style={styles.userName}>{user?.name || "Guest"}</p>
              <p style={styles.userRole}>{user?.role || "Member"}</p>
            </div>
            <div style={styles.avatar}>
              {initials}
            </div>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            className="nav-logout"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(15,23,42,0.07)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  /* Menu Button */
  menuBtn: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    color: "#0f172a",
    transition: "background-color 200ms ease",
    borderRadius: "8px",
    marginRight: "8px",
  },

  /* Brand Wrapper */
  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },

  /* Brand */
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    userSelect: "none",
    minWidth: 0,
  },
  logoBox: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 200ms ease",
    flexShrink: 0,
  },
  logoLetter: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1,
    gap: "2px",
    minWidth: 0,
  },
  brandName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  },
  brandSub: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#2563eb",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  /* Right side */
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "1px",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  userRole: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
    boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
    flexShrink: 0,
  },
  divider: {
    width: "1px",
    height: "20px",
    backgroundColor: "rgba(15,23,42,0.1)",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
};

export default Navbar;