import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getApiUrl } from '../../config/apiConfig';

// Async thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.REGISTER),
                userData,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.LOGIN),
                credentials,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async (credential, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.GOOGLE_LOGIN),
                { credential },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Google login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.LOGOUT),
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.REFRESH_TOKEN),
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
        }
    }
);

// Profile update (name) — PATCH /api/users/profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.patch(
                getApiUrl(API_ENDPOINTS.PROFILE),
                data,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Profile update failed');
        }
    }
);

// Profile picture upload — POST /api/users/profile/avatar (FormData)
export const uploadAvatar = createAsyncThunk(
    'auth/uploadAvatar',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.PROFILE_AVATAR),
                formData,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Avatar upload failed');
        }
    }
);

// App load হলে /auth/me দিয়ে user data restore (auto-login)
// Access token expire থাকলে interceptor auto refresh করে request retry করায়
export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                getApiUrl(API_ENDPOINTS.ME),
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (otp, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            getApiUrl(API_ENDPOINTS.VERIFY_EMAIL),
            { otp },
            { withCredentials: true }
        )
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Email verification failed')
    }
})

export const resendEmailOtp = createAsyncThunk('auth/resendEmailOtp', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            getApiUrl(API_ENDPOINTS.RESEND_EMAIL_OTP),
            {},
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to resend verification OTP');
    }
});

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.CHANGE_PASSWORD),
                passwordData,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Password change failed');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.FORGOT_PASSWORD),
                email
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, resetotp, type }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.VERIFY_OTP),
                { email, resetotp, type },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Invalid OTP');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, otp, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.RESET_PASSWORD),
                { email, otp, newPassword }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Password reset failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        // /auth/me restore শেষ হলে true — protected route এর wait-এর জন্য দরকার
        bootstrapped: false,
        loading: false,
        error: null,
        success: false,
        message: '',
        // Password reset
        resetEmail: '',
        resetOtp: '',
        resetStep: 0,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = '';
        },
        resetAuthState: (state) => {
            state.error = null;
            state.success = false;
            state.message = '';
        },
        setResetStep: (state, action) => {
            state.resetStep = action.payload;
        },
        setResetEmail: (state, action) => {
            state.resetEmail = action.payload;
        },
        setResetOtp: (state, action) => {
            state.resetOtp = action.payload;
        },
        resetPasswordState: (state) => {
            state.resetEmail = '';
            state.resetOtp = '';
            state.resetStep = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.isAuthenticated = true;
                state.user = action.payload.data.user;
                state.message = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.isAuthenticated = true;
                state.user = action.payload.data.user;
                state.message = action.payload.message;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Email verification
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload.data.user;
                state.message = action.payload.message;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resendEmailOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
            })
            .addCase(resendEmailOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Google Login
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.isAuthenticated = true;
                state.user = action.payload.data.user;
                state.message = action.payload.message;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.message = 'Logged out successfully';
            })
            // Refresh Token
            .addCase(refreshToken.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // Fetch Me (auto-login on app load)
            .addCase(fetchMe.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.bootstrapped = true;
                state.user = action.payload.data.user;
                state.error = null;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.bootstrapped = true;
                state.isAuthenticated = false;
            })
            // Change Password
            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Profile (name)
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload.data.user;
                state.message = action.payload.message;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload Avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload.data.user;
                state.message = action.payload.message;
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Forgot Password
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.resetStep = 1;
                state.message = action.payload.message;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify OTP
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.resetStep = 2;
                state.message = action.payload.message;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.resetStep = 3;
                state.message = action.payload.message;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearMessage, resetAuthState, setResetStep, setResetEmail, setResetOtp, resetPasswordState } = authSlice.actions;

export default authSlice.reducer;