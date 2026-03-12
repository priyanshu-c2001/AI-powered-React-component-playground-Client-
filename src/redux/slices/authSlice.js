import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/login', credentials);
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const signupUser = createAsyncThunk('auth/signup', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/signup', credentials);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await api.post('/logout');
    return null;
});

// Thunk to restore authentication from cookie on page load
export const restoreAuthFromCookie = createAsyncThunk('auth/restoreFromCookie', async (_, { rejectWithValue }) => {
    try {
        // Try to fetch sessions - this requires authentication
        // If the token cookie is valid, this will succeed and prove we're authenticated
        const response = await api.get('/session');
        // If we reach here, we're authenticated. Now we need to get user data
        // We'll make a simple request that returns user info
        // For now, we extract from localStorage or create a minimal user object
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            return { emailId: userEmail };
        }
        // If no email in storage, we could fetch it from a /me endpoint if it existed
        // For now, we'll just mark as authenticated
        return { emailId: 'User' };
    } catch (error) {
        return rejectWithValue('Not authenticated');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        authRestored: false, // Flag to track if we've checked for existing auth
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                // Store email in localStorage for persistence
                if (action.payload.emailId) {
                    localStorage.setItem('userEmail', action.payload.emailId);
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('userEmail');
            })
            .addCase(restoreAuthFromCookie.pending, (state) => {
                state.loading = true;
            })
            .addCase(restoreAuthFromCookie.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.authRestored = true;
            })
            .addCase(restoreAuthFromCookie.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.authRestored = true;
                localStorage.removeItem('userEmail');
            });
    },
});

export default authSlice.reducer;