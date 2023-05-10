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

export class SocketConnection {
  private static instance: SocketConnection;

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  private constructor() {}

  private initializeSocket() {
    this.socket = io(process.env.BASE_URL || "http://localhost:3000", {
      path: "/api/socketio",
    });
    console.log("Connected to server");
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
