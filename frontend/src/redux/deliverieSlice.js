import { createSlice } from "@reduxjs/toolkit"

const deliveriesSlice = createSlice({
    name: "deliveries",
    initialState: {
        allDeliveries: null,
        refresh: false,
    },
    reducers: {
        getAllDeliveries: (state, action) => {
            state.allDeliveries = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllDeliveries, getRefresh } = deliveriesSlice.actions
export default deliveriesSlice.reducer