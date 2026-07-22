import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import ServerWakeUp from "./components/ServerWakeUp";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const HEALTH_URL = `${BASE_URL}/api/health`;

// Check if we're in production (deployed) — only show wake-up screen then
const IS_PROD = import.meta.env.PROD;

const Root = () => {
  // Start as "ready" in dev, check health in prod
  const [serverReady, setServerReady] = useState(!IS_PROD);
  const [checked, setChecked] = useState(false);

  // In production, do a quick health ping first.
  // If it responds fast (<2s), skip the wake-up screen entirely.
  // If it times out, show the wake-up UI.
  React.useEffect(() => {
    if (!IS_PROD) return;

    let wakeUpTimer;

    // Try a fast ping — if it responds within 2s the server is already awake
    axios
      .get(HEALTH_URL, { timeout: 2000 })
      .then(() => {
        // Server already awake — go straight to app
        setServerReady(true);
        setChecked(true);
      })
      .catch(() => {
        // Server is sleeping — show wake-up screen after a brief moment
        // (small delay so the page doesn't flash on fast connections)
        wakeUpTimer = setTimeout(() => setChecked(true), 400);
      });

    return () => clearTimeout(wakeUpTimer);
  }, []);

  // During the initial quick ping in prod, render nothing (avoids flash)
  if (IS_PROD && !checked) return null;

  // Server still waking up — show the wait screen
  if (!serverReady) {
    return <ServerWakeUp onReady={() => setServerReady(true)} />;
  }

  // Server is ready — render the full app
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);