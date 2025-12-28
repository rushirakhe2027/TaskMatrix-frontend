import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchConversations = createAsyncThunk('messages/fetchConversations', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/messages/conversations');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchMessages = createAsyncThunk('messages/fetchByPartner', async (partnerId, { rejectWithValue }) => {
    try {
        const response = await API.get(`/messages/${partnerId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchProjectMessages = createAsyncThunk('messages/fetchByProject', async (projectId, { rejectWithValue }) => {
    try {
        const response = await API.get(`/messages/project/${projectId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const sendMessageAsync = createAsyncThunk('messages/send', async (msgData, { rejectWithValue }) => {
    try {
        const config = {
            headers: {
                'Content-Type': msgData instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        };
        const response = await API.post('/messages', msgData, config);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        conversations: [],
        currentMessages: [],
        loading: false,
        error: null,
    },
    reducers: {
        addMessage: (state, action) => {
            state.currentMessages.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversations = action.payload.data.latestMessages;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.currentMessages = action.payload.data.messages;
            })
            .addCase(fetchProjectMessages.fulfilled, (state, action) => {
                state.currentMessages = action.payload.data.messages;
            })
            .addCase(sendMessageAsync.fulfilled, (state, action) => {
                state.currentMessages.push(action.payload.data.message);
            });
    },
});

export const { addMessage } = messageSlice.actions;
export default messageSlice.reducer;
