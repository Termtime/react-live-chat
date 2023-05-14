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

export class SocketConnection {
  private static instance: SocketConnection;

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  private constructor() {}

  private initializeSocket() {
    console.log("Initializing socket connection to server");

    this.socket = io({
      path: apiRoute,
    });
    const dispatch = getAppDispatch();

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
    this.socket.on("connect", () => {
      console.log("Connected to server");
    });
    this.socket.on("connect_error", (err) => {
      console.log("Connection error: ", err);
    });
    this.socket.on("userJoined", (user: User) => dispatch(userJoined(user)));

    this.socket.on("userLeft", (user: User) => dispatch(userLeft(user)));

    this.socket.on("message", (message: UserEncryptedMessage) =>
      onReceivedMessage(message)
    );

    this.socket.on("userStartedTyping", (user: User) =>
      dispatch(userStartedTyping(user))
    );

    this.socket.on("userStoppedTyping", (user: User) =>
      dispatch(userStoppedTyping(user))
    );

    this.socket.on("handshakeAcknowledge", (users, socketId) =>
      dispatch(handshakeAcknowledge({users, socketId}))
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
