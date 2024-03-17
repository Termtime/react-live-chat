import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import {
  AuthUser,
  Message,
  PublicAuthUser,
  User,
  UserEncryptedMessage,
} from "../../../types";
import {decryptMessage, encryptMessage, generateKeys} from "../../../utils";
import {PusherConnection} from "../../../pusher/connection";
import {RootState} from "../store";
import {PUSHER_CLIENT_EVENT} from "../../../types/events";
import {signOut} from "next-auth/react";

export interface Room {
  id: string;
  name: string;
  users: User[];
}
export interface ChatState {
  /**
   * The user that is currently logged in
   */
  authUser: AuthUser | null;
  /**
   * The messages in the current room
   */
  messages: Message[];
  /**
   * The room that the user is currently in
   */
  room: Room | null;
  /**
   * Users that are currently typing
   */
  typingUsers: User[];
  /**
   * Whether the room is currently being connected to
   */
  isLoadingRoom: boolean;
}

const initialState: ChatState = {
  authUser: null,
  messages: [],
  room: null,
  typingUsers: [],
  isLoadingRoom: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async (username: string, thunkAPI) => {
    const {privateKey, publicKey, symetricKey} = await generateKeys();

    const authUser: AuthUser = {
      username,
      privateKey,
      publicKey,
      symetricKey,
    };

    PusherConnection.setup(publicKey);

    return authUser;
  }
);

export const joinRoom = createAsyncThunk(
  "chat/joinRoom",
  async (roomId: string) => {
    const pusherConnection = PusherConnection.getInstance();
    const {room, myId} = await pusherConnection.connectToChannel(roomId);

    return {room, myId};
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload: {message: Message; roomId: string}, thunkAPI) => {
    console.log("=========== SEND MESSAGE ===========\n", payload);
    const state = thunkAPI.getState() as RootState;
    const {authUser} = state.chat;
    const {message, roomId} = payload;

    if (!authUser || !roomId) {
      throw new Error("User not logged in or Room ID not passed");
    }

    const encryptedMessages = [] as UserEncryptedMessage[];

    const channelMembers = state.chat.room!.users.filter(
      (u) => u.id !== authUser.id
    );

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
  async (messageArray: UserEncryptedMessage[], thunkAPI) => {
    console.log("=========== RECEIVED MESSAGE ===========\n", messageArray);
    const state = thunkAPI.getState() as RootState;
    const {authUser: authUser} = state.chat;

    if (!authUser) {
      throw new Error("User not set");
    }

    const messageForMe = messageArray.find(
      (m) => m.recipient.id === authUser.id
    );

    if (!messageForMe) {
      console.log("No message for me, returning");
      return;
    }

    const decryptedMessage = await decryptMessage(
      messageForMe.message,
      messageForMe.key,
      messageForMe.iv,
      authUser.privateKey
    );

    return {message: decryptedMessage, roomId: messageForMe.roomId};
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    logout: (state) => {
      console.log("=========== LEAVING ROOM ===========", state.room!.id);
      PusherConnection.getInstance().disconnect();
      signOut();
      state = initialState;
    },
    userJoined: (state, action: PayloadAction<User>) => {
      console.log("=========== USER JOINED ===========\n", action.payload);
      state.room!.users = [...state.room!.users, action.payload];
    },
    userLeft: (state, action: PayloadAction<User>) => {
      console.log("=========== USER LEFT ===========\n", action.payload);
      state.room!.users = state.room!.users.filter(
        (user) => user.id !== action.payload.id
      );
    },
    startTyping: (state, action: PayloadAction<string>) => {
      console.log("=========== START TYPING ===========\n", action.payload);
      const roomId = action.payload;
      if (!roomId) {
        console.log("Room ID is null, returning");
        return;
      }
      const pusher = PusherConnection.getInstance().getPusher();
      pusher.send_event(PUSHER_CLIENT_EVENT.START_TYPING, {}, roomId);
    },
    stopTyping: (state, action: PayloadAction<string>) => {
      console.log("=========== STOP TYPING ===========\n", action.payload);
      const roomId = action.payload;
      if (!roomId) {
        console.log("Room ID is null, returning");
        return;
      }
      const pusher = PusherConnection.getInstance().getPusher();

      pusher.send_event(PUSHER_CLIENT_EVENT.STOP_TYPING, {}, roomId);
    },
    userStartedTyping: (state, action: PayloadAction<string>) => {
      console.log(
        "=========== USER STARTED TYPING ===========\n",
        action.payload
      );

      const user = state.room!.users.find((u) => u.id === action.payload);

      if (user === undefined) {
        console.log("User not found, ignoring typing event");
        return;
      }

      state.typingUsers = [...state.typingUsers, user];
    },
    userStoppedTyping: (state, action: PayloadAction<string>) => {
      console.log(
        "=========== USER STOPPED TYPING ===========\n",
        action.payload
      );

      state.typingUsers = state.typingUsers.filter(
        (user) => user.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinRoom.pending, (state) => {
      state.isLoadingRoom = true;

      console.log("Loading...");
    });
    builder.addCase(joinRoom.rejected, (state, action) => {
      state.isLoadingRoom = false;
      console.log("ERROR joining room", action.error);
    });
    builder.addCase(joinRoom.fulfilled, (state, action) => {
      console.log("=========== JOINED ROOM ===========");
      state.room = action.payload.room;
      state.authUser!.id = action.payload.myId;
    });

    builder.addCase(sendMessage.rejected, (state, action) => {
      console.log("ERROR sending message", action.error);
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const pusher = PusherConnection.getInstance().getPusher();

      console.log(
        "=========== SENDING MESSAGE ===========\n",
        action.payload,
        state.room!.id
      );

      pusher.send_event(
        PUSHER_CLIENT_EVENT.MESSAGE,
        action.payload.encryptedMessages,
        state.room!.id
      );

      state.messages = [...state.messages, action.payload.message];
    });

    builder.addCase(receivedMessage.rejected, (state, action) => {
      console.log("ERROR decrypting message", action.error);
    });
    builder.addCase(receivedMessage.fulfilled, (state, action) => {
      if (action.payload) {
        state.messages = [...state.messages, action.payload.message];
      }
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.authUser = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      console.log("ERROR logging in", action.error);
    });
    builder.addCase(login.pending, (state) => {
      console.log("Loading...");
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  logout,
  userStartedTyping,
  userStoppedTyping,
  userJoined,
  userLeft,
  startTyping,
  stopTyping,
} = chatSlice.actions;

export default chatSlice.reducer;
