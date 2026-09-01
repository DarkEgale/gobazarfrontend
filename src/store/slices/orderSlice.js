import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getApiUrl } from '../../config/apiConfig';

// ================= CREATE ORDER =================

export const createOrder = createAsyncThunk(
    'order/create-order',

    async ({ products, paymentMethod }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.CREATE_ORDER),
                { products, paymentMethod },
                { withCredentials: true }
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to create order'
            );
        }
    }
);

// ================= GET MY ORDERS =================

export const getOrders = createAsyncThunk(
    'order/get-orders',

    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                getApiUrl(API_ENDPOINTS.GET_ORDERS),
                { withCredentials: true }
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to fetch orders'
            );
        }
    }
);

// ================= GET ORDER BY ID =================

export const getOrderById = createAsyncThunk(
    'order/get-order-by-id',

    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${getApiUrl(API_ENDPOINTS.ORDER_DETAILS)}/${orderId}`,
                { withCredentials: true }
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to fetch order details'
            );
        }
    }
);

// ================= SLICE =================

const orderSlice = createSlice({
    name: 'order',

    initialState: {
        orders: [],
        totalOrders: 0,
        currentOrder: null,
        currentOrderLoading: false,
        loading: false,
        error: null,
        message: null
    },

    reducers: {
        clearOrderError: (state) => {
            state.error = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.currentOrderLoading = false;
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // ================= CREATE ORDER =================

            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;

                if (action.payload.data) {
                    state.orders.unshift(action.payload.data);
                    state.totalOrders = state.orders.length;
                }
            })

            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ================= GET ORDERS =================

            .addCase(getOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getOrders.fulfilled, (state, action) => {
                state.loading = false;

                state.orders = action.payload.data || [];
                state.totalOrders = state.orders.length;
            })

            .addCase(getOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ================= GET ORDER BY ID =================

            .addCase(getOrderById.pending, (state) => {
                state.currentOrderLoading = true;
                state.currentOrder = null;
                state.error = null;
            })

            .addCase(getOrderById.fulfilled, (state, action) => {
                state.currentOrderLoading = false;
                state.currentOrder = action.payload.data || null;
            })

            .addCase(getOrderById.rejected, (state, action) => {
                state.currentOrderLoading = false;
                state.currentOrder = null;
                state.error = action.payload;
            });
    }
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;