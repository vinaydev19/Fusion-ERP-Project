import { createSlice } from "@reduxjs/toolkit"

const salesSlice = createSlice({
    name: "sales",
    initialState: {
        allSales: null,
        refresh: false,
    },
    reducers: {
        getAllsales: (state, action) => {
            state.allSales = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllsales, getRefresh } = salesSlice.actions
export default salesSlice.reducer