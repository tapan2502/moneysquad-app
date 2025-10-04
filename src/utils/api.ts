// src/utils/api.ts
import axios, { AxiosRequestConfig } from 'axios';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { secureStorage } from './secureStorage';

/** ===== Force-override (DEV only) =====
 * Set this to your LAN IP to always use it during development.
 * Leave it empty string "" to disable the hard override.
 */
const FORCE_DEV_IP_BASE = 'http://178.236.185.178:5003/api/';      // <- your IP (with /api)

const HTTPS_FALLBACK_BASE = 'https://api.moneysquad.in/api';        // <- your HTTPS fallback

/**
 * ===== Base URL selection =====
 * Priority:
 * 0) FORCE_DEV_IP_BASE (if set and __DEV__)
 * 1) EXPO_PUBLIC_API_BASE_URL
 * 2) Dev: infer host for emulator / device and use DEV_PORT
 * 3) Prod: HTTPS_FALLBACK_BASE
 */
const DEV_PORT = Number(process.env.EXPO_PUBLIC_API_PORT || 5003);

const getReachableHost = () => {
  const expoHost = Constants.expoConfig?.hostUri?.split(':')?.[0];
  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return expoHost;
  }
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
};

const computeBaseURL = () => {
  // 0) Hard override in DEV
  if (__DEV__ && FORCE_DEV_IP_BASE.trim()) {
    return FORCE_DEV_IP_BASE.replace(/\/+$/, '');
  }

  // 1) Env override
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');

  // 2) Infer for dev
  if (__DEV__) {
    const host = getReachableHost();
    return `http://${host}:${DEV_PORT}/api`;
  }

  // 3) Fallback (prod)
  return HTTPS_FALLBACK_BASE;
};

const BASE_URL = computeBaseURL();

// ---- Diagnostics ----
console.log('🌐 [API CONFIG] Base URL:', BASE_URL);
console.log('🌐 [API CONFIG] Platform:', Platform.OS);
console.log('🌐 [API CONFIG] Dev mode:', __DEV__);
console.log('🌐 [API CONFIG] Expo hostUri:', Constants.expoConfig?.hostUri);

// TEMP: show exactly what release is using (remove later if you want)
if (!__DEV__) {
  setTimeout(() => {
    try { Alert.alert('BASE_URL', BASE_URL); } catch {}
    try { console.error('BASE_URL:', BASE_URL); } catch {}
  }, 400);
}

// ---- Axios instance ----
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: { Accept: 'application/json' },
  maxBodyLength: Infinity as any,
  maxContentLength: Infinity as any,
});

// ===== Smart HTTPS fallback (APK builds) =====
// If we are in release AND baseURL is the IP/HTTP, on "Network Error" switch to HTTPS and retry once.
let _switchedToHttps = false;
const _isRelease = !__DEV__;
const _ipHttpBase = 'http://178.236.185.178:5003/api';

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
      } catch {}
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

    // ===== Automatic HTTPS fallback & retry (release only) =====
    const isNetworkError =
      !error.response && !!error.request && (error.message?.includes('Network Error') || error.code === 'ECONNABORTED');

    const wasUsingIpHttp =
      typeof error.config?.baseURL === 'string' &&
      error.config.baseURL.startsWith(_ipHttpBase);

    if (_isRelease && isNetworkError && wasUsingIpHttp && !_switchedToHttps) {
      try {
        _switchedToHttps = true;
        apiClient.defaults.baseURL = HTTPS_FALLBACK_BASE; // switch globally
        const retryConfig = { ...error.config, baseURL: HTTPS_FALLBACK_BASE };
        console.warn('🔁 [API FALLBACK] Switching to HTTPS and retrying once:', {
          newBase: HTTPS_FALLBACK_BASE,
          url: retryConfig.url,
        });
        try { Alert.alert('API Fallback', `Switched to HTTPS:\n${HTTPS_FALLBACK_BASE}`); } catch {}
        const retryResp = await apiClient.request(retryConfig);
        return retryResp;
      } catch (retryErr) {
        console.error('🔴 [API FALLBACK] HTTPS retry failed:', retryErr);
        // fall through to existing error handling
      }
    }

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
