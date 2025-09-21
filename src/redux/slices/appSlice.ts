import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isAppLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  currentStep: number;
  registrationData: any;
}

const initialState: AppState = {
  isAppLoading: true,
  theme: 'system',
  currentStep: 0,
  registrationData: {},
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppLoading: (state, action: PayloadAction<boolean>) => {
      state.isAppLoading = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateRegistrationData: (state, action: PayloadAction<any>) => {
      state.registrationData = { ...state.registrationData, ...action.payload };
    },
    clearRegistrationData: (state) => {
      state.registrationData = {};
      state.currentStep = 0;
    },
  },
});

export const { 
  setAppLoading, 
  setTheme, 
  setCurrentStep, 
  updateRegistrationData, 
  clearRegistrationData 
} = appSlice.actions;
export default appSlice.reducer;