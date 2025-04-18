import { createSlice } from "@reduxjs/toolkit"

const invoicesSlice = createSlice({
    name: "invoices",
    initialState: {
        allInvoices: null,
        refresh: false,
    },
    reducers: {
        getAllInvoices: (state, action) => {
            state.allInvoices = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllInvoices, getRefresh } = invoicesSlice.actions
export default invoicesSlice.reducer