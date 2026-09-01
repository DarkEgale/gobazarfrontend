// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Auth endpoints
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_EMAIL_OTP: '/auth/resend-email-otp',

    // Password reset endpoints
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-forgot-password-otp',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',

    // Product endpoints
    PRODUCTS: '/api/products',
    PRODUCTS_ALL: '/api/products/all',
    PRODUCT_SEARCH: '/api/products/search',
    PRODUCT_DETAILS: '/api/products',

    // WishList

    CREATE_WISH: '/api/add-wish',
    GET_WISH: '/api/get-wish',

    // ORDER

    CREATE_ORDER: '/api/order/create',
    GET_ORDERS: '/api/order/my-orders',
    ORDER_DETAILS: '/api/order/details',
    ADMIN_ORDERS: '/api/order/all',

    // USERS (Admin)
    ADMIN_USERS: '/api/users/all',

    // REVIEWS (product reviews / feedback)
    REVIEWS: '/api/reviews',                 // POST /:id/helpful, DELETE /:id
    PRODUCT_REVIEWS: '/api/reviews/product', // GET/POST /:productId

    // PROFILE (logged-in user)
    PROFILE: '/api/users/profile',
    PROFILE_AVATAR: '/api/users/profile/avatar',
    DELETE_USER: '/api/users'
};

export const getApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};

export const getProductUrl = (id) => {
    return `${API_BASE_URL}${API_ENDPOINTS.PRODUCT_DETAILS}/${id}`;
};
