import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

// Interfaces
export interface LoanInfo {
  _id: string;
  type: string;
  amount: number;
}

export interface Associate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  location: string;
  role: string;
  status: string;
  associateOf: string;
  associateDisplayId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  loan: LoanInfo;
}

export interface AssociateFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  location: string;
}

// State
interface AssociateState {
  associates: Associate[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AssociateState = {
  associates: [],
  loading: false,
  error: null,
  success: null,
};

// Create Associate
export const createAssociate = createAsyncThunk<
  Associate,
  AssociateFormData,
  { rejectValue: string }
>(
  'associate/createAssociate',
  async (data, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await apiClient.post('/associate/create', formData);
      return response.data.data as Associate;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create associate'
      );
    }
  }
);

// Fetch All Associates
export const fetchAssociates = createAsyncThunk<
  Associate[],
  void,
  { rejectValue: string }
>(
  'associate/fetchAssociates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/associate');
      return response.data.data as Associate[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch associates'
      );
    }
  }
);

// Update Associate
export const updateAssociate = createAsyncThunk<
  Associate,
  { id: string; data: AssociateFormData },
  { rejectValue: string }
>(
  'associate/updateAssociate',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await apiClient.put(
        `/associate/update/${id}`,
        formData
      );
      return response.data.data as Associate;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update associate'
      );
    }
  }
);

// Delete Associate
export const deleteAssociate = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'associate/deleteAssociate',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/associate/delete/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete associate'
      );
    }
  }
);

const associateSlice = createSlice({
  name: 'associate',
  initialState,
  reducers: {
    clearAssociateState: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAssociates
      .addCase(fetchAssociates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAssociates.fulfilled,
        (state, action: PayloadAction<Associate[]>) => {
          state.loading = false;
          state.associates = action.payload;
        }
      )
      .addCase(fetchAssociates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // createAssociate
      .addCase(createAssociate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        createAssociate.fulfilled,
        (state, action: PayloadAction<Associate>) => {
          state.loading = false;
          state.success = 'Associate created successfully!';
          state.associates.unshift(action.payload);
        }
      )
      .addCase(createAssociate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // updateAssociate
      .addCase(updateAssociate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        updateAssociate.fulfilled,
        (state, action: PayloadAction<Associate>) => {
          state.loading = false;
          state.success = 'Associate updated successfully!';
          state.associates = state.associates.map((a) =>
            a._id === action.payload._id ? action.payload : a
          );
        }
      )
      .addCase(updateAssociate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // deleteAssociate
      .addCase(deleteAssociate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        deleteAssociate.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.success = 'Associate deleted successfully!';
          state.associates = state.associates.filter(
            (a) => a._id !== action.payload
          );
        }
      )
      .addCase(deleteAssociate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAssociateState } = associateSlice.actions;
export default associateSlice.reducer;