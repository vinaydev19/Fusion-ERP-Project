import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    otherUsers:[],
    profile: {},
  },
  reducers: {
    getUser: (state, action) => {
      state.user = action.payload;
    },
    getMyProfile: (state, action) => {
      state.profile = action.payload;
    },
    getOtherUsers:(state,action)=>{
      state.otherUsers = action.payload;
  },
  },
});

export const { getUser, getMyProfile, getOtherUsers } = userSlice.actions;

export default userSlice.reducer;
