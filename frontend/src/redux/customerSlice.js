import { createSlice } from "@reduxjs/toolkit"

const customersSlice = createSlice({
    name: "customers",
    initialState: {
        allCustomers: null,
        refresh: false,
    },
    reducers: {
        getAllCustomers: (state, action) => {
            state.allCustomers = action.payload
        },
        getRefresh: (state, action) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllCustomers, getRefresh } = customersSlice.actions
export default customersSlice.reducer