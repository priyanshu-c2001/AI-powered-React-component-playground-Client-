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
        // Try to fetch user data - this requires authentication
        // If the token cookie is valid, this will succeed and return user data
        const response = await api.get('/me');
        return response.data.user;
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
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
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
            });
    },
});

export default authSlice.reducer;