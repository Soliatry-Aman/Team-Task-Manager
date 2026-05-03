import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  return (
    <div style={styles.root}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar />
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
  },
  main: {
    flex: 1,
    overflowX: "hidden",
    backgroundColor: "#f6f5f2",
  },
  mainInner: {
    padding: "32px 28px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
};

export default App;