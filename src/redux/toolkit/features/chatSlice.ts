import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import {
  AuthUser,
  Message,
  PublicAuthUser,
  RoomHandshake,
  User,
  UserEncryptedMessage,
} from "../../../types";
import {decryptMessage, encryptMessage, generateKeys} from "../../../utils";
import {PusherConnection} from "../../../io/connection";
import {RootState} from "../store";

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
  loading: false,
};

interface JoinRoomPayload {
  username: string;
  roomId: string;
}

export const joinRoom = createAsyncThunk(
  "chat/joinRoom",
  async ({username, roomId}: JoinRoomPayload, thunkAPI) => {
    const {privateKey, publicKey, symetricKey} = await generateKeys();

    const authUser: AuthUser = {
      username,
      privateKey,
      publicKey,
      symetricKey,
    };

    return {authUser, roomId};
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload: {message: Message; roomId: string}, thunkAPI) => {
    console.log("=========== SEND MESSAGE ===========\n", payload);
    const state = thunkAPI.getState() as RootState;
    const {user: authUser} = state.chat;
    const {message, roomId} = payload;

    console.log("user", authUser);

    if (!authUser || !roomId) {
      throw new Error("User or Room ID not set");
    }

    const encryptedMessages = [] as UserEncryptedMessage[];

    const channelMembers = state.chat.users.filter((u) => u.id !== authUser.id);

    for (const user of channelMembers) {
      if (user.publicKey) {
        const {
          encryptedMessage,
          encryptedSymetricKeyString,
          initializationVector,
        } = await encryptMessage(message, user.publicKey, authUser.symetricKey);
        const userEncryptedMessage: UserEncryptedMessage = {
          message: encryptedMessage,
          recipient: user,
          roomId,
          key: encryptedSymetricKeyString,
          iv: initializationVector,
        };

        encryptedMessages.push(userEncryptedMessage);
      } else {
        console.log("User does not have a public key set", user);
      }
    }

    return {message, encryptedMessages};
  }
);

export const receivedMessage = createAsyncThunk(
  "chat/receivedMessage",
  async (message: UserEncryptedMessage, thunkAPI) => {
    console.log("=========== RECEIVED MESSAGE ===========\n", message);
    const state = thunkAPI.getState() as RootState;
    const {user: authUser} = state.chat;

    if (!authUser) {
      throw new Error("User not set");
    }

    const decryptedMessage = await decryptMessage(
      message.message,
      message.key,
      message.iv,
      authUser.privateKey
    );

    return {message: decryptedMessage, roomId: message.roomId};
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    leaveRoom: (state) => {
      console.log("Leave Room");
      const pusher = PusherConnection.getInstance().getPusher();

      if (state.roomId) {
        pusher.send_event("leaveRoom", state.roomId);
      }
      console.log("Setting state");

      state.loading = state.loading;
      state.user = initialState.user;
      state.users = initialState.users;
      state.messages = initialState.messages;
      state.roomId = initialState.roomId;
      state.typingUsers = initialState.typingUsers;
    },
    handshakeAcknowledge: (
      state,
      action: PayloadAction<{users: User[]; socketId: string}>
    ) => {
      console.log(
        "=========== HANDSHAKE RESPONSE ===========\n",
        action.payload
      );
      state.users = action.payload.users;
      state.loading = false;
      state.user!.id = action.payload.socketId;
      state.user!.color = action.payload.users.find(
        (u) => u.id === action.payload.socketId
      )?.color;

      console.log(
        "state",
        action.payload.users.find((u) => u.id === action.payload.socketId)
      );
    },
    userJoined: (state, action: PayloadAction<User>) => {
      console.log("=========== USER JOINED ===========\n", action.payload);
      state.users = [...state.users, action.payload];
    },
    userLeft: (state, action: PayloadAction<User>) => {
      console.log("=========== USER LEFT ===========\n", action.payload);
      state.users = state.users.filter((user) => user.id !== action.payload.id);
    },
    startTyping: (state, action: PayloadAction<string>) => {
      console.log("=========== START TYPING ===========\n", action.payload);
      const pusher = PusherConnection.getInstance().getPusher();
      pusher.send_event("startedTyping", action.payload);
    },
    stopTyping: (state, action: PayloadAction<string>) => {
      console.log("=========== STOP TYPING ===========\n", action.payload);
      const pusher = PusherConnection.getInstance().getPusher();

      pusher.send_event("stoppedTyping", action.payload);
    },
    userStartedTyping: (state, action: PayloadAction<User>) => {
      console.log(
        "=========== USER STARTED TYPING ===========\n",
        action.payload
      );
      state.typingUsers = [...state.typingUsers, action.payload];
    },
    userStoppedTyping: (state, action: PayloadAction<User>) => {
      console.log(
        "=========== USER STOPPED TYPING ===========\n",
        action.payload
      );
      state.typingUsers = state.typingUsers.filter(
        (user) => user.id !== action.payload.id
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinRoom.pending, (state) => {
      state.loading = true;
      console.log("Loading...");
    });
    builder.addCase(joinRoom.rejected, (state, action) => {
      state.loading = false;
      console.log("ERROR joining room", action.error);
    });
    builder.addCase(joinRoom.fulfilled, (state, action) => {
      const socket = PusherConnection.getInstance().getPusher();

      const publicAuthUser: PublicAuthUser = {
        username: action.payload.authUser.username,
        publicKey: action.payload.authUser.publicKey,
      };
      const handshakeInfo: RoomHandshake = {
        roomId: action.payload.roomId,
        user: publicAuthUser,
      };

      console.log("=========== JOINING ROOM... ===========");
      socket.send_event("joinRoom", handshakeInfo);
      state.roomId = action.payload.roomId;
      state.user = action.payload.authUser;
    });

    builder.addCase(sendMessage.rejected, (state, action) => {
      console.log("ERROR sending message", action.error);
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const socket = PusherConnection.getInstance().getPusher();

      console.log("=========== SENDING MESSAGE ===========\n", action.payload);

      socket.send_event("message", action.payload.encryptedMessages);

      state.messages = [...state.messages, action.payload.message];
    });

    builder.addCase(receivedMessage.rejected, (state, action) => {
      console.log("ERROR decrypting message", action.error);
    });
    builder.addCase(receivedMessage.fulfilled, (state, action) => {
      state.messages = [...state.messages, action.payload.message];
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  leaveRoom,
  userStartedTyping,
  userStoppedTyping,
  userJoined,
  userLeft,
  startTyping,
  stopTyping,
  handshakeAcknowledge,
} = chatSlice.actions;

export default chatSlice.reducer;
