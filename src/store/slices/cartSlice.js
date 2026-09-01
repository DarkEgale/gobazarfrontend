import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCart = () => {
    try {
        const stored = localStorage.getItem('gobazar_cart');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadCart(),
        isOpen: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existing = state.items.find((item) => item._id === product._id);
            if (existing) {
                existing.quantity += 1;
            } else {
                state.items.push({ ...product, quantity: 1 });
            }
            localStorage.setItem('gobazar_cart', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            localStorage.setItem('gobazar_cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find((i) => i._id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
            localStorage.setItem('gobazar_cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.setItem('gobazar_cart', JSON.stringify(state.items));
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        closeCart: (state) => {
            state.isOpen = false;
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } = cartSlice.actions;

// Selectors
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

export default cartSlice.reducer;