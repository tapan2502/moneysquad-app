import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";

// Base User Interface
interface BaseUser {
  _id: string;
  email: string;
  mobile: string;
  role: "admin" | "manager" | "partner" | "associate";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Admin User Interface
interface AdminUser extends BaseUser {
  firstName: string;
  lastName: string;
  commissionPlan: string;
  role: "admin";
}

// Manager User Interface
interface ManagerUser extends BaseUser {
  firstName: string;
  lastName: string;
  location: string;
  managerId: string;
  role: "manager";
}

// Agreement Accepted Log Interface
interface AgreementAcceptedLog {
  timestamp: string;
  ip: string;
  _id: string;
}

// Partner User Interface
interface PartnerUser extends BaseUser {
  partnerId: string;
  basicInfo: {
    fullName: string;
    mobile: string;
    email: string;
    registeringAs: string;
    teamStrength?: string;
    _id: string;
  };
  personalInfo: {
    dateOfBirth: string;
    currentProfession: string;
    emergencyContactNumber: string;
    focusProduct: string;
    roleSelection: string;
    experienceInSellingLoans?: string;
    _id: string;
  };
  addressDetails: {
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    pincode: string;
    addressType: string;
    _id: string;
  };
  bankDetails: {
    accountType: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    relationshipWithAccountHolder: string;
    isGstBillingApplicable: string;
    _id: string;
  };
  documents: {
    profilePhoto: string;
    panCard: string;
    aadharFront: string;
    aadharBack: string;
    cancelledCheque?: string;
    gstCertificate?: string;
    aditional: string;
    _id: string;
  };
  commissionPlan: string;
  agreementAccepted?: boolean;
  agreementAcceptedLogs?: AgreementAcceptedLog[];
  role: "partner";
}

// Associate User Interface
interface AssociateUser extends BaseUser {
  firstName: string;
  lastName: string;
  location: string;
  commissionPlan: string;
  associateOf: string;
  associateDisplayId: string;
  role: "associate";
}

// Union type for all user types
type UserData = AdminUser | ManagerUser | PartnerUser | AssociateUser;

// API Response Interface
interface UserDataResponse {
  success: boolean;
  data: UserData;
}

// Partner Agreement Accept Response Interface
interface PartnerAgreementResponse {
  success: boolean;
  message: string;
  data?: any;
}

// State Interface
interface UserDataState {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
  acceptingAgreement: boolean;
  agreementError: string | null;
}

// Initial State
const initialState: UserDataState = {
  userData: null,
  loading: false,
  error: null,
  updating: false,
  updateError: null,
  acceptingAgreement: false,
  agreementError: null,
};

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Async Thunk for fetching user data
export const fetchUserData = createAsyncThunk<UserData, void, { rejectValue: string }>(
  "userData/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<UserDataResponse>("/common/userdata");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue("Failed to fetch user data");
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user data");
    }
  }
);

// Async Thunk for updating user data
export const updateUserData = createAsyncThunk<UserData, Partial<UserData>, { rejectValue: string }>(
  "userData/updateUserData",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<UserDataResponse>("/common/userdata", updateData);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue("Failed to update user data");
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user data");
    }
  }
);

// Async Thunk for accepting partner agreement with retry logic
export const acceptPartnerAgreement = createAsyncThunk<UserData, void, { rejectValue: string }>(
  "userData/acceptPartnerAgreement",
  async (_, { rejectWithValue }) => {
    try {
      // First, accept the agreement
      const response = await apiClient.post<PartnerAgreementResponse>("/dashboard/partner-agreement-accept");

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to accept agreement");
      }

      // Wait a bit for the backend to process the update
      await delay(1000);

      // Try to fetch updated user data with retry logic
      let retries = 3;
      let userDataResponse: any = null;

      while (retries > 0) {
        try {
          userDataResponse = await apiClient.get<UserDataResponse>("/common/userdata");

          if (userDataResponse.data.success) {
            const userData = userDataResponse.data.data;

            // Check if the agreement is now accepted
            if (isPartnerUser(userData) && userData.agreementAccepted === true) {
              return userData;
            }

            // If still not accepted, wait and retry
            if (retries > 1) {
              await delay(1500);
              retries--;
              continue;
            }
          }

          break;
        } catch (fetchError) {
          if (retries === 1) {
            throw fetchError;
          }
          await delay(1500);
          retries--;
        }
      }

      // If we get here, either the fetch failed or agreement is still not accepted
      // But the acceptance API succeeded, so we'll return the data we have
      if (userDataResponse?.data?.success) {
        return userDataResponse.data.data;
      } else {
        return rejectWithValue("Failed to fetch updated user data after accepting agreement");
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept agreement");
    }
  }
);

// User Data Slice
const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    // Clear user data
    clearUserData: (state) => {
      state.userData = null;
      state.error = null;
      state.updateError = null;
      state.agreementError = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
      state.agreementError = null;
    },

    // Update user data locally (for optimistic updates)
    updateUserDataLocally: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user data";
      })
      // Update User Data
      .addCase(updateUserData.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.updating = false;
        state.userData = action.payload;
        state.updateError = null;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update user data";
      })
      // Accept Partner Agreement
      .addCase(acceptPartnerAgreement.pending, (state) => {
        state.acceptingAgreement = true;
        state.agreementError = null;
        // Optimistically update the agreement status
        if (state.userData && isPartnerUser(state.userData)) {
          state.userData.agreementAccepted = true;
        }
      })
      .addCase(acceptPartnerAgreement.fulfilled, (state, action) => {
        state.acceptingAgreement = false;
        state.userData = action.payload;
        state.agreementError = null;
      })
      .addCase(acceptPartnerAgreement.rejected, (state, action) => {
        state.acceptingAgreement = false;
        state.agreementError = action.payload || "Failed to accept agreement";
        // Revert optimistic update on failure
        if (state.userData && isPartnerUser(state.userData)) {
          state.userData.agreementAccepted = false;
        }
      });
  },
});

// Export actions
export const { clearUserData, clearError, updateUserDataLocally } = userDataSlice.actions;

// Export reducer
export default userDataSlice.reducer;

// Selectors
export const selectUserData = (state: { userData: UserDataState }) => state.userData.userData;
export const selectUserDataLoading = (state: { userData: UserDataState }) => state.userData.loading;
export const selectUserDataError = (state: { userData: UserDataState }) => state.userData.error;
export const selectUserDataUpdating = (state: { userData: UserDataState }) => state.userData.updating;
export const selectUserDataUpdateError = (state: { userData: UserDataState }) => state.userData.updateError;
export const selectAcceptingAgreement = (state: { userData: UserDataState }) => state.userData.acceptingAgreement;
export const selectAgreementError = (state: { userData: UserDataState }) => state.userData.agreementError;

// Type guards for checking user role
export const isAdminUser = (user: UserData | null): user is AdminUser => {
  return user?.role === "admin";
};

export const isManagerUser = (user: UserData | null): user is ManagerUser => {
  return user?.role === "manager";
};

export const isPartnerUser = (user: UserData | null): user is PartnerUser => {
  return user?.role === "partner";
};

export const isAssociateUser = (user: UserData | null): user is AssociateUser => {
  return user?.role === "associate";
};