import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarMobileOpen: false,
    toasts: []
  },
  reducers: {
    toggleMobileSidebar: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    setMobileSidebar: (state, action) => {
      state.sidebarMobileOpen = action.payload;
    },
    addToast: (state, action) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 7);
      const toast = {
        id,
        message: typeof action.payload === "string" ? action.payload : action.payload.message,
        type: action.payload.type || "info"
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const {
  toggleMobileSidebar,
  setMobileSidebar,
  addToast,
  removeToast
} = uiSlice.actions;

export default uiSlice.reducer;
