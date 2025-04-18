import { createSlice } from "@reduxjs/toolkit"

const productsSlice = createSlice({
    name: "products",
    initialState: {
        allProducts: null,
        refresh: false,
    },
    reducers: {
        getAllProducts: (state, action) => {
            state.allProducts = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllProducts, getRefresh } = productsSlice.actions
export default productsSlice.reducer