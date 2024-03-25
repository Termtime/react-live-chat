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

export interface RoomV2 {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  lastMessage: Message | null;
  typingUsers: User[];
  isLoading: boolean;
}
// TODO: finish removal of the interface
/**
 * @deprecated Use RoomV2 instead
 */
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
   * The rooms that the user is currently in
   */
  rooms: RoomV2[];

  currentRoomId: string | null;
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
  currentRoomId: null,
  rooms: [],
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
  async (payload: Message, thunkAPI) => {
    console.log("=========== SEND MESSAGE ===========\n", payload);
    const state = thunkAPI.getState() as RootState;
    const {authUser} = state.chat;
    const message = payload;

    if (!authUser) {
      throw new Error("User not logged in");
    }

    const encryptedMessages = [] as UserEncryptedMessage[];

    const roomId = state.chat.currentRoomId;
    if (!roomId) {
      throw new Error("RoomId not found");
    }

    const currentRoom = state.chat.rooms.find((r) => r.id === roomId);
    if (!currentRoom) {
      throw new Error("Room not found");
    }

    console.log("currentRoom", currentRoom);
    console.log("currentRoomUsers", currentRoom.users);
    console.log("authUser", authUser);

    const channelMembers = currentRoom.users.filter(
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

    return {message, encryptedMessages, roomId};
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
      console.log("=========== LEAVING ROOMS ===========", state.rooms);
      PusherConnection.getInstance().disconnect();
      signOut();
      state = initialState;
    },
    userJoined: (
      state,
      action: PayloadAction<{user: User; roomId: string}>
    ) => {
      console.log("=========== USER JOINED ===========\n", action.payload);

      // Rooms V2
      state.rooms = state.rooms.map((r) => {
        if (r.id === action.payload.roomId) {
          r.users = [...r.users, action.payload.user];
        }
        return r;
      });
    },
    userLeft: (state, action: PayloadAction<{user: User; roomId: string}>) => {
      console.log("=========== USER LEFT ===========\n", action.payload);

      // Rooms V2
      state.rooms = state.rooms.map((r) => {
        if (r.id === action.payload.roomId) {
          r.users = r.users.filter(
            (user) => user.id !== action.payload.user.id
          );
        }
        return r;
      });
    },
    startTyping: (state) => {
      console.log(
        "=========== START TYPING ===========\n",
        state.currentRoomId
      );
      const roomId = state.currentRoomId;
      if (!roomId) {
        console.log("Room ID is null, returning");
        return;
      }
      const pusher = PusherConnection.getInstance().getPusher();
      pusher.send_event(PUSHER_CLIENT_EVENT.START_TYPING, {}, roomId);
    },
    stopTyping: (state) => {
      console.log("=========== STOP TYPING ===========\n", state.currentRoomId);
      const roomId = state.currentRoomId;
      if (!roomId) {
        console.log("Room ID is null, returning");
        return;
      }
      const pusher = PusherConnection.getInstance().getPusher();

      pusher.send_event(PUSHER_CLIENT_EVENT.STOP_TYPING, {}, roomId);
    },
    userStartedTyping: (
      state,
      action: PayloadAction<{
        userId: string;
        roomId: string;
      }>
    ) => {
      console.log(
        "=========== USER STARTED TYPING ===========\n",
        action.payload
      );

      // Rooms V2

      const roomFromRooms = state.rooms.find(
        (r) => r.id === action.payload.roomId
      );
      const userInRoom = roomFromRooms?.users.find(
        (u) => u.id === action.payload.userId
      );

      if (userInRoom === undefined) {
        console.log("[V2] User not in room, ignoring typing event");
        return;
      }
      state.rooms = state.rooms.map((r) => {
        if (r.id === action.payload.roomId) {
          r.typingUsers = [...r.typingUsers, userInRoom];
        }
        return r;
      });
    },
    userStoppedTyping: (
      state,
      action: PayloadAction<{
        userId: string;
        roomId: string;
      }>
    ) => {
      console.log(
        "=========== USER STOPPED TYPING ===========\n",
        action.payload
      );

      state.typingUsers = state.typingUsers.filter(
        (user) => user.id !== action.payload.userId
      );

      // Rooms V2
      const roomFromRooms = state.rooms.find(
        (r) => r.id === action.payload.roomId
      );
      const userInRoom = roomFromRooms?.users.find(
        (u) => u.id === action.payload.userId
      );

      if (userInRoom === undefined) {
        console.log("[V2] User not in room, ignoring typing event");
        return;
      }

      state.rooms = state.rooms.map((r) => {
        if (r.id === action.payload.roomId) {
          r.typingUsers = r.typingUsers.filter(
            (user) => user.id !== action.payload.userId
          );
        }
        return r;
      });
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
      console.log("=========== JOINED ROOM ===========", action.payload.room);

      // Rooms V2
      state.rooms = [
        ...state.rooms,
        {
          id: action.payload.room.id,
          name: action.payload.room.name,
          users: action.payload.room.users,
          messages: [],
          lastMessage: null,
          typingUsers: [],
          isLoading: false,
        },
      ];

      state.authUser!.id = action.payload.myId;
      state.currentRoomId = action.payload.room.id;
    });

    builder.addCase(sendMessage.rejected, (state, action) => {
      console.log("ERROR sending message", action.error);
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const pusher = PusherConnection.getInstance().getPusher();

      console.log("=========== SENDING MESSAGE ===========\n", action.payload);

      pusher.send_event(
        PUSHER_CLIENT_EVENT.MESSAGE,
        action.payload.encryptedMessages,
        action.payload.roomId
      );

      state.messages = [...state.messages, action.payload.message];

      // Rooms V2
      const roomId = action.payload.roomId;

      state.rooms = state.rooms.map((r) => {
        if (r.id === roomId) {
          r.messages = [...r.messages, action.payload.message];
          r.lastMessage = action.payload.message;
        }
        return r;
      });
    });

    builder.addCase(receivedMessage.rejected, (state, action) => {
      console.log("ERROR decrypting message", action.error);
    });
    builder.addCase(receivedMessage.fulfilled, (state, action) => {
      if (action.payload) {
        state.messages = [...state.messages, action.payload.message];

        // Rooms V2
        state.rooms = state.rooms.map((r) => {
          if (r.id === action.payload?.roomId) {
            r.messages = [...r.messages, action.payload.message];
            r.lastMessage = action.payload.message;
          }
          return r;
        });
      }
    });
    builder.addCase(login.fulfilled, (state, action) => {
      console.log("Login sucessful", action.payload);
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
