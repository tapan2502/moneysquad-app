// src/store/slices/offersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { secureStorage } from '../../utils/secureStorage';

// API response structure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// --- Interfaces --------------------------------------------------------------

export interface CreateOfferRequest {
  bankName: string;
  bankImage: File | string; // RN runtime may supply { uri, name, type } — handled below
  offerHeadline: string;
  offerValidity: string;
  loanType: string;
  interestRate: number;
  processingFee: number;
  processingFeeType: 'rupee' | 'percentage';
  isFeatured: boolean;
  keyFeatures: string[];
  eligibility: {
    minAge: number;
    maxAge: number;
    minIncome: number;
    employmentType: string;
    maxCreditScore: number;
  };
}

export interface BankOffer {
  _id: string;
  bankName: string;
  bankImage: string;
  offerHeadline: string;
  offerValidity: string;
  loanType: string;
  interestRate: number;
  processingFee: number;
  processingFeeType: 'rupee' | 'percentage';
  isFeatured: boolean;
  keyFeatures: string[];
  eligibility?: {
    minAge: number;
    maxAge: number;
    minIncome: number;
    employmentType: string;
    maxCreditScore: number;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface NewOfferFormData {
  bankName: string;
  bankImage: File | string;
  loanType: string;
  offerHeadline?: string;
  offerValidity?: string;
  interestRate: number;
  processingFee: number;
  keyFeatures: string[];
  isFeatured: boolean;
  eligibility?: {
    minAge?: number;
    maxAge?: number;
    minIncome?: number;
    employmentType?: string;
    maxCreditScore?: number;
  };
}

// Loan type color mapping
export const loanTypeColors: Record<string, { gradient: string[]; textColor: string }> = {
  'PL-Term Loan': { gradient: ['#33C2FF', '#1E90FF'], textColor: '#ffffff' },
  'PL-Overdraft': { gradient: ['#5569FF', '#3B4CCA'], textColor: '#ffffff' },
  'BL-Term Loan': { gradient: ['#57CA22', '#4CAF50'], textColor: '#ffffff' },
  'BL-Overdraft': { gradient: ['#FFA319', '#FF8C00'], textColor: '#ffffff' },
  'SEPL-Term Loan': { gradient: ['#0E1AFF', '#6366F1'], textColor: '#ffffff' },
  'SEPL-Overdraft': { gradient: ['#FF1943', '#EF4444'], textColor: '#ffffff' },
  Other: { gradient: ['#E052A3', '#EC4899'], textColor: '#ffffff' },
};

// Define the state interface
interface OffersState {
  offers: BankOffer[];
  selectedOffer: BankOffer | null;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
  success: string | null;
  currentIndex: number;
}

// Initial state
const initialState: OffersState = {
  offers: [],
  selectedOffer: null,
  loading: false,
  detailsLoading: false,
  error: null,
  success: null,
  currentIndex: 0,
};

// Helper: normalize RN file-like objects to { uri, name, type }
const asRNFile = (file: any, fallbackName: string) => {
  if (!file) return null;
  // Possible shapes: { uri, name, type } or ImagePicker asset { uri, fileName, mimeType }
  const uri = file?.uri ?? file?.asset?.uri ?? file?.path ?? null;
  const name = file?.name ?? file?.fileName ?? fallbackName;
  const type = file?.type ?? file?.mimeType ?? 'application/octet-stream';
  if (!uri) return null;
  // RN fetch accepts this as a Blob-like
  return { uri, name, type } as unknown as Blob;
};

// Build FormData for create/update
const buildOfferFormData = (offerData: Partial<CreateOfferRequest>) => {
  const fd = new FormData();

  if (offerData.bankName !== undefined) fd.append('bankName', offerData.bankName);
  if (offerData.bankImage !== undefined) {
    const img = offerData.bankImage as any;
    // If RN file-like provided
    const rnFile = asRNFile(img, 'bank-image.jpg');
    if (rnFile) {
      fd.append('bankImage', rnFile as any);
    } else if (typeof img === 'string' && !img.startsWith('blob:')) {
      // Keep previous behavior: allow plain string (e.g., URL)
      fd.append('bankImage', img);
    }
  }
  if (offerData.offerHeadline !== undefined) fd.append('offerHeadline', String(offerData.offerHeadline));
  if (offerData.offerValidity !== undefined) fd.append('offerValidity', String(offerData.offerValidity));
  if (offerData.loanType !== undefined) fd.append('loanType', offerData.loanType);
  if (offerData.interestRate !== undefined) fd.append('interestRate', String(offerData.interestRate));
  if (offerData.processingFee !== undefined) fd.append('processingFee', String(offerData.processingFee));
  if (offerData.processingFeeType !== undefined) fd.append('processingFeeType', offerData.processingFeeType);
  if (offerData.isFeatured !== undefined) fd.append('isFeatured', String(offerData.isFeatured));

  if (Array.isArray(offerData.keyFeatures)) {
    offerData.keyFeatures.forEach((feature, idx) => {
      fd.append(`keyFeatures[${idx}]`, feature);
    });
  }

  if (offerData.eligibility) {
    const e = offerData.eligibility;
    if (e.minAge !== undefined) fd.append('eligibility[minAge]', String(e.minAge));
    if (e.maxAge !== undefined) fd.append('eligibility[maxAge]', String(e.maxAge));
    if (e.minIncome !== undefined) fd.append('eligibility[minIncome]', String(e.minIncome));
    if (e.employmentType !== undefined) fd.append('eligibility[employmentType]', e.employmentType);
    if (e.maxCreditScore !== undefined) fd.append('eligibility[maxCreditScore]', String(e.maxCreditScore));
  }

  return fd;
};

// --- Thunks for API calls ---

export const fetchAllOffers = createAsyncThunk(
  'offers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<BankOffer[]>>(`/offers/get-all`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
    }
  }
);

export const fetchOfferById = createAsyncThunk(
  'offers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<BankOffer>>(`/offers/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch offer details');
    }
  }
);

// CREATE (RN fetch + FormData, no Content-Type)
export const createOffer = createAsyncThunk(
  'offers/create',
  async (offerData: CreateOfferRequest, { rejectWithValue }) => {
    try {
      const fd = buildOfferFormData(offerData);
      const token = await secureStorage.getItem('token');
      const BASE_URL = (apiClient.defaults.baseURL || '').replace(/\/$/, '');

      const res = await fetch(`${BASE_URL}/offers/create`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // DO NOT set Content-Type when sending FormData in RN
        },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || json?.error || `Failed to create offer (HTTP ${res.status})`);
      }
      // Align with previous structure that returned response.data.data
      return (json?.data ?? json) as BankOffer;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create offer');
    }
  }
);

// UPDATE (RN fetch + FormData, no Content-Type)
export const updateOffer = createAsyncThunk(
  'offers/update',
  async (
    { id, offerData }: { id: string; offerData: Partial<CreateOfferRequest> },
    { rejectWithValue }
  ) => {
    try {
      const fd = buildOfferFormData(offerData);
      const token = await secureStorage.getItem('token');
      const BASE_URL = (apiClient.defaults.baseURL || '').replace(/\/$/, '');

      const res = await fetch(`${BASE_URL}/offers/${encodeURIComponent(id)}/edit`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // DO NOT set Content-Type when sending FormData in RN
        },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || json?.error || `Failed to update offer (HTTP ${res.status})`);
      }
      return (json?.data ?? json) as BankOffer;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update offer');
    }
  }
);

export const deleteOffer = createAsyncThunk(
  'offers/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete<ApiResponse<string>>(`/offers/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete offer');
    }
  }
);

// Create the offers slice
const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearOffersState: (state) => {
      state.error = null;
      state.success = null;
    },
    setSelectedOffer: (state, action: PayloadAction<BankOffer | null>) => {
      state.selectedOffer = action.payload;
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    nextOffer: (state) => {
      if (state.currentIndex < state.offers.length - 1) {
        state.currentIndex += 1;
      }
    },
    previousOffer: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchAllOffers
    builder
      .addCase(fetchAllOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload;
        state.currentIndex = 0;
      })
      .addCase(fetchAllOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchOfferById
    builder
      .addCase(fetchOfferById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchOfferById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedOffer = action.payload;
      })
      .addCase(fetchOfferById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      });

    // createOffer
    builder
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers.unshift(action.payload);
        state.success = 'Offer created successfully!';
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateOffer
    builder
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = state.offers.map((offer) =>
          offer._id === action.payload._id ? action.payload : offer
        );
        state.selectedOffer = action.payload;
        state.success = 'Offer updated successfully!';
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteOffer
    builder
      .addCase(deleteOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = state.offers.filter((offer) => offer._id !== action.payload);
        state.success = 'Offer deleted successfully!';
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearOffersState,
  setSelectedOffer,
  setCurrentIndex,
  nextOffer,
  previousOffer,
} = offersSlice.actions;

export default offersSlice.reducer;
