import api from "./api";

export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return Array.isArray(response.data) ? response.data : [];
  },

  getEmployees: async () => {
    const response = await api.get("/users/employees");
    return Array.isArray(response.data) ? response.data : [];
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
