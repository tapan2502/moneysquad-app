import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { secureStorage } from '../../utils/secureStorage';

interface User {
  id: string;
  email: string;
  fullName?: string;
  mobile?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔐 [AUTH] Android - Starting login process for:', email);
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('✅ [AUTH] Android - Login successful:', response.data);
      const { token, user } = response.data;
      
      // Store token securely
      console.log('💾 [AUTH] Android - Storing token securely...');
      await secureStorage.setItem('token', token);
      console.log('✅ [AUTH] Android - Token stored successfully');
      
      return { token, user };
    } catch (error: any) {
      console.error('❌ [AUTH] Android - Login failed:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Send OTP thunk
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/send-otp', { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

// Verify OTP thunk
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

// Forgot Password thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      console.log('🔑 [FORGOT PASSWORD] Android - Sending OTP to:', email);
      const response = await apiClient.post('/auth/send-opt', { email });
      console.log('🔑 [FORGOT PASSWORD] Android - Send OTP Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔑 [FORGOT PASSWORD] Android - Send OTP Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset OTP');
    }
  }
);

// Verify Forgot Password OTP thunk
export const verifyForgotPasswordOTP = createAsyncThunk(
  'auth/verifyForgotPasswordOTP',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      console.log('🔐 [FORGOT PASSWORD] Android - Verifying OTP:', { email, otp });
      const response = await apiClient.post('/auth/forgot-password', { email, otp });
      console.log('🔐 [FORGOT PASSWORD] Android - Verify OTP Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔐 [FORGOT PASSWORD] Android - Verify OTP Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/partner/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      secureStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send OTP cases
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify OTP cases
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify Forgot Password OTP cases
      .addCase(verifyForgotPasswordOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export { verifyForgotPasswordOTP };
export default authSlice.reducer;