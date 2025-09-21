import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import apiClient from "../../utils/api";

// Types
export interface SupportContact {
  contact: string;
  timing: string;
}

export interface LeadEmail {
  to: string;
  cc: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

// Product Info Types
export interface ProductGuideItem {
  type: string;
  interestRate: string;
  processingFees: string;
  loanAmount: string;
  tenure: string;
  _id?: string;
}

export interface DocumentCategory {
  color?: string;
  subcategories: {
    [subcategory: string]: string[];
  };
}

export interface ProductInfoData {
  guides: ProductGuideItem[];
  policies: {
    eligibilityCriteria: {
      [category: string]: string[];
    };
    eligibilityCalculation: {
      [category: string]: string[];
    };
  };
  documents: {
    [category: string]: DocumentCategory;
  };
  _id?: string;
  __v?: number;
}

export interface SupportData {
  email: SupportContact;
  phone: SupportContact;
  whatsapp: SupportContact;
  office: SupportContact;
  leadEmails: {
    pl: LeadEmail;
    bl: LeadEmail;
    sep: LeadEmail;
  };
  grievance: ContactInfo;
  payout: ContactInfo;
  _id?: string;
  __v?: number;
}

export interface ResourceAndSupportState {
  supportData: SupportData | null;
  productInfo: ProductInfoData | null;
  loading: boolean;
  updateLoading: boolean;
  productInfoLoading: boolean;
  productInfoUpdateLoading: boolean;
  error: string | null;
  updateSuccess: boolean;
  productInfoUpdateSuccess: boolean;
}

const initialState: ResourceAndSupportState = {
  supportData: null,
  productInfo: null,
  loading: false,
  updateLoading: false,
  productInfoLoading: false,
  productInfoUpdateLoading: false,
  error: null,
  updateSuccess: false,
  productInfoUpdateSuccess: false,
};

// Async thunks
export const fetchSupportData = createAsyncThunk(
  "resourceAndSupport/fetchSupportData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/support");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch support data");
    }
  }
);

export const updateSupportData = createAsyncThunk(
  "resourceAndSupport/updateSupportData",
  async (supportData: Partial<SupportData>, { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/support", supportData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update support data");
    }
  }
);

// Product Info async thunks
export const fetchProductInfo = createAsyncThunk(
  "resourceAndSupport/fetchProductInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/product-info");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product info");
    }
  }
);

export const updateProductGuides = createAsyncThunk(
  "resourceAndSupport/updateProductGuides",
  async (guides: ProductGuideItem[], { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/product-info/edit-guides", { guides });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product guides");
    }
  }
);

export const updateProductPolicies = createAsyncThunk(
  "resourceAndSupport/updateProductPolicies",
  async (policies: ProductInfoData["policies"], { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/product-info/edit-policies", { policies });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product policies");
    }
  }
);

export const updateProductDocuments = createAsyncThunk(
  "resourceAndSupport/updateProductDocuments",
  async (documents: ProductInfoData["documents"], { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/product-info/edit-documents", { documents });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product documents");
    }
  }
);

const resourceAndSupportSlice = createSlice({
  name: "resourceAndSupport",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetState: (state) => {
      state.loading = false;
      state.updateLoading = false;
      state.error = null;
      state.updateSuccess = false;
    },
    clearProductInfoError: (state) => {
      state.error = null;
    },
    clearProductInfoUpdateSuccess: (state) => {
      state.productInfoUpdateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch support data
      .addCase(fetchSupportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportData.fulfilled, (state, action) => {
        state.loading = false;
        state.supportData = action.payload;
        state.error = null;
      })
      .addCase(fetchSupportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update support data
      .addCase(updateSupportData.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateSupportData.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.supportData = action.payload;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateSupportData.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      // Fetch product info
      .addCase(fetchProductInfo.pending, (state) => {
        state.productInfoLoading = true;
        state.error = null;
      })
      .addCase(fetchProductInfo.fulfilled, (state, action) => {
        state.productInfoLoading = false;
        state.productInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchProductInfo.rejected, (state, action) => {
        state.productInfoLoading = false;
        state.error = action.payload as string;
      })
      // Update product guides
      .addCase(updateProductGuides.pending, (state) => {
        state.productInfoUpdateLoading = true;
        state.error = null;
        state.productInfoUpdateSuccess = false;
      })
      .addCase(updateProductGuides.fulfilled, (state, action) => {
        state.productInfoUpdateLoading = false;
        if (state.productInfo) {
          state.productInfo.guides = action.payload.guides;
        }
        state.productInfoUpdateSuccess = true;
        state.error = null;
      })
      .addCase(updateProductGuides.rejected, (state, action) => {
        state.productInfoUpdateLoading = false;
        state.error = action.payload as string;
        state.productInfoUpdateSuccess = false;
      })
      // Update product policies
      .addCase(updateProductPolicies.pending, (state) => {
        state.productInfoUpdateLoading = true;
        state.error = null;
        state.productInfoUpdateSuccess = false;
      })
      .addCase(updateProductPolicies.fulfilled, (state, action) => {
        state.productInfoUpdateLoading = false;
        if (state.productInfo) {
          state.productInfo.policies = action.payload.policies;
        }
        state.productInfoUpdateSuccess = true;
        state.error = null;
      })
      .addCase(updateProductPolicies.rejected, (state, action) => {
        state.productInfoUpdateLoading = false;
        state.error = action.payload as string;
        state.productInfoUpdateSuccess = false;
      })
      // Update product documents
      .addCase(updateProductDocuments.pending, (state) => {
        state.productInfoUpdateLoading = true;
        state.error = null;
        state.productInfoUpdateSuccess = false;
      })
      .addCase(updateProductDocuments.fulfilled, (state, action) => {
        state.productInfoUpdateLoading = false;
        if (state.productInfo) {
          state.productInfo.documents = action.payload.documents;
        }
        state.productInfoUpdateSuccess = true;
        state.error = null;
      })
      .addCase(updateProductDocuments.rejected, (state, action) => {
        state.productInfoUpdateLoading = false;
        state.error = action.payload as string;
        state.productInfoUpdateSuccess = false;
      });
  },
});

export const { clearError, clearUpdateSuccess, resetState, clearProductInfoError, clearProductInfoUpdateSuccess } =
  resourceAndSupportSlice.actions;

// Selectors with proper typing
export const selectSupportData = (state: RootState) => state.resourceAndSupport.supportData;
export const selectSupportLoading = (state: RootState) => state.resourceAndSupport.loading;
export const selectUpdateLoading = (state: RootState) => state.resourceAndSupport.updateLoading;
export const selectSupportError = (state: RootState) => state.resourceAndSupport.error;
export const selectUpdateSuccess = (state: RootState) => state.resourceAndSupport.updateSuccess;
export const selectProductInfo = (state: RootState) => state.resourceAndSupport.productInfo;
export const selectProductInfoLoading = (state: RootState) => state.resourceAndSupport.productInfoLoading;
export const selectProductInfoUpdateLoading = (state: RootState) => state.resourceAndSupport.productInfoUpdateLoading;
export const selectProductInfoUpdateSuccess = (state: RootState) => state.resourceAndSupport.productInfoUpdateSuccess;

export default resourceAndSupportSlice.reducer;