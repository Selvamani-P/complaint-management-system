import api from "./api";

export const complaintService = {
  getAllComplaints: async () => {
    const response = await api.get("/complaints");
    return Array.isArray(response.data) ? response.data : [];
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (complaintData) => {
    const response = await api.post("/complaints", complaintData);
    return response.data;
  },

  assignComplaint: async (complaintId, employeeId) => {
    const response = await api.put(`/complaints/${complaintId}/assign/${employeeId}`);
    return response.data;
  },

  updateStatus: async (complaintId, status) => {
    const response = await api.put(`/complaints/${complaintId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

export default complaintService;
