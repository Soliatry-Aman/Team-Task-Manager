import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";

// Shared UI
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(false); // close mobile drawer on resize up
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      <div style={styles.body}>
        {/* Mobile Overlay — only shown on mobile when drawer is open */}
        {!isDesktop && sidebarOpen && (
          <div
            style={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── DESKTOP: static sidebar in normal flow ── */}
        {isDesktop && (
          <div style={styles.desktopSidebar}>
            <Sidebar onClose={() => {}} />
          </div>
        )}

        {/* ── MOBILE: fixed drawer that slides in/out ── */}
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
          <div style={styles.mainInner}>{children}</div>
        </main>
      </div>
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
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

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

  // ── Desktop: sidebar sits in normal document flow (no fixed/transform tricks)
  desktopSidebar: {
    width: "240px",
    flexShrink: 0,
    position: "sticky",
    top: "64px",
    height: "calc(100vh - 64px)",
    overflowY: "auto",
  },

  // ── Mobile: fixed drawer slides in from left
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
    minWidth: 0, // prevent flex blowout
  },

  mainInner: {
    padding: "32px 28px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
};

export default App;
