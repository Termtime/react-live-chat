import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, Message, RoomHandshake, User, UserEncryptedMessage } from "../../../types";
import io from "socket.io-client";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../../../io/events";
import { decryptMessage, encryptMessage, getPrivateKey } from "../../../utils";

export interface ChatState {
    user: AuthUser | null;
    users: User[];
    messages: Message[];
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    roomId: string | null;
    typingUsers: User[];
    loading: boolean;
}

const initialState: ChatState = {
    user: null,
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
            if(state.roomId){
                state.socket?.emit("leaveRoom", state.roomId);
                state.socket?.close();
            }
            state = initialState as any;
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
            state.socket = socket as any;
            state.roomId = action.payload.room;
            state.user = {
                username: action.payload.username,
                id: socket.id,
                privateKey: getPrivateKey(),
            };
        },
        joinRoom: (state, action: PayloadAction<RoomHandshake>) => {
            state.socket?.emit("joinRoom", action.payload, (userList: User[]) => {
                state.loading = false;
                state.users = userList;
            });
        },
        userJoined: (state, action: PayloadAction<User>) => {
            state.users = [...state.users, action.payload];
        },
        userLeft: (state, action: PayloadAction<User>) => {
            state.users = state.users.filter(
                (user) => user.id !== action.payload.id
            );
        },
        startTyping: (state, action: PayloadAction<string>) => {
            state.socket?.emit("startedTyping", action.payload);
        },
        stopTyping: (state, action: PayloadAction<string>) => {
            state.socket?.emit("stoppedTyping", action.payload);
        },
        userStartedTyping: (state, action: PayloadAction<User>) => {
            state.typingUsers = [...state.typingUsers, action.payload];
        },
        userStoppedTyping: (state, action: PayloadAction<User>) => {
            state.typingUsers = state.typingUsers.filter(
                (user) => user.id !== action.payload.id
            );
        },
        receivedMessage: (state, action: PayloadAction<UserEncryptedMessage>) => {
            // Decrypt message
            if(state.user && state.user.privateKey){
                try{
                    const decryptedMessage = decryptMessage(
                        action.payload.message,
                        state.user!.privateKey!
                    );
        
                    state.messages = [
                        ...state.messages,
                        decryptedMessage,
                    ];
                }catch(e){
                    console.error(e)
                }
            }

            console.error("Could not decrypt message. User is not authenticated.");
        },
        sendMessage: (state, action: PayloadAction<{message: Message, roomId: string}>) => {
            // Encrypt message
            const encryptedMessage = encryptMessage(
                action.payload.message,
                state.user?.privateKey as string
            )

            const userEncryptedMessage: UserEncryptedMessage = {
                message: encryptedMessage,
                recipientsPublicKeys: state.users.filter((user) => user.publicKey !== null).map((user) => user.publicKey!),
                roomId: action.payload.roomId,
            }

            

            state.socket?.emit("message", userEncryptedMessage);
            state.messages = [...state.messages, action.payload.message];
        }
        
    },
});

// Action creators are generated for each case reducer function
export const {
    leaveRoom,
    joinRoom,
    connectServer,
    userStartedTyping,
    sendMessage,
    receivedMessage,
    userStoppedTyping,
    userJoined,
    userLeft,
    startTyping,
    stopTyping,
} = chatSlice.actions;

export default chatSlice.reducer;
