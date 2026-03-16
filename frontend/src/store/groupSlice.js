import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { groupService } from '../services'

export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue})=>{
    try { 
        return await groupService.getAll() 
    }
    catch (err) { 
        return rejectWithValue(err.response?.data?.message || 'Failed to load groups')
    }
})
export const fetchGroupById = createAsyncThunk('groups/fetchById', async (id, { rejectWithValue }) => {
    try { 
        return await groupService.getById(id) 
    }
    catch (err) { 
        return rejectWithValue(err.response?.data?.message || 'Failed to load group') 
    }
})
export const createGroup = createAsyncThunk('groups/create', async(data, { rejectWithValue }) => {
    try {
        return await groupService.create(data) 
    }
    catch (err){
        return rejectWithValue(err.response?.data?.message || 'Failed to create group')
    }
})

export const leaveGroup = createAsyncThunk('groups/leave', async (id, { rejectWithValue }) => {
    try { 
        await groupService.leave(id); 
        return id 
    }
    catch (err) { 
        return rejectWithValue(err.response?.data?.message || 'Failed to leave group') 
    }
})
export const deleteGroup = createAsyncThunk('groups/delete', async (id, { rejectWithValue }) => {
    try { 
        await groupService.delete(id); 
        return id 
    }
    catch (err) { 
        return rejectWithValue(err.response?.data?.message || 'Failed to delete group') 
    }
})


const groupSlice = createSlice({
    name: 'groups',
    initialState: {
        list:[],
        current:null,
        loading:false,
        currentLoading:false,
        error:null,
    },
    reducers: {
        clearCurrent(state) { 
            state.current = null 
        }
    },
    extraReducers: builder => {
        builder
        .addCase(fetchGroups.pending, state =>{
            state.loading = true; state.error = null 
        })
        .addCase(fetchGroups.fulfilled,(state, a) => { 
            state.loading = false; state.list = a.payload 
        })
        .addCase(fetchGroups.rejected,(state, a) => { 
            state.loading = false; state.error = a.payload 
        })
        .addCase(fetchGroupById.pending,state => { 
            state.currentLoading = true 
        })
        .addCase(fetchGroupById.fulfilled,(state, a) => {
            state.currentLoading = false; state.current = a.payload 
        })
        .addCase(fetchGroupById.rejected,(state, a) => { 
            state.currentLoading = false; state.error = a.payload 
        })
        .addCase(createGroup.fulfilled,(state, a) => { 
            state.list.unshift(a.payload) 
        })
        .addCase(leaveGroup.fulfilled, (state, a) => {
            state.list = state.list.filter(g => g.id !== a.payload)
            state.current = null
        })
        .addCase(deleteGroup.fulfilled, (state, a) => {
            state.list = state.list.filter(g => g.id !== a.payload)
            state.current = null
        })
    }
})

export const {clearCurrent} = groupSlice.actions
export default groupSlice.reducer