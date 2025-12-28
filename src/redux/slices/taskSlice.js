import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchBoardTasks = createAsyncThunk('tasks/fetchByBoard', async (boardId, { rejectWithValue }) => {
    try {
        const response = await API.get(`/tasks/board/${boardId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const updateTaskAsync = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await API.patch(`/tasks/${id}`, data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const createTaskAsync = createAsyncThunk('tasks/create', async (taskData, { rejectWithValue }) => {
    try {
        const response = await API.post('/tasks', taskData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMyTasks', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/tasks/my-tasks');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: [],
        loading: false,
        error: null,
    },
    reducers: {
        taskUpdated: (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            } else {
                state.tasks.push(action.payload);
            }
        },
        taskDeleted: (state, action) => {
            state.tasks = state.tasks.filter(t => t._id !== action.payload.id);
        },
        localTaskMove: (state, action) => {
            const { taskId, newColumnId, newOrder } = action.payload;
            const task = state.tasks.find(t => t._id === taskId);
            if (task) {
                task.columnId = newColumnId;
                task.order = newOrder;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoardTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBoardTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload.data.tasks;
            })
            .addCase(fetchMyTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload.data.tasks;
            })
            .addCase(createTaskAsync.fulfilled, (state, action) => {
                state.tasks.push(action.payload.data.task);
            });
    },
});

export const { taskUpdated, taskDeleted, localTaskMove } = taskSlice.actions;
export default taskSlice.reducer;
