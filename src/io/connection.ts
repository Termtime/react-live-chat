import {io, Socket, connect} from "socket.io-client";
import {
  receivedMessage,
  userJoined,
  userLeft,
  userStartedTyping,
  userStoppedTyping,
  handshakeAcknowledge,
} from "../redux/toolkit/features/chatSlice";
import {getAppDispatch} from "../redux/toolkit/store";
import {UserEncryptedMessage, User} from "../types";
import {ClientToServerEvents, ServerToClientEvents} from "./events";
import {apiRoute} from "../utils/constants";
import Pusher, {PresenceChannel} from "pusher-js";
import {getPusherInstance} from "../utils";
import {PUSHER_EVENT} from "../types/events";

export class SocketConnection {
  private static instance: SocketConnection;

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private pusher!: Pusher;

  private constructor() {}

  private initializeSocket(roomId: string) {
    console.log("Initializing socket connection to server");

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    const pusher = getPusherInstance();

    if (!pusher) {
      throw new Error("Pusher instance not found");
    }

    const channel = pusher.subscribe(roomId);
    const presenceChannel = pusher.subscribe(
      `presence-${roomId}`
    ) as PresenceChannel;

    const users = presenceChannel.members;

    console.log("User joined room: ", {channel, users});
    const dispatch = getAppDispatch();

    // Will have to change users to be of type Members or transform them to an array of Users
    // socketID can be changed to be the user id for clarity or just transfer the `me` member
    // to the redux store

    // BEFORE - HANDSHAKE ACKNOWLEDGE - used to get user list and socket/user id
    // this.socket.on("handshakeAcknowledge", (users, socketId) =>
    //   dispatch(handshakeAcknowledge({users, socketId}))
    // );

    // AFTER
    dispatch(handshakeAcknowledge({users, socketId: users.me.id}));

    // this.socket = io();

    const onReceivedMessage = (message: UserEncryptedMessage) => {
      if (typeof window !== "undefined") {
        dispatch(receivedMessage(message));
        document
          .querySelector("#messages")
          ?.scrollTo(
            0,
            document?.querySelector("#messages")?.scrollHeight || 0
          );
      }
    };

    console.log("Configuring socket events");
    // Not 100% sure if this is needed, as the whole `connect` event has already happened
    // in this running context.
    // this.socket.on("connect", () => {
    //   console.log("Connected to server");
    // });

    // No idea so far if there is an equivalent for this using pusher
    // this.socket.on("connect_error", (err) => {
    //   console.log("Connection error: ", err);
    //   console.log(err.cause);
    //   console.log(err.message);
    // });

    // BEFORE - USER JOINED
    // this.socket.on("userJoined", (user: User) => dispatch(userJoined(user)));

    // BEFORE - USER LEFT
    // this.socket.on("userLeft", (user: User) => dispatch(userLeft(user)));

    // ABOVE Will be handled by pressence channels

    // BEFORE - RECEIVED MESSAGE
    // this.socket.on("message", (message: UserEncryptedMessage) =>
    //   onReceivedMessage(message)
    // );

    // AFTER
    this.pusher.bind(PUSHER_EVENT.MESSAGE, (message: UserEncryptedMessage) =>
      onReceivedMessage(message)
    );

    // BEFORE - START TYPING
    // this.socket.on("userStartedTyping", (user: User) =>
    //   dispatch(userStartedTyping(user))
    // );

    // AFTER
    this.pusher.bind(PUSHER_EVENT.START_TYPING, (user: User) =>
      dispatch(userStartedTyping(user))
    );

    // BEFORE - STOP TYPING
    // this.socket.on("userStoppedTyping", (user: User) =>
    //   dispatch(userStoppedTyping(user))
    // );

    // AFTER
    this.pusher.bind(PUSHER_EVENT.STOP_TYPING, (user: User) =>
      dispatch(userStoppedTyping(user))
    );

    return this.socket;
  }

  public static getInstance() {
    if (!SocketConnection.instance) {
      SocketConnection.instance = new SocketConnection();
      SocketConnection.instance.initializeSocket();
    }
    return SocketConnection.instance;
  }

  public getSocket() {
    return this.socket;
  }
}
