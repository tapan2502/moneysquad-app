// src/utils/api.ts
import axios, { AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { secureStorage } from './secureStorage';

/**
 * ===== Production API Base URL =====
 * Single source of truth for all API requests
 */
const BASE_URL = 'https://api.moneysquad.in/api';

// ---- Axios instance ----
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: { Accept: 'application/json' },
  maxBodyLength: Infinity as any,
  maxContentLength: Infinity as any,
});

// ---- Helpers ----
const isFormData = (data: any): boolean =>
  typeof FormData !== 'undefined' && data instanceof FormData;

const ensureHeaders = (config: AxiosRequestConfig) => {
  if (!config.headers) config.headers = {};
  return config.headers as Record<string, string>;
};

// ---- Interceptors ----
apiClient.interceptors.request.use(
  async (config) => {
    const headers = ensureHeaders(config);
    const isFD = isFormData(config.data);
    const keepMultipartCT = (config as any)?.keepMultipartContentType === true;

    console.log('🚀 [API REQUEST] Starting:', {
      method: (config.method ?? '').toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      timeout: config.timeout,
      platform: Platform.OS,
      hasData: !!config.data,
      dataType: isFD ? 'FormData' : (config.data ? typeof config.data : 'none'),
    });

    const token = await secureStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;

    if (isFD) {
      if (!keepMultipartCT) {
        delete headers['Content-Type'];
        delete headers['content-type'];
      }
      (config as any).paramsSerializer = undefined;

      try {
        // @ts-ignore RN FormData often has a private _parts array
        const parts = (config.data as any)?._parts;
        if (Array.isArray(parts)) {
          console.log('📋 [API REQUEST] FormData keys:', parts.map((p: any) => p?.[0]));
        }
      } catch { }
    } else {
      if (!('Content-Type' in headers) && !('content-type' in headers)) {
        headers['Content-Type'] = 'application/json';
      }
    }

    console.log('📤 [API REQUEST] Final headers:', headers);
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]:', error);
    return Promise.reject(error);
  }
);

// ---- Logout Callback Registry ----
let logoutCallback: (() => void) | null = null;
export const registerLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API RESPONSE] Success:', {
      status: response.status,
      url: response.config.url,
      platform: Platform.OS,
      hasData: !!response.data,
      dataKeys:
        response.data && typeof response.data === 'object'
          ? Object.keys(response.data)
          : [],
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
      const message = error.response?.data?.message || error.response?.data?.error;
      if (message === 'No remarks found for this leadId') {
        console.info('ℹ️ [API INFO] No remarks found (expected).');
      } else {
        console.error('🔴 [API ERROR] Server responded with:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
      if (message === 'Invalid token' || message === 'Account is inactive') {
        console.warn('🚪 [API AUTH] Clearing token due to auth error');
        await secureStorage.removeItem('token');
        if (logoutCallback) {
          console.log('🚪 [API AUTH] Triggering logout callback');
          logoutCallback();
        }
      }
    } else if (error.request) {
      console.error('🌐 [API NETWORK ERROR] No response received (possible networking / host / timeout issue).');
    } else {
      console.error('⚠️ [API REQUEST ERROR] Setup failed:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
