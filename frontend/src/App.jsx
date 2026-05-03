import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
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

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={styles.root}>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div style={styles.body}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <div style={{
          ...styles.sidebarWrapper,
          ...(sidebarOpen ? styles.sidebarWrapperOpen : {})
        }}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <main style={styles.main}>
          <div style={styles.mainInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout><Dashboard /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/projects" element={
          <PrivateRoute>
            <AppLayout><Projects /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/projects/:id" element={
          <PrivateRoute>
            <AppLayout><ProjectDetail /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/tasks" element={
          <PrivateRoute>
            <AppLayout><Tasks /></AppLayout>
          </PrivateRoute>
        } />
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
  sidebarWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    zIndex: 40,
    transform: "translateX(-100%)",
    transition: "transform 0.3s ease",
    "@media (min-width: 768px)": {
      position: "static",
      transform: "none",
      zIndex: "auto",
    },
  },
  sidebarWrapperOpen: {
    transform: "translateX(0)",
  },
  mobileOverlay: {
    position: "fixed",
    top: 64,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 30,
    display: "block",
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
  main: {
    flex: 1,
    overflowX: "hidden",
    backgroundColor: "#f6f5f2",
    width: "100%",
    "@media (max-width: 767px)": {
      width: "100%",
    },
  },
  mainInner: {
    padding: "32px 28px",
    maxWidth: "1200px",
    margin: "0 auto",
    "@media (max-width: 768px)": {
      padding: "20px 16px",
    },
    "@media (max-width: 480px)": {
      padding: "16px 12px",
    },
  },
};

export default App;