import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";

// Shared UI
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// ── Mobile bottom navigation bar ────────────────────────────────
const MobileBottomNav = () => (
  <nav className="mobile-bottom-nav">
    <NavLink to="/" end style={({ isActive }) => mobileNavItem(isActive)}>
      {({ isActive }) => (
        <>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <rect x="13" y="1" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <rect x="1" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span style={{ fontSize: "10px", fontWeight: 600, marginTop: "2px" }}>Dashboard</span>
        </>
      )}
    </NavLink>

    <NavLink to="/projects" style={({ isActive }) => mobileNavItem(isActive)}>
      {({ isActive }) => (
        <>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M3 6.5A2 2 0 015 4.5h4l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6.5z"
              stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: "10px", fontWeight: 600, marginTop: "2px" }}>Projects</span>
        </>
      )}
    </NavLink>

    <NavLink to="/tasks" style={({ isActive }) => mobileNavItem(isActive)}>
      {({ isActive }) => (
        <>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 5.5h16M3 11h10M3 16.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="18" cy="15.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16.8 15.5l.8.8 1.6-1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "10px", fontWeight: 600, marginTop: "2px" }}>Tasks</span>
        </>
      )}
    </NavLink>
  </nav>
);

const mobileNavItem = (isActive) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  padding: "8px 4px",
  color: isActive ? "#2563eb" : "#94a3b8",
  textDecoration: "none",
  transition: "color 150ms ease",
  borderRadius: "10px",
});

// ── App Layout ────────────────────────────────────────────────
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      <div style={styles.body}>
        {/* Mobile Overlay */}
        {!isDesktop && sidebarOpen && (
          <div
            style={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop: static sidebar in normal flow */}
        {isDesktop && (
          <div style={styles.desktopSidebar}>
            <Sidebar onClose={() => {}} />
          </div>
        )}

        {/* Mobile: fixed drawer (hidden — replaced by bottom nav) */}
        {!isDesktop && (
          <div
            style={{
              ...styles.mobileSidebarDrawer,
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main style={styles.main}>
          <div
            style={{
              ...styles.mainInner,
              ...(isDesktop ? {} : styles.mainInnerMobile),
            }}
            className={isDesktop ? "" : "main-content-mobile"}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Projects */}
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <AppLayout>
                <Projects />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Single Project Detail */}
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <ProjectDetail />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Tasks */}
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#f6f5f2",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  body: {
    display: "flex",
    minHeight: "calc(100vh - 64px)",
    position: "relative",
  },

  desktopSidebar: {
    width: "240px",
    flexShrink: 0,
    position: "sticky",
    top: "64px",
    height: "calc(100vh - 64px)",
    overflowY: "auto",
  },

  mobileSidebarDrawer: {
    position: "fixed",
    top: "64px",
    left: 0,
    height: "calc(100vh - 64px)",
    zIndex: 40,
    transition: "transform 0.3s ease",
    willChange: "transform",
  },

  mobileOverlay: {
    position: "fixed",
    top: "64px",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 30,
  },

  main: {
    flex: 1,
    width: "100%",
    overflowX: "hidden",
    backgroundColor: "#f6f5f2",
    minWidth: 0,
  },

  mainInner: {
    padding: "32px 28px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },

  // Tighter padding on mobile
  mainInnerMobile: {
    padding: "20px 16px",
  },
};

export default App;
