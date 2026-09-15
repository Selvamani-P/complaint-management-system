import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "../../services/notificationService";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (userId, { rejectWithValue }) => {
    try {
      if (userId) {
        return await notificationService.getNotificationsByUser(userId);
      }
      return await notificationService.getMyNotifications();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await notificationService.markAsRead(notificationId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationService.markAllAsRead();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const isUnread = (n) => !n.isRead && !n.read;

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload || [];
      state.unreadCount = (action.payload || []).filter(isUnread).length;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.unreadCount = (action.payload || []).filter(isUnread).length;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex((n) => n.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload, isRead: true, read: true };
          }
          state.unreadCount = state.items.filter(isUnread).length;
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true, read: true }));
        state.unreadCount = 0;
      });
  }
});

export const { setNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
