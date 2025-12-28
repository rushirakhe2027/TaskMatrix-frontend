import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await API.post('/auth/login', credentials);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
    try {
        const config = userData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await API.post('/auth/signup', userData, config);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/auth/me');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('refreshToken', action.payload.refreshToken);
                localStorage.setItem('user', JSON.stringify(action.payload.data.user));
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
            .addCase(signup.pending, (state) => {
                state.loading = true;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('refreshToken', action.payload.refreshToken);
                localStorage.setItem('user', JSON.stringify(action.payload.data.user));
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Signup failed';
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.user = action.payload.data.user;
                localStorage.setItem('user', JSON.stringify(action.payload.data.user));
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
