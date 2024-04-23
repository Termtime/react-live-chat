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
    setUserListOpen: (state, action) => {
      state.userList.isExpanded = action.payload;
      if (window.innerWidth < 768) {
        state.chatList.isExpanded = false;
      }
    },
    setChatListOpen: (state, action) => {
      state.chatList.isExpanded = action.payload;
      if (window.innerWidth < 768) {
        state.userList.isExpanded = false;
      }
    },
    setNewRoomModalOpen: (state, action) => {
      state.newRoomModal.isOpen = action.payload;
    },
  },
});

export const {setUserListOpen, setChatListOpen, setNewRoomModalOpen} =
  uiSlice.actions;

export default uiSlice.reducer;
