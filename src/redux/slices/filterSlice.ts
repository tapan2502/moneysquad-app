import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

// Types
export interface LoanType {
  _id: string;
  name: string;
  __v: number;
}

export interface Associate {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  __v: number;
}

interface FilterState {
  loanTypes: LoanType[];
  associates: Associate[];
  selectedLoanType: string;
  selectedAssociate: string;
  selectedMonth: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: FilterState = {
  loanTypes: [],
  associates: [],
  selectedLoanType: 'all',
  selectedAssociate: 'all',
  selectedMonth: (() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  })(),
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLoanTypes = createAsyncThunk<LoanType[], void, { rejectValue: string }>(
  'filter/fetchLoanTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/offers/loan-types');
      return response.data.data as LoanType[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch loan types');
    }
  }
);

export const fetchAssociates = createAsyncThunk<Associate[], void, { rejectValue: string }>(
  'filter/fetchAssociates',
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

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSelectedLoanType: (state, action: PayloadAction<string>) => {
      state.selectedLoanType = action.payload;
    },
    setSelectedAssociate: (state, action: PayloadAction<string>) => {
      state.selectedAssociate = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.selectedLoanType = 'all';
      state.selectedAssociate = 'all';
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      state.selectedMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Loan Types
      .addCase(fetchLoanTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loanTypes = action.payload;
      })
      .addCase(fetchLoanTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Associates
      .addCase(fetchAssociates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssociates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.associates = action.payload;
      })
      .addCase(fetchAssociates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedLoanType,
  setSelectedAssociate,
  setSelectedMonth,
  clearError,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;