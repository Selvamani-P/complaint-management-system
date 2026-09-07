import api from "./api";

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const data = response.data;

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.role) {
      localStorage.setItem("role", data.role);
    }
    if (data.name) {
      localStorage.setItem("name", data.name);
    }
    if (data.email) {
      localStorage.setItem("email", data.email);
    } else if (credentials.email) {
      localStorage.setItem("email", credentials.email);
    }

    return data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      token,
      role: localStorage.getItem("role") || "CITIZEN",
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || ""
    };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};

export default authService;
