import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import complaintService from "../../services/complaintService";
import { getErrorMessage } from "../../services/api";

export const fetchComplaints = createAsyncThunk(
  "complaints/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await complaintService.getAllComplaints();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch complaints."));
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  "complaints/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await complaintService.getComplaintById(id);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load complaint."));
    }
  }
);

export const createComplaint = createAsyncThunk(
  "complaints/create",
  async (complaintData, { rejectWithValue }) => {
    try {
      const data = await complaintService.createComplaint(complaintData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create complaint."));
    }
  }
);

export const assignComplaint = createAsyncThunk(
  "complaints/assign",
  async ({ complaintId, employeeId }, { rejectWithValue }) => {
    try {
      const data = await complaintService.assignComplaint(complaintId, employeeId);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to assign complaint."));
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  "complaints/updateStatus",
  async ({ complaintId, status }, { rejectWithValue }) => {
    try {
      const data = await complaintService.updateStatus(complaintId, status);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update complaint status."));
    }
  }
);

const complaintSlice = createSlice({
  name: "complaints",
  initialState: {
    items: [],
    selectedComplaint: null,
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearComplaintMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch by id
      .addCase(fetchComplaintById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create
      .addCase(createComplaint.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items.unshift(action.payload);
        state.successMessage = "Complaint submitted successfully!";
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // assign
      .addCase(assignComplaint.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignComplaint.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedComplaint = action.payload;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = "Complaint assigned successfully!";
      })
      .addCase(assignComplaint.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // update status
      .addCase(updateComplaintStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedComplaint = action.payload;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = "Status updated successfully!";
      })
      .addCase(updateComplaintStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearComplaintMessages, setSelectedComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
