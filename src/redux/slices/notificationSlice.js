import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// For now, mocking notifications since backend routes might not be ready
// But structured to be easily switched to real API calls

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
    try {
        // const response = await API.get('/notifications');
        // return response.data;

        // Mock data for initial implementation
        return {
            data: {
                notifications: [
                    { _id: '1', title: 'Task Assigned', message: 'New deployment task', type: 'task_assigned', isRead: false, createdAt: new Date().toISOString() },
                    { _id: '2', title: 'Mention', message: 'Review the latest UI changes', type: 'mention', isRead: false, createdAt: new Date().toISOString() }
                ]
            }
        };
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        loading: false,
    },
    reducers: {
        markAsRead: (state, action) => {
            const index = state.notifications.findIndex(n => n._id === action.payload);
            if (index !== -1) {
                state.notifications[index].isRead = true;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.isRead = true);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.data.notifications;
            });
    }
});

export const { markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
