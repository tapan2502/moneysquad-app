import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

// --- Types ---
interface Bank { id: string; name: string; code?: string; }

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
  relationshipWithAccountHolder: string; // <-- now part of state (required)
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
  isSubmitting: boolean;
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
    relationshipWithAccountHolder: '', // <-- default empty
  },
  documents: {},
  banks: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  otpSent: false,
  emailVerified: false,
};

// ---- Thunks ----

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

export const verifyPartnerOTP = createAsyncThunk(
  'registration/verifyPartnerOTP',
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/partner/verify-otp', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

// --- Thunk: Create Partner (multipart; dot-notation) ---
export const submitRegistration = createAsyncThunk<any, void, { rejectValue: string; state: any }>(
  'registration/submit',
  async (_: void, { getState, rejectWithValue }) => {
    const log = (m: string, e?: any) => console.log(`[REG SUBMIT] ${m}`, e ?? '');
    try {
      const state = getState() as any;
      const { basicInfo, personalInfo, addressDetails, bankDetails, documents } = state.registration;

      const S = (v: any) => (v === undefined || v === null ? '' : String(v));
      const fd = new FormData();

      // Basic Info
      fd.append('basicInfo.fullName', S(basicInfo.fullName));
      fd.append('basicInfo.mobile', S(basicInfo.mobile));
      fd.append('basicInfo.email', S(basicInfo.email));
      fd.append('basicInfo.registeringAs', S(basicInfo.registeringAs));
      if (basicInfo.teamStrength) fd.append('basicInfo.teamStrength', S(basicInfo.teamStrength));

      // Personal Info
      fd.append('personalInfo.dateOfBirth', S(personalInfo.dateOfBirth));
      fd.append('personalInfo.currentProfession', S(personalInfo.currentProfession));
      fd.append('personalInfo.emergencyContactNumber', S(personalInfo.emergencyContactNumber));
      fd.append('personalInfo.focusProduct', S(personalInfo.focusProduct));
      fd.append('personalInfo.roleSelection', S(personalInfo.roleSelection));
      fd.append('personalInfo.experienceInSellingLoans', S(personalInfo.experienceInSellingLoans));

      // Address Details
      fd.append('addressDetails.addressLine1', S(addressDetails.addressLine1));
      fd.append('addressDetails.addressLine2', S(addressDetails.addressLine2));
      fd.append('addressDetails.landmark', S(addressDetails.landmark));
      fd.append('addressDetails.city', S(addressDetails.city));
      fd.append('addressDetails.pincode', S(addressDetails.pincode));
      fd.append('addressDetails.addressType', S(addressDetails.addressType));

      // Bank Details (ALWAYS send both relationship + GST)
      fd.append('bankDetails.accountHolderName', S(bankDetails.accountHolderName));
      fd.append('bankDetails.accountType', S(bankDetails.accountType));
      fd.append('bankDetails.bankName', S(bankDetails.bankName));
      fd.append('bankDetails.accountNumber', S(bankDetails.accountNumber));
      fd.append('bankDetails.ifscCode', S(bankDetails.ifscCode));
      fd.append('bankDetails.branchName', S(bankDetails.branchName));
      fd.append('bankDetails.relationshipWithAccountHolder', S(bankDetails.relationshipWithAccountHolder)); // <-- always
      fd.append('bankDetails.isGstBillingApplicable', bankDetails.isGstBillingApplicable ? 'true' : 'false'); // <-- always

      // Files
      const guessMime = (name: string) => {
        const n = (name || '').toLowerCase();
        if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
        if (n.endsWith('.png')) return 'image/png';
        if (n.endsWith('.pdf')) return 'application/pdf';
        return 'application/octet-stream';
      };
      const normalizeMime = (t?: string, name?: string) =>
        (!t || !t.includes('/')) ? guessMime(name || '') : t;

      const appendFile = (field: string, file: any, fallbackName: string) => {
        if (!file) { log(`skip ${field}: no file`); return; }
        const uri = file?.uri ?? file?.asset?.uri ?? file?.path ?? (typeof file === 'string' ? file : null);
        const name = file?.name ?? file?.fileName ?? fallbackName;
        const type = normalizeMime(file?.type ?? file?.mimeType, name);
        if (!uri) { log(`skip ${field}: missing uri`, { file }); return; }
        if (!/^content:\/\//i.test(uri) && !/^file:\/\//i.test(uri)) {
          log(`skip ${field}: uri not local (file:// or content:// required)`, { uri }); return;
        }
        // @ts-ignore RN FormData file shape
        fd.append(field, { uri, name, type });
        log('file', { field, name, type, uri });
      };

      appendFile('profilePhoto', documents.profilePhoto, 'profile.jpg');
      appendFile('panCard', documents.panCard, 'pan.jpg');
      appendFile('aadharFront', documents.aadharFront, 'aadhar-front.jpg');
      appendFile('aadharBack', documents.aadharBack, 'aadhar-back.jpg');
      appendFile('cancelledCheque', documents.cancelledCheque, 'cheque.jpg');
      appendFile('gstCertificate', documents.gstCertificate, 'gst.pdf');
      appendFile('aditional', documents.additional, 'file.bin');

      // Debug dump
      try {
        // @ts-ignore RN FormData has a private _parts array
        const parts = (fd as any)?._parts ?? [];
        console.log('🧾 FormData Preview (about to send):');
        for (const [key, value] of parts) {
          if (value && typeof value === 'object' && 'uri' in value) {
            console.log(`  • FILE  ${key} -> name=${value.name}, type=${value.type}, uri=${value.uri}`);
          } else {
            console.log(`  • FIELD ${key} = ${String(value)}`);
          }
        }
        console.log('🧾 ---- END FormData ----');
      } catch (e) {
        console.warn('⚠️ Could not dump FormData preview', e);
      }

      // POST
      const res = await apiClient.post('/partner/create', fd, {
        timeout: 120000,
        transformRequest: (d) => d,
        headers: { 'Content-Type': 'multipart/form-data' },
        ...( { keepMultipartContentType: true } as any ),
        maxBodyLength: Infinity as any,
        maxContentLength: Infinity as any,
        onUploadProgress: (p) => {
          const pct = p.total ? Math.round((p.loaded / p.total) * 100) : null;
          console.log('[UPLOAD]', p.loaded, p.total, pct ?? '?%');
        },
      });

      log('status', res.status);
      return res.data;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'An unexpected error occurred. Please try again.';
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
    setCurrentStep: (state, action: PayloadAction<number>) => { state.currentStep = action.payload; },
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
    clearError: (state) => { state.error = null; },
    resetRegistration: () => initialState,
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload;
      state.basicInfo.isEmailVerified = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPartnerOTP.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(sendPartnerOTP.fulfilled, (state) => { state.isLoading = false; state.otpSent = true; })
      .addCase(sendPartnerOTP.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(verifyPartnerOTP.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(verifyPartnerOTP.fulfilled, (state) => {
        state.isLoading = false; state.emailVerified = true; state.basicInfo.isEmailVerified = true;
      })
      .addCase(verifyPartnerOTP.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(fetchBanks.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBanks.fulfilled, (state, action) => { state.isLoading = false; state.banks = action.payload; })
      .addCase(fetchBanks.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(submitRegistration.pending, (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(submitRegistration.fulfilled, () => initialState)
      .addCase(submitRegistration.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload as string; });
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
