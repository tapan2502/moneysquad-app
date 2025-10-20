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
  _id: string;               // <-- primary id to use for payout details fetch
  leadId: string;
  lead_Id: string;           // legacy / alternate id
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
    leadUserId: string; // present, but we are now using the row's _id primarily
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

export interface PayoutDetails {
  leadId: string;
  disbursedAmount: number;
  commission: number;
  grossPayout: number;
  tds: number;
  netPayout: number;
  remark: string;
  commissionRemark: string;
}

interface CommissionState {
  commissionData: CommissionData[];
  disbursedLeads: DisbursedLead[];
  monthlyBreakdown: MonthlyBreakdown[];
  payoutDetails: PayoutDetails | null;
  isLoading: boolean;
  isPayoutLoading: boolean;
  isBreakdownLoading: boolean;
  isPayoutDetailsLoading: boolean;
  error: string | null;
  payoutDetailsError: string | null;
}

const initialState: CommissionState = {
  commissionData: [],
  disbursedLeads: [],
  monthlyBreakdown: [],
  payoutDetails: null,
  isLoading: false,
  isPayoutLoading: false,
  isBreakdownLoading: false,
  isPayoutDetailsLoading: false,
  error: null,
  payoutDetailsError: null,
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
      console.log('[Commission Slice] Disbursed leads API response sample:', JSON.stringify(response.data.data?.[0], null, 2));
      console.log('[Commission Slice] First lead IDs - _id:', response.data.data?.[0]?._id, 'leadId:', response.data.data?.[0]?.leadId, 'lead_Id:', response.data.data?.[0]?.lead_Id);
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

export const fetchPayoutDetails = createAsyncThunk(
  'commission/fetchPayoutDetails',
  async (leadUserId: string, { rejectWithValue }) => {
    try {
      console.log('[Commission Slice] Fetching payout details for leadUserId:', leadUserId);
      const response = await apiClient.get(`/commission/payout-details/${leadUserId}`);
      console.log('[Commission Slice] Payout details response:', response.data);

      if (response.data.success && response.data.data) {
        console.log('[Commission Slice] Payout details fetched successfully:', response.data.data);
        return response.data.data;
      } else {
        console.error('[Commission Slice] Invalid response format:', response.data);
        return rejectWithValue('Invalid response format');
      }
    } catch (error: any) {
      console.error('[Commission Slice] Error fetching payout details:', error);
      console.error('[Commission Slice] Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payout details');
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
    clearPayoutDetails: (state) => {
      state.payoutDetails = null;
      state.payoutDetailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Commission Data
      .addCase(fetchCommissionData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommissionData.fulfilled, (state, action: PayloadAction<CommissionData[]>) => {
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
      .addCase(fetchDisbursedLeads.fulfilled, (state, action: PayloadAction<DisbursedLead[]>) => {
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
      .addCase(fetchMonthlyBreakdown.fulfilled, (state, action: PayloadAction<MonthlyBreakdown[]>) => {
        state.isBreakdownLoading = false;
        state.monthlyBreakdown = action.payload;
      })
      .addCase(fetchMonthlyBreakdown.rejected, (state, action) => {
        state.isBreakdownLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Payout Details
      .addCase(fetchPayoutDetails.pending, (state) => {
        state.isPayoutDetailsLoading = true;
        state.payoutDetailsError = null;
        console.log('[Commission Slice Reducer] Payout details request started');
      })
      .addCase(fetchPayoutDetails.fulfilled, (state, action) => {
        state.isPayoutDetailsLoading = false;
        state.payoutDetails = action.payload;
        console.log('[Commission Slice Reducer] Payout details loaded successfully:', action.payload);
      })
      .addCase(fetchPayoutDetails.rejected, (state, action) => {
        state.isPayoutDetailsLoading = false;
        state.payoutDetailsError = action.payload as string;
        console.error('[Commission Slice Reducer] Payout details request failed:', action.payload);
      });
  },
});

export const { clearError, clearPayoutDetails } = commissionSlice.actions;
export default commissionSlice.reducer;
