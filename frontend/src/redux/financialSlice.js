import { createSlice } from "@reduxjs/toolkit"

const financialsSlice = createSlice({
    name: "financials",
    initialState: {
        allFinancials: null,
        refresh: false,
    },
    reducers: {
        getAllFinancials: (state, action) => {
            state.allFinancials = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllFinancials, getRefresh } = financialsSlice.actions
export default financialsSlice.reducer