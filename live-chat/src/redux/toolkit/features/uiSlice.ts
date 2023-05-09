import {createSlice} from "@reduxjs/toolkit";

export interface UserListState {
  isExpanded: boolean;
}

export interface UIState {
  userList: UserListState;
}

const initialState: UIState = {
  userList: {
    isExpanded: false,
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleUserList: (state) => {
      state.userList.isExpanded = !state.userList.isExpanded;
    },
  },
});

export const {toggleUserList} = uiSlice.actions;

export default uiSlice.reducer;
