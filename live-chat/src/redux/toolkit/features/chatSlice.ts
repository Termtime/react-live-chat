import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Message, RoomHandshake, User } from "../../../types";
import io from "socket.io-client";
import { Socket } from "socket.io-client";

export interface ChatState {
    ownUser: User | null;
    users: User[];
    messages: Message[];
    socket: Socket | null;
    roomId: string | null;
    typingUsers: User[];
    loading: boolean;
}

const initialState: ChatState = {
    ownUser: null,
    users: [],
    messages: [],
    socket: null,
    roomId: null,
    typingUsers: [],
    loading: true,
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        leaveRoom: (state) => {
            state = initialState;
        },
        connectServer: (
            state,
            action: PayloadAction<{ username: string, room: string }>
        ) => {
            require("dotenv").config();
            const url =
                process.env.NODE_ENV !== "production"
                    ? "http://localhost:8000"
                    : "https://termtime-live-chat.herokuapp.com";

            const socket = io(url);
            state.socket = socket;
            state.roomId = action.payload.room;
            state.ownUser = {
                username: action.payload.username,
                id: socket?.id,
            };
        },
        joinRoom: (state, action: PayloadAction<RoomHandshake>) => {
            state.socket?.emit("presentation", action.payload);
            state.loading = false;
        },
        userJoined: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        isTyping: (state, action: PayloadAction<User>) => {
            state.typingUsers = [...state.typingUsers, action.payload];
        },
        stoppedTyping: (state, action: PayloadAction<User>) => {
            state.typingUsers = state.typingUsers.filter(
                (user) => user.id !== action.payload.id
            );
        },
        receivedMessage: (state, action: PayloadAction<Message>) => {
            state.messages = [...state.messages, action.payload];
        },
        sendMessage: (state, action: PayloadAction<Message>) => {
            state.messages = [...state.messages, action.payload];
        },
        updateUserList: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    leaveRoom,
    joinRoom,
    connectServer,
    isTyping,
    receivedMessage,
    stoppedTyping,
    userJoined,
    sendMessage,
    updateUserList,
} = chatSlice.actions;

export default chatSlice.reducer;
