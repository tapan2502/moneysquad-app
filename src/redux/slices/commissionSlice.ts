import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

// Types
export interface CommissionEntry {
  _id: string;
  lenderName: string;
  termLoan: number;
  overdraft: number;
  remark: string;
}

export interface CommissionSheet {
  _id: string;
  sheetType: string;
  entries: CommissionEntry[];
}

export interface CommissionData {
  _id: string;
  commissionType: string;
  sheets: CommissionSheet[];
  __v: number;
}

export interface DisbursedLead {
  _id: string;
  leadId: string;
  lead_Id: string;
  partner_Id: string;
  payoutStatus: string;
  warning: boolean;
  remark: string;
  disbursedAmount: number;
  payoutStatusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  partner: {
    name: string;
    partnerId: string;
  };
  associate: {
    name: string;
    associateDisplayId: string;
  };
  applicant: {
    name: string;
    business: string;
  };
  lender: {
    name: string;
    loanType: string;
    loan_id: string;
  };
  disbursedId: {
    _id: string;
    leadUserId: string;
    loanAmount: number;
    tenureMonths: number;
    interestRatePA: number;
    processingFee: number;
    insuranceCharges: number;
    loanScheme: string;
    lanNumber: string;
    actualDisbursedDate: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  commissionRemark: string;
  commission: number;
  grossPayout: number;
  netPayout: number;
  isTopupLoan: boolean;
}

export interface MonthlyBreakdown {
  month: string;
  totalDisbursals: number;
  commissionEarned: number;
  payoutPaid: number;
  payoutPending: number;
  paymentStatus: string;
  gstStatus: string;
}

interface CommissionState {
  commissionData: CommissionData[];
  disbursedLeads: DisbursedLead[];
  monthlyBreakdown: MonthlyBreakdown[];
  isLoading: boolean;
  isPayoutLoading: boolean;
  isBreakdownLoading: boolean;
  error: string | null;
}

const initialState: CommissionState = {
  commissionData: [],
  disbursedLeads: [],
  monthlyBreakdown: [],
  isLoading: false,
  isPayoutLoading: false,
  isBreakdownLoading: false,
  error: null,
};

// Async thunks
export const fetchCommissionData = createAsyncThunk(
  'commission/fetchCommissionData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/commission');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch commission data');
    }
  }
);

export const fetchDisbursedLeads = createAsyncThunk(
  'commission/fetchDisbursedLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/commission/get-payout');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch disbursed leads');
    }
  }
);

export const fetchMonthlyBreakdown = createAsyncThunk(
  'commission/fetchMonthlyBreakdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/commission/partner-monthly-breakdown');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly breakdown');
    }
  }
);

const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Commission Data
      .addCase(fetchCommissionData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommissionData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commissionData = action.payload;
      })
      .addCase(fetchCommissionData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Disbursed Leads
      .addCase(fetchDisbursedLeads.pending, (state) => {
        state.isPayoutLoading = true;
        state.error = null;
      })
      .addCase(fetchDisbursedLeads.fulfilled, (state, action) => {
        state.isPayoutLoading = false;
        state.disbursedLeads = action.payload;
      })
      .addCase(fetchDisbursedLeads.rejected, (state, action) => {
        state.isPayoutLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Monthly Breakdown
      .addCase(fetchMonthlyBreakdown.pending, (state) => {
        state.isBreakdownLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyBreakdown.fulfilled, (state, action) => {
        state.isBreakdownLoading = false;
        state.monthlyBreakdown = action.payload;
      })
      .addCase(fetchMonthlyBreakdown.rejected, (state, action) => {
        state.isBreakdownLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = commissionSlice.actions;
export default commissionSlice.reducer;