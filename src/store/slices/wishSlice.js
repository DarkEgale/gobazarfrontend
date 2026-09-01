import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getApiUrl } from '../../config/apiConfig';


// ================= CREATE / TOGGLE WISHLIST =================

export const createWish = createAsyncThunk(
    'wish/toggle-wish',

    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.CREATE_WISH),
                { productId },
                { withCredentials: true }
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to update wishlist'
            );
        }
    }
);


// ================= GET WISHLIST =================

export const getWish = createAsyncThunk(
    'wish/get-wish',

    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                getApiUrl(API_ENDPOINTS.GET_WISH),
                {
                    withCredentials: true
                }
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to fetch wishlist'
            );
        }
    }
);


// ================= SLICE =================

const wishSlice = createSlice({
    name: 'wish',

    initialState: {
        wishlist: [],
        totalwish: 0,
        error: null,
        loading: false
    },

    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // ================= CREATE / TOGGLE =================

            .addCase(createWish.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createWish.fulfilled, (state, action) => {
                state.loading = false;

                const {
                    action: wishAction,
                    data
                } = action.payload;

                // ADD
                if (wishAction === 'added') {
                    state.wishlist.push(data);
                }

                // REMOVE
                if (wishAction === 'removed') {
                    state.wishlist = state.wishlist.filter(
                        (item) =>
                            item.productId?.toString() !==
                            data.productId?.toString()
                    );
                }

                state.totalwish = state.wishlist.length;
            })

            .addCase(createWish.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // ================= GET WISHLIST =================

            .addCase(getWish.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getWish.fulfilled, (state, action) => {
                state.loading = false;

                state.wishlist = action.payload.data;

                state.totalwish = state.wishlist.length;
            })

            .addCase(getWish.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});


export const { clearError } = wishSlice.actions;

export default wishSlice.reducer;