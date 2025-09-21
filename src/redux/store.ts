import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import appSlice from './slices/appSlice';
import registrationSlice from './slices/registrationSlice';
import dashboardSlice from './slices/dashboardSlice';
import filterSlice from './slices/filterSlice';
import leadsSlice from './slices/leadsSlice';
import offersSlice from './slices/offersSlice';
import associateSlice from './slices/associateSlice';
import resourceAndSupportSlice from './slices/resourceAndSupportSlice';
import userDataSlice from './slices/userDataSlice';
import commissionSlice from './slices/commissionSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  app: appSlice,
  registration: registrationSlice,
  dashboard: dashboardSlice,
  filter: filterSlice,
  leads: leadsSlice,
  offers: offersSlice,
  associate: associateSlice,
  resourceAndSupport: resourceAndSupportSlice,
  userData: userDataSlice,
  commission: commissionSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;