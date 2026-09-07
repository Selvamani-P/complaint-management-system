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
  }
};

export default userService;
