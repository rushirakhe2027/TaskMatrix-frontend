import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/projects');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const createProject = createAsyncThunk('projects/create', async (projectData, { rejectWithValue }) => {
    try {
        const response = await API.post('/projects', projectData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await API.patch(`/projects/${id}`, data);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchProjectById = createAsyncThunk('projects/fetchOne', async (projectId, { rejectWithValue }) => {
    try {
        const response = await API.get(`/projects/${projectId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchProjectBoards = createAsyncThunk('projects/fetchBoards', async (projectId, { rejectWithValue }) => {
    try {
        const response = await API.get(`/boards/project/${projectId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const deleteProject = createAsyncThunk('projects/delete', async (projectId, { rejectWithValue }) => {
    try {
        await API.delete(`/projects/${projectId}`);
        return projectId;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const projectSlice = createSlice({
    name: 'projects',
    initialState: {
        projects: [],
        currentProject: null,
        boards: [],
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload.data.projects;
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.currentProject = action.payload.data.project;
                // Also update the project in the projects array if it exists
                const index = state.projects.findIndex(p => p._id === action.payload.data.project._id);
                if (index !== -1) {
                    state.projects[index] = action.payload.data.project;
                }
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.projects.push(action.payload.data.project);
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.currentProject = action.payload.data.project;
                const index = state.projects.findIndex(p => p._id === action.payload.data.project._id);
                if (index !== -1) {
                    state.projects[index] = action.payload.data.project;
                }
            })
            .addCase(fetchProjectBoards.fulfilled, (state, action) => {
                state.boards = action.payload.data.boards;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.projects = state.projects.filter(p => p._id !== action.payload);
                if (state.currentProject?._id === action.payload) {
                    state.currentProject = null;
                }
            });
    },
});

export const { setCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
