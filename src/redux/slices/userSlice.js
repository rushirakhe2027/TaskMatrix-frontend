import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/users');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const updateMe = createAsyncThunk('users/updateMe', async (userData, { rejectWithValue }) => {
    try {
        const config = {
            headers: {
                'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await API.patch('/users/updateMe', userData, config);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data.users;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
