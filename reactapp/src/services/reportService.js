import api from "./api";

export const reportService = {
  getSummary: async () => {
    const response = await api.get("/reports/summary");
    return response.data || {};
  },

  getStatusReport: async () => {
    const response = await api.get("/reports/status");
    return response.data || {};
  },

  getEmployeeReport: async () => {
    const response = await api.get("/reports/employees");
    return response.data || {};
  }
};

export default reportService;
