import { createSlice } from "@reduxjs/toolkit"

const purchasesSlice = createSlice({
    name: "purchases",
    initialState: {
        allPurchases: null,
        refresh: false,
    },
    reducers: {
        getAllPurchases: (state, action) => {
            state.allPurchases = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllPurchases, getRefresh } = purchasesSlice.actions
export default purchasesSlice.reducer