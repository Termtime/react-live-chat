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
import Pusher from "pusher-js";

export class SocketConnection {
  private static instance: SocketConnection;

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private pusher!: Pusher;

  private constructor() {}

  private initializeSocket() {
    console.log("Initializing socket connection to server");

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    this.pusher = new Pusher("95df5bac7ba14bda37e3", {
      cluster: "us2",
    });

    const channel = this.pusher.subscribe("my-channel");
    channel.bind("my-event", function (data) {
      alert(JSON.stringify(data));
    });

    this.socket = io();
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
      console.log(err.cause);
      console.log(err.message);
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
