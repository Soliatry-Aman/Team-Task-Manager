import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // 90s timeout — handles slow Render cold starts
  timeout: 90000,
});

// ── Attach token on every request ────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auto-retry + friendly error messages ─────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Detect network/timeout (Render cold start) errors
    const isColdStart =
      !error.response &&
      (error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error");

    // Retry up to 3 times with 5s gap between attempts
    if (isColdStart && !config._retryCount) {
      config._retryCount = 0;
    }

    if (isColdStart && config._retryCount < 3) {
      config._retryCount += 1;
      await new Promise((r) => setTimeout(r, 5000));
      return axiosInstance(config);
    }

    // Normalize error message for the UI
    if (!error.response) {
      error.userMessage =
        "The server is still waking up. Please wait a moment and try again.";
    } else if (error.response.status === 401) {
      error.userMessage = "Your session has expired. Please log in again.";
    } else if (error.response.status >= 500) {
      error.userMessage = "A server error occurred. Please try again shortly.";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;