import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getApiUrl } from '../../config/apiConfig';

// Async thunks
export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(getApiUrl(API_ENDPOINTS.PRODUCTS), {
                params,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

// Trending products — homepage/shop hero section er jonno (latest 8 products)
export const fetchTrendingProducts = createAsyncThunk(
    'product/fetchTrendingProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(getApiUrl(API_ENDPOINTS.PRODUCTS), {
                params: { page: 1, limit: 16, ...params },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending products');
        }
    }
);

export const fetchProductDetails = createAsyncThunk(
    'product/fetchProductDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${getApiUrl(API_ENDPOINTS.PRODUCT_DETAILS)}/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
        }
    }
);

export const searchProducts = createAsyncThunk(
    'product/searchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(getApiUrl(API_ENDPOINTS.PRODUCT_SEARCH), {
                params,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

// ─── Product Reviews / Feedback ───

// কোনো product-এর সব review + rating summary (public)
export const fetchProductReviews = createAsyncThunk(
    'product/fetchProductReviews',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${getApiUrl(API_ENDPOINTS.PRODUCT_REVIEWS)}/${productId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

// নিজের review submit (আগে দিয়ে থাকলে update হবে)
export const submitReview = createAsyncThunk(
    'product/submitReview',
    async ({ productId, rating, title, comment }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${getApiUrl(API_ENDPOINTS.PRODUCT_REVIEWS)}/${productId}`,
                { rating, title, comment },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
        }
    }
);

// review-তে "Helpful" vote toggle
export const toggleReviewHelpful = createAsyncThunk(
    'product/toggleReviewHelpful',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${getApiUrl(API_ENDPOINTS.REVIEWS)}/${reviewId}/helpful`,
                {},
                { withCredentials: true }
            );
            return { ...response.data, reviewId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update helpful');
        }
    }
);

// নিজের review delete
export const deleteReview = createAsyncThunk(
    'product/deleteReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${getApiUrl(API_ENDPOINTS.REVIEWS)}/${reviewId}`,
                { withCredentials: true }
            );
            return { ...response.data, reviewId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState: {
        products: [],
        trendingProducts: [],
        trendingLoading: false,
        product: null,
        loading: false,
        detailsLoading: false,
        error: null,
        totalProducts: 0,
        totalPages: 1,
        page: 1,
        limit: 12,
        // Product reviews / feedback
        reviews: [],
        reviewsLoading: false,
        reviewsTotal: 0,
        reviewsPage: 1,
        reviewsTotalPages: 1,
        reviewSummary: { rating: 0, numReviews: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        reviewSubmitting: false,
        reviewError: null,
        reviewMessage: '',
    },
    reducers: {
        clearProductError: (state) => {
            state.error = null;
        },
        clearProduct: (state) => {
            state.product = null;
        },
        clearReviewFeedback: (state) => {
            state.reviewError = null;
            state.reviewMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload.data;
                state.products = data.products || [];
                state.totalProducts = data.totalProducts || 0;
                state.totalPages = data.totalPages || 1;
                state.page = data.page || 1;
                state.limit = data.limit || 12;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch product details
            .addCase(fetchProductDetails.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchProductDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.product = action.payload.data.product;
            })
            .addCase(fetchProductDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload;
            })
            // Trending products
            .addCase(fetchTrendingProducts.pending, (state) => {
                state.trendingLoading = true;
            })
            .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
                state.trendingLoading = false;
                state.trendingProducts = action.payload.data?.products || [];
            })
            .addCase(fetchTrendingProducts.rejected, (state) => {
                state.trendingLoading = false;
            })
            // Search products
            .addCase(searchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data?.products || [];
            })
            .addCase(searchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ─── Product Reviews / Feedback ───
            .addCase(fetchProductReviews.pending, (state) => {
                state.reviewsLoading = true;
                state.reviewError = null;
            })
            .addCase(fetchProductReviews.fulfilled, (state, action) => {
                state.reviewsLoading = false;
                const data = action.payload.data;
                state.reviews = data.reviews || [];
                state.reviewsTotal = data.total || 0;
                state.reviewsPage = data.page || 1;
                state.reviewsTotalPages = data.totalPages || 1;
                state.reviewSummary = data.summary || state.reviewSummary;
            })
            .addCase(fetchProductReviews.rejected, (state, action) => {
                state.reviewsLoading = false;
                state.reviewError = action.payload;
            })
            .addCase(submitReview.pending, (state) => {
                state.reviewSubmitting = true;
                state.reviewError = null;
                state.reviewMessage = '';
            })
            .addCase(submitReview.fulfilled, (state, action) => {
                state.reviewSubmitting = false;
                state.reviewMessage = action.payload.message;
                const data = action.payload.data;
                // নিজের review list-এ upsert (আগে থাকলে replace, না থাকলে উপরে যোগ)
                const idx = state.reviews.findIndex(
                    (r) => String(r._id) === String(data.review._id)
                );
                if (idx >= 0) state.reviews[idx] = data.review;
                else state.reviews.unshift(data.review);
                state.reviewsTotal = data.summary.numReviews;
                state.reviewSummary = data.summary;
                // product-এর rating summary-ও সাথে সাথে update
                if (state.product) {
                    state.product.rating = data.summary.rating;
                    state.product.numReviews = data.summary.numReviews;
                }
            })
            .addCase(submitReview.rejected, (state, action) => {
                state.reviewSubmitting = false;
                state.reviewError = action.payload;
            })
            .addCase(toggleReviewHelpful.fulfilled, (state, action) => {
                const idx = state.reviews.findIndex(
                    (r) => String(r._id) === String(action.payload.reviewId)
                );
                if (idx >= 0 && action.payload.data?.review) {
                    state.reviews[idx] = action.payload.data.review;
                }
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.reviews = state.reviews.filter(
                    (r) => String(r._id) !== String(action.payload.reviewId)
                );
                state.reviewsTotal = action.payload.data?.summary?.numReviews ?? state.reviewsTotal;
                if (action.payload.data?.summary) {
                    state.reviewSummary = action.payload.data.summary;
                    if (state.product) {
                        state.product.rating = action.payload.data.summary.rating;
                        state.product.numReviews = action.payload.data.summary.numReviews;
                    }
                }
                state.reviewMessage = action.payload.message;
            });
    },
});

export const { clearProductError, clearProduct, clearReviewFeedback } = productSlice.actions;
export default productSlice.reducer;