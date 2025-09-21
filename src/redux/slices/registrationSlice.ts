// src/store/slices/registrationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { secureStorage } from '../../utils/secureStorage';

// --- Types ---
interface Bank {
  id: string;
  name: string;
  code?: string;
}

export interface BasicInfo {
  fullName: string;
  mobile: string;
  email: string;
  registeringAs: string;
  teamStrength?: string;
  isEmailVerified: boolean;
}

export interface PersonalInfo {
  dateOfBirth: string;
  currentProfession: string;
  emergencyContactNumber: string;
  experienceInSellingLoans: string;
  focusProduct: string;
  roleSelection: string;
}

export interface AddressDetails {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  addressType: string;
  landmark?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountType: string;
  isGstBillingApplicable: boolean;
}

export interface Documents {
  profilePhoto?: any;
  panCard?: any;
  aadharFront?: any;
  aadharBack?: any;
  gstCertificate?: any;
  cancelledCheque?: any;
  additional?: any;
}

interface RegistrationState {
  currentStep: number;
  basicInfo: BasicInfo;
  personalInfo: PersonalInfo;
  addressDetails: AddressDetails;
  bankDetails: BankDetails;
  documents: Documents;
  banks: Bank[];
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  emailVerified: boolean;
}

const initialState: RegistrationState = {
  currentStep: 1,
  basicInfo: {
    fullName: '',
    mobile: '',
    email: '',
    registeringAs: '',
    teamStrength: '',
    isEmailVerified: false,
  },
  personalInfo: {
    dateOfBirth: '',
    currentProfession: '',
    emergencyContactNumber: '',
    experienceInSellingLoans: '',
    focusProduct: '',
    roleSelection: '',
  },
  addressDetails: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    addressType: '',
    landmark: '',
  },
  bankDetails: {
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    accountType: '',
    isGstBillingApplicable: false,
  },
  documents: {},
  banks: [],
  isLoading: false,
  error: null,
  otpSent: false,
  emailVerified: false,
};

// ---- Thunks that KEEP axios (unchanged) ----

// Fetch banks
export const fetchBanks = createAsyncThunk<Bank[], void, { rejectValue: string }>(
  'registration/fetchBanks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/bank');
      return response.data.data as Bank[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch banks');
    }
  }
);

// Partner OTP: send
export const sendPartnerOTP = createAsyncThunk(
  'registration/sendPartnerOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/partner/send-otp', { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

// Partner OTP: verify
export const verifyPartnerOTP = createAsyncThunk(
  'registration/verifyPartnerOTP',
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/partner/verify-otp', {
        email: data.email,
        otp: data.otp,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

// ---- Create Partner (SWITCHED to native fetch + FormData) ----
export const submitRegistration = createAsyncThunk(
  'registration/submit',
  async (_, { getState, rejectWithValue }) => {
    const log = (m: string, e?: any) => console.log(`[REG SUBMIT] ${m}`, e ?? '');
    try {
      const state = getState() as any;
      const { basicInfo, personalInfo, addressDetails, bankDetails, documents } = state.registration;

      const BASE_URL = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
      const url = `${BASE_URL}/partner/create`;
      log('POST', url);

      const S = (v: any) => (v === undefined || v === null ? '' : String(v));

      const fd = new FormData();

      // ---- BasicInfo (BRACKETS) ----
      fd.append('basicInfo[fullName]', S(basicInfo.fullName));
      fd.append('basicInfo[mobile]', S(basicInfo.mobile));
      fd.append('basicInfo[email]', S(basicInfo.email));
      fd.append('basicInfo[registeringAs]', S(basicInfo.registeringAs));
      if (basicInfo.teamStrength) fd.append('basicInfo[teamStrength]', S(basicInfo.teamStrength));

      // ---- PersonalInfo ----
      fd.append('personalInfo[dateOfBirth]', S(personalInfo.dateOfBirth));
      fd.append('personalInfo[currentProfession]', S(personalInfo.currentProfession));
      fd.append('personalInfo[emergencyContactNumber]', S(personalInfo.emergencyContactNumber));
      fd.append('personalInfo[focusProduct]', S(personalInfo.focusProduct));
      fd.append('personalInfo[roleSelection]', S(personalInfo.roleSelection));
      fd.append('personalInfo[experienceInSellingLoans]', S(personalInfo.experienceInSellingLoans));

      // ---- AddressDetails ----
      fd.append('addressDetails[addressLine1]', S(addressDetails.addressLine1));
      fd.append('addressDetails[addressLine2]', S(addressDetails.addressLine2));
      fd.append('addressDetails[landmark]', S(addressDetails.landmark));
      fd.append('addressDetails[city]', S(addressDetails.city));
      fd.append('addressDetails[pincode]', S(addressDetails.pincode));
      fd.append('addressDetails[addressType]', S(addressDetails.addressType));

      // ---- BankDetails ----
      fd.append('bankDetails[accountHolderName]', S(bankDetails.accountHolderName));
      fd.append('bankDetails[accountType]', S(bankDetails.accountType));
      fd.append('bankDetails[bankName]', S(bankDetails.bankName));
      fd.append('bankDetails[accountNumber]', S(bankDetails.accountNumber));
      fd.append('bankDetails[ifscCode]', S(bankDetails.ifscCode));
      fd.append('bankDetails[branchName]', S(bankDetails.branchName));
      fd.append('bankDetails[isGstBillingApplicable]', String(!!bankDetails.isGstBillingApplicable));
      // include if present to fully mirror web
      if ((bankDetails as any)?.relationshipWithAccountHolder) {
        fd.append('bankDetails[relationshipWithAccountHolder]', S((bankDetails as any).relationshipWithAccountHolder));
      }

      // ---- Files (exactly once) ----
      const guessMime = (name: string) => {
        const n = (name || '').toLowerCase();
        if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
        if (n.endsWith('.png')) return 'image/png';
        if (n.endsWith('.pdf')) return 'application/pdf';
        return 'application/octet-stream';
      };
      const appendFile = (field: string, file: any, fallbackName: string) => {
        if (!file) return;
        const uri = file?.uri ?? file?.asset?.uri ?? file?.path ?? (typeof file === 'string' ? file : null);
        if (!uri) return;
        const name = file?.name ?? file?.fileName ?? fallbackName;
        const type = file?.type ?? file?.mimeType ?? guessMime(name);
        fd.append(field, { uri, name, type } as any);
        log('file', { field, name, uri, type });
      };

      appendFile('profilePhoto', documents.profilePhoto, 'profile.jpg');
      appendFile('panCard', documents.panCard, 'pan.jpg');
      appendFile('aadharFront', documents.aadharFront, 'aadhar-front.jpg');
      appendFile('aadharBack', documents.aadharBack, 'aadhar-back.jpg');
      appendFile('cancelledCheque', documents.cancelledCheque, 'cheque.jpg');
      appendFile('gstCertificate', documents.gstCertificate, 'gst.pdf');
      // IMPORTANT: backend key is "aditional" (matches web)
      appendFile('aditional', documents.additional, 'file.bin');

      // Debug keys
      // @ts-ignore
      const parts = (fd as any)?._parts;
      if (Array.isArray(parts)) log('FormData keys', parts.map((p: any) => p?.[0]));

      const token = await secureStorage.getItem('token');

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // DO NOT set Content-Type
        },
        body: fd,
      });

      log('status', res.status);
      let json: any = {};
      try { json = await res.json(); } catch { json = { message: await res.text().catch(() => '') }; }

      if (!res.ok) {
        const msg = json?.message || json?.error || `Server error (${res.status})`;
        log('server-error', msg);
        if (msg === 'Partner already exists') {
          throw new Error('This email or phone number is already registered. Try logging in instead or use a different email to create a new account.');
        }
        throw new Error(msg);
      }

      log('done');
      return json;
    } catch (e: any) {
      const msg =
        e?.name === 'AbortError'
          ? 'Request timeout. Please check your internet connection and try again.'
          : (e?.message || 'An unexpected error occurred. Please try again.');
      console.log('[REG SUBMIT] Failed', { name: e?.name, message: e?.message });
      return rejectWithValue(msg);
    }
  }
);



// ---- Slice ----
const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateBasicInfo: (state, action: PayloadAction<Partial<BasicInfo>>) => {
      state.basicInfo = { ...state.basicInfo, ...action.payload };
    },
    updatePersonalInfo: (state, action: PayloadAction<Partial<PersonalInfo>>) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    updateAddressDetails: (state, action: PayloadAction<Partial<AddressDetails>>) => {
      state.addressDetails = { ...state.addressDetails, ...action.payload };
    },
    updateBankDetails: (state, action: PayloadAction<Partial<BankDetails>>) => {
      state.bankDetails = { ...state.bankDetails, ...action.payload };
    },
    updateDocuments: (state, action: PayloadAction<Partial<Documents>>) => {
      state.documents = { ...state.documents, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetRegistration: () => initialState,
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload;
      state.basicInfo.isEmailVerified = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Partner OTP
      .addCase(sendPartnerOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPartnerOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(sendPartnerOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify Partner OTP
      .addCase(verifyPartnerOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPartnerOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.emailVerified = true;
        state.basicInfo.isEmailVerified = true;
      })
      .addCase(verifyPartnerOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit Registration (native fetch)
      .addCase(submitRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitRegistration.fulfilled, (state) => {
        state.isLoading = false;
        return initialState;
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Banks
      .addCase(fetchBanks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banks = action.payload;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentStep,
  updateBasicInfo,
  updatePersonalInfo,
  updateAddressDetails,
  updateBankDetails,
  updateDocuments,
  clearError,
  resetRegistration,
  setEmailVerified,
} = registrationSlice.actions;

export default registrationSlice.reducer;
