import api from "./api";

export const notificationService = {
  getNotificationsByUser: async (userId) => {
    try {
      const response = await api.get(`/notifications/user/${userId}`);
      if (!response.data) return [];
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (err) {
      console.warn("Could not fetch notifications from backend:", err.message);
      return [];
    }
  },

  getMyNotifications: async () => {
    try {
      const response = await api.get("/notifications/my");
      if (!response.data) return [];
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (err) {
      console.warn("Could not fetch user notifications:", err.message);
      return [];
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (err) {
      console.warn("Could not mark notification as read:", err.message);
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put("/notifications/read-all");
      return response.data;
    } catch (err) {
      console.warn("Could not mark all notifications as read:", err.message);
      return null;
    }
  }
};

export default notificationService;
