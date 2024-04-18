import {createSlice} from "@reduxjs/toolkit";

export interface UserListState {
  isExpanded: boolean;
}

export interface UIState {
  userList: UserListState;
  chatList: UserListState;
  newRoomModal: {
    isOpen: boolean;
  };
}

const initialState: UIState = {
  userList: {
    isExpanded: false,
  },
  chatList: {
    isExpanded: true,
  },
  newRoomModal: {
    isOpen: true,
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleUserList: (state) => {
      state.userList.isExpanded = !state.userList.isExpanded;
    },
    setChatListOpen: (state, action) => {
      state.chatList.isExpanded = action.payload;
    },
    setNewRoomModalOpen: (state, action) => {
      state.newRoomModal.isOpen = action.payload;
    },
  },
});

export const {toggleUserList, setChatListOpen, setNewRoomModalOpen} =
  uiSlice.actions;

export default uiSlice.reducer;
