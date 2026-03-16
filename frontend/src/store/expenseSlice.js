import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { expenseService, settlementService } from '../services'

export const fetchExpenses = createAsyncThunk(
    'expenses/fetch',
    async (groupId, { rejectWithValue }) => {
        try {
        return await expenseService.getByGroup(groupId)
        } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed')
        }
    }
)

export const fetchAllExpenses = createAsyncThunk('expenses/fetchAll', async (_, { rejectWithValue }) => {
    try { 
        return await expenseService.getAll() 
    }
    catch (err) { 
        return rejectWithValue(err.response?.data?.message || 'Failed') 
    }
})

export const addExpense = createAsyncThunk(
    'expenses/add',
    async (data, { rejectWithValue }) => {
        try {
        return await expenseService.add(data)
        } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed')
        }
    }
)

export const deleteExpense = createAsyncThunk(
    'expenses/delete',
    async (id, { rejectWithValue }) => {
        try {
        await expenseService.delete(id)
        return id
        } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed')
        }
    }
)

export const fetchSettlementPlan = createAsyncThunk(
    'expenses/settlements',
    async (groupId, { rejectWithValue }) => {
        try {
        return await settlementService.getPlan(groupId)
        } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed')
        }
    }
)

const expenseSlice = createSlice({
    name: 'expenses',
    initialState: {
        list: [],
        allExpenses: [],
        settlements: [],
        loading: false,
        settleLoading: false,
        error: null,
    },

    reducers: {
        clearExpenses(state) {
        state.list = []
        state.settlements = []
        },
    },

    extraReducers: (builder) => {
        builder
        .addCase(fetchExpenses.pending, (state) => {
            state.loading = true
            state.error = null
        })

        .addCase(fetchExpenses.fulfilled, (state, action) => {
            state.loading = false
            state.list = action.payload
        })

        .addCase(fetchExpenses.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })

        .addCase(addExpense.fulfilled, (state, action) => {
            state.list.unshift(action.payload)
        })

        .addCase(deleteExpense.fulfilled, (state, action) => {
            state.list = state.list.filter((expense) => expense.id !== action.payload)
        })

        .addCase(fetchSettlementPlan.pending, (state) => {
            state.settleLoading = true
        })

        .addCase(fetchSettlementPlan.fulfilled, (state, action) => {
            state.settleLoading = false
            state.settlements = action.payload
        })

        .addCase(fetchSettlementPlan.rejected, (state) => {
            state.settleLoading = false
        })
        .addCase(fetchAllExpenses.pending, state => { 
            state.allLoading = true 
        })
        .addCase(fetchAllExpenses.fulfilled, (state, a) => { 
            state.allLoading = false; state.allExpenses = a.payload 
        })
        .addCase(fetchAllExpenses.rejected, state => { 
            state.allLoading = false 
        })
    },
})

export const { clearExpenses } = expenseSlice.actions
export default expenseSlice.reducer