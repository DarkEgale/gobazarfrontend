import axios from 'axios';
import { API_ENDPOINTS, getApiUrl } from '../config/apiConfig';
import { store } from '../store/store';
import { resetAuthState } from '../store/slices/authSlice';

/**
 * Auto-login / silent token refresh:
 * - Access token (15m) expire হলে backend 401 + 'TokenExpired' (বা 'Unauthorized: No token provided') পাঠায়।
 * - Interceptor সেক্ষেত্রে বিদ্যমান /auth/refresh-token endpoint এ refresh token cookie দিয়ে
 *   request করে, backend নতুন accessToken cookie set করে, তারপর original request retry হয়।
 * - Refresh token ও expire/invalid হলে user কে logout করে /login এ পাঠানো হয়।
 */

// Interceptor bypass করার জন্য আলাদা raw instance (refresh call এ ব্যবহৃত)
const rawAxios = axios.create({ withCredentials: true });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    failedQueue = [];
};

// সব axios request এ cookie পাঠানো নিশ্চিত করা
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const message = error.response?.data?.message || '';

        const isTokenExpired =
            status === 401 &&
            (message === 'TokenExpired' ||
                message === 'Unauthorized: No token provided' ||
                message === 'Invalid Token');
        const isRefreshCall =
            originalRequest?.url?.includes(API_ENDPOINTS.REFRESH_TOKEN) ||
            originalRequest?.url?.includes(API_ENDPOINTS.LOGOUT);

        // Access token expire হলে একবার refresh করে request retry
        if (isTokenExpired && originalRequest && !originalRequest._retry && !isRefreshCall) {
            // একই সময়ে একাধিক request fail হলে সবগুলো একটাই refresh এর পর পরে retry হবে
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axios(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // বিদ্যমান /auth/refresh-token endpoint ব্যবহার করে নতুন access token নেওয়া
                await rawAxios.post(getApiUrl(API_ENDPOINTS.REFRESH_TOKEN));

                processQueue(null);
                // নতুন token দিয়ে original request আবার পাঠানো
                return axios(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                const refreshMessage =
                    refreshError?.response?.data?.message || '';

                // Refresh token নেই মানে user শুধু logged-in না (anonymous) —
                // এটা session expiry না, তাই redirect করা হবে না
                const isAnonymous =
                    refreshMessage === 'Unauthorized: No refresh token provided';

                if (!isAnonymous) {
                    // Refresh token expired/invalid/reuse — session শেষ, login এ পাঠানো
                    store.dispatch(resetAuthState());
                    if (!window.location.pathname.startsWith('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axios;