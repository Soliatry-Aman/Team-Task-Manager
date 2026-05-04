import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  timeout: 60000, // 60 seconds — handles Render free tier cold start delay
});

// Attach token automatically
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

// Improve error messages for network/timeout issues
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.message === "Network Error" || !error.response) {
      error.response = {
        data: {
          message:
            "Server is starting up, please try again in a few seconds.",
        },
      };
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;