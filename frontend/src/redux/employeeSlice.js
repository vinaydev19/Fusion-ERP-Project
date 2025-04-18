import { createSlice } from "@reduxjs/toolkit"

const employeesSlice = createSlice({
    name: "employees",
    initialState: {
        allEmployees: null,
        refresh: false,
    },
    reducers: {
        getAllEmployees: (state, action) => {
            state.allEmployees = action.payload
        },
        getRefresh: (state) => {
            state.refresh = !state.refresh
        }
    }
})

export const { getAllEmployees, getRefresh } = employeesSlice.actions
export default employeesSlice.reducer