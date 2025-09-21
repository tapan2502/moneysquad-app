// src/utils/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { secureStorage } from './secureStorage';

// If you must hardcode for now (move to HTTPS + env later)
const getBaseURL = () => 'http://178.236.185.178:5003/api';

const BASE_URL = getBaseURL();

console.log('🌐 [API CONFIG] Base URL:', BASE_URL);
console.log('🌐 [API CONFIG] Platform:', Platform.OS);
console.log('🌐 [API CONFIG] Dev mode:', __DEV__);
console.log('🌐 [API CONFIG] Expo hostUri:', Constants.expoConfig?.hostUri);

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// --- IMPORTANT: Remove any global/default Content-Type that could break FormData on RN ---
try {
  // Nuke leak-prone defaults on both the global axios and this instance
  // (these are harmless if they don't exist)
  delete (axios.defaults.headers as any)?.post?.['Content-Type'];
  delete (axios.defaults.headers as any)?.common?.['Content-Type'];
  delete (apiClient.defaults.headers as any)?.post?.['Content-Type'];
  delete (apiClient.defaults.headers as any)?.common?.['Content-Type'];
} catch { /* noop */ }

// Request interceptor to add token + set headers correctly
apiClient.interceptors.request.use(
  async (config) => {
    const method = (config.method ?? '').toUpperCase();

    console.log('🚀 [API REQUEST] Starting:', {
      method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      timeout: config.timeout,
      platform: Platform.OS,
      hasData: !!config.data,
      dataType: config.data
        ? (typeof FormData !== 'undefined' && config.data instanceof FormData ? 'FormData' : typeof config.data)
        : 'none',
    });

    // Attach token
    const token = await secureStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // Detect FormData safely
    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;

    // Never set Content-Type for FormData on React Native — let native layer add boundary
    if (isFormData) {
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
      }

      // Optional: light logging without touching File/Blob (which may be undefined on RN)
      try {
        // @ts-ignore RN FormData often has a private _parts array
        const parts = (config.data as any)?._parts;
        if (Array.isArray(parts)) {
          console.log('📋 [API REQUEST] FormData keys:', parts.map((p: any) => p?.[0]));
        }
      } catch { /* noop */ }
    } else {
      // For non-FormData payloads, default to JSON if caller didn't set anything
      config.headers = config.headers ?? {};
      if (!( 'Content-Type' in config.headers ) && !( 'content-type' in config.headers )) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }
    }

    console.log('📤 [API REQUEST] Final headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging + basic auth cleanup
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API RESPONSE] Success:', {
      status: response.status,
      url: response.config.url,
      platform: Platform.OS,
      hasData: !!response.data,
      dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : [],
    });
    return response;
  },
  async (error) => {
    console.log('❌ [API RESPONSE ERROR] Details:', {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      timeout: error.config?.timeout,
      baseURL: error.config?.baseURL,
      platform: Platform.OS,
    });

    if (error.response) {
      const status = error.response.status;
      const message = error.response?.data?.message || error.response?.data?.error;

      if (message === 'No remarks found for this leadId') {
        console.info('ℹ️ [API INFO] No remarks found (expected).');
      } else {
        console.error('🔴 [API ERROR] Server responded with:', {
          status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      if (message === 'Invalid token' || message === 'Account is inactive') {
        console.warn('🚪 [API AUTH] Clearing token due to auth error');
        await secureStorage.removeItem('token');
      }
    } else if (error.request) {
      console.error('🌐 [API NETWORK ERROR] No response received (possible FormData header/HTTP/port issue).');
    } else {
      console.error('⚠️ [API REQUEST ERROR] Setup failed:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
