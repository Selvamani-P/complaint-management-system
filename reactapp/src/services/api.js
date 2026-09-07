import axios from "axios";

// Read backend URL from environment or default to local Spring Boot URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// Request Interceptor: attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Do NOT attach token for login and register requests
    if (
      token &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config.url?.includes("/auth/login") ||
        error.config.url?.includes("/auth/register");

      if (!isAuthRoute) {
        // Clear invalid/expired session
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        // Redirect to login if in a browser window
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login?sessionExpired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to extract user-friendly error messages
export const getErrorMessage = (error, defaultMessage = "An unexpected error occurred.") => {
  if (!error) return defaultMessage;
  if (typeof error === "string") return error;
  if (error.response) {
    if (error.response.data) {
      if (typeof error.response.data === "string") return error.response.data;
      if (error.response.data.message) return error.response.data.message;
      if (error.response.data.error) return error.response.data.error;
    }
    if (error.response.status === 401) return "Session expired. Please log in again.";
    if (error.response.status === 403) return "You do not have permission to perform this action.";
    if (error.response.status === 404) return "The requested resource was not found.";
    if (error.response.status >= 500) return "Server error. Please try again later.";
  }
  if (error.message) return error.message;
  return defaultMessage;
};

export default api;
