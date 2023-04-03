import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, Message, PublicAuthUser, RoomHandshake, User, UserEncryptedMessage } from "../../../types";
import { decryptMessage, encryptMessage, generateKeys } from "../../../utils";
import { SocketConnection } from "../../../io/connection";

export interface ChatState {
    user: AuthUser | null;
    users: User[];
    messages: Message[];
    roomId: string | null;
    typingUsers: User[];
    loading: boolean;
}

const initialState: ChatState = {
    user: null,
    users: [],
    messages: [],
    roomId: null,
    typingUsers: [],
    loading: true,
};

interface JoinRoomPayload {
    username: string;
    roomId: string;
}

export const joinRoom = createAsyncThunk(
    'chat/joinRoom',
    async ({username, roomId } :JoinRoomPayload, thunkAPI) => {
        const {privateKey, publicKey} = generateKeys();

        const authUser: AuthUser = {
            username,
            privateKey,
            publicKey,
        }

        console.log(authUser);

       return { authUser, roomId};
    }
  )

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        leaveRoom: (state) => {
            console.log("Leave Room")
            const socket = SocketConnection.getInstance().getSocket();
            
            if(state.roomId){
                socket.emit("leaveRoom", state.roomId);
            } 
            state = initialState as any;
        },
        handshakeAcknowledge: (state, action: PayloadAction<{users: User[], socketId: string }>) => {
            console.log("=========== HANDSHAKE RESPONSE ===========\n", action.payload)
            state.users = action.payload.users;
            state.loading = false;
            state.user!.id = action.payload.socketId;
        },
        userJoined: (state, action: PayloadAction<User>) => {
            console.log("=========== USER JOINED ===========\n", action.payload)
            state.users = [...state.users, action.payload];
        },
        userLeft: (state, action: PayloadAction<User>) => {
            console.log("=========== USER LEFT ===========\n", action.payload)
            state.users = state.users.filter(
                (user) => user.id !== action.payload.id
            );
        },
        startTyping: (state, action: PayloadAction<string>) => {
            console.log("=========== START TYPING ===========\n", action.payload)
            const socket = SocketConnection.getInstance().getSocket();
            socket.emit("startedTyping", action.payload);
        },
        stopTyping: (state, action: PayloadAction<string>) => {
            console.log("=========== STOP TYPING ===========\n", action.payload)
        const socket = SocketConnection.getInstance().getSocket();

            socket.emit("stoppedTyping", action.payload);
        },
        userStartedTyping: (state, action: PayloadAction<User>) => {
            console.log("=========== USER STARTED TYPING ===========\n", action.payload)
            state.typingUsers = [...state.typingUsers, action.payload];
        },
        userStoppedTyping: (state, action: PayloadAction<User>) => {
            console.log("=========== USER STOPPED TYPING ===========\n", action.payload)
            state.typingUsers = state.typingUsers.filter(
                (user) => user.id !== action.payload.id
            );
        },
        receivedMessage: (state, action: PayloadAction<UserEncryptedMessage>) => {
            console.log("=========== RECEIVED MESSAGE ===========\n", action.payload)
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
            console.log("=========== SEND MESSAGE ===========\n", action.payload)
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

        const socket = SocketConnection.getInstance().getSocket();


            socket.emit("message", userEncryptedMessage);
            state.messages = [...state.messages, action.payload.message];
            console.log("Message sent", userEncryptedMessage)
        }
        
    },
    extraReducers: (builder) => {
        builder.addCase(joinRoom.pending, (state) => {
            state.loading = true;
            console.log("Loading...")
        });
        builder.addCase(joinRoom.rejected, (state, action) => {
            state.loading = false;
            console.log("ERROR joining room", action.error)
        });
        builder.addCase(joinRoom.fulfilled, (state, action) => {
            const socket = SocketConnection.getInstance().getSocket();
            
            const publicAuthUser : PublicAuthUser = {
                username: action.payload.authUser.username,
                publicKey: action.payload.authUser.publicKey,
            }
            const handshakeInfo: RoomHandshake = {
                roomId: action.payload.roomId,
                user: publicAuthUser,
            }

            console.log("=========== JOINING ROOM... ===========")
            socket.emit("joinRoom", handshakeInfo);
            state.roomId = action.payload.roomId;
            state.user = action.payload.authUser;
        })
    },
});

// Action creators are generated for each case reducer function
export const {
    leaveRoom,
    userStartedTyping,
    sendMessage,
    receivedMessage,
    userStoppedTyping,
    userJoined,
    userLeft,
    startTyping,
    stopTyping,
    handshakeAcknowledge
} = chatSlice.actions;

export default chatSlice.reducer;
