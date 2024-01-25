import {
  receivedMessage,
  userStartedTyping,
  userStoppedTyping,
  handshakeAcknowledge,
} from "../redux/toolkit/features/chatSlice";
import {getAppDispatch} from "../redux/toolkit/store";
import {UserEncryptedMessage, User, PublicAuthUser} from "../types";
import Pusher, {Members, PresenceChannel} from "pusher-js";
import {generateLinkedColor} from "../utils";
import {PUSHER_CLIENT_EVENT, PUSHER_EVENT} from "../types/events";

type PusherMember = {id: string; info: Omit<User, "id">};

export interface InitializePusherParams {
  roomId: string;
  authUserInfo: PublicAuthUser;
}

export class PusherConnection {
  private static instance: PusherConnection;

  private pusher!: Pusher;

  private constructor() {}

  private initializePusher({roomId, authUserInfo}: InitializePusherParams) {
    console.log("Initializing pusher connection");

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = process.env.NODE_ENV === "development";

    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER;
    const useTLS = process.env.PUSHER_USE_TLS;

    if (!appId || !key || !secret || !cluster || !useTLS) {
      throw new Error("Pusher environment variables not set");
    }

    this.pusher = new Pusher(appId, {
      cluster,
      userAuthentication: {
        endpoint: "/api/pusher/user-auth",
        params: {
          username: authUserInfo.username,
          publicKey: authUserInfo.publicKey,
        },
        transport: "ajax",
      },
    });

    if (!this.pusher) {
      throw new Error("Pusher instance not found");
    }

    const channel = this.pusher.subscribe(roomId);

    // Make sure we are connected to the channel before continuing
    channel.bind(PUSHER_EVENT.SUBSCRIPTION_SUCCEEDED, () => {
      const pressenceChannel = this.pusher.subscribe(
        `presence-${roomId}`
      ) as PresenceChannel;

      // Make sure that we are connected to the presence channel before continuing
      pressenceChannel.bind(
        PUSHER_EVENT.SUBSCRIPTION_SUCCEEDED,
        (members: Members) => {
          const users: User[] = [];
          const meMember: PusherMember = members.me;
          const me: User = {
            id: meMember.id,
            username: meMember.info.username,
            color: meMember.info.color,
            publicKey: meMember.info.publicKey,
          };
          members.each((member: {id: string; info: Omit<User, "id">}) => {
            const user: User = {
              id: member.id,
              username: member.info.username,
              publicKey: member.info.publicKey,
              color: generateLinkedColor(member.info.username),
            };

            users.push(user);
          });

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
          dispatch(handshakeAcknowledge({users, socketId: me.id}));

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
          // TODO: Show a clickable bubble to take to the last message instead of forcing the scroll.
          this.pusher.bind(
            PUSHER_CLIENT_EVENT.MESSAGE,
            (message: UserEncryptedMessage) => onReceivedMessage(message)
          );

          // BEFORE - START TYPING
          // this.socket.on("userStartedTyping", (user: User) =>
          //   dispatch(userStartedTyping(user))
          // );

          // AFTER
          this.pusher.bind(PUSHER_CLIENT_EVENT.START_TYPING, (user: User) =>
            dispatch(userStartedTyping(user))
          );

          // BEFORE - STOP TYPING
          // this.socket.on("userStoppedTyping", (user: User) =>
          //   dispatch(userStoppedTyping(user))
          // );

          // AFTER
          this.pusher.bind(PUSHER_CLIENT_EVENT.STOP_TYPING, (user: User) =>
            dispatch(userStoppedTyping(user))
          );

          return this.pusher;
        }
      );
    });

    // BEFORE - CONNECTION ERROR
    // this.socket.on("connect_error", (err) => {
    //   console.log("Connection error: ", err);
    //   console.log(err.cause);
    //   console.log(err.message);
    // });

    // AFTER
    channel.bind(PUSHER_EVENT.SUBSCRIPTION_ERROR, (error: any) => {
      console.log("Subscription error: ", error);
    });
  }

  public static getInstance(info: Partial<InitializePusherParams> = {}) {
    const {roomId, authUserInfo} = info;

    console.log("Getting pusher instance with id...", roomId);
    if (!PusherConnection.instance && roomId && authUserInfo) {
      console.log("Initializing pusher connection with id...", roomId);
      PusherConnection.instance = new PusherConnection();
      PusherConnection.instance.initializePusher({roomId, authUserInfo});
      console.log("Pusher connection initialized");
    } else if (!PusherConnection.instance && (!roomId || !authUserInfo)) {
      throw new Error(
        "ERROR: Trying to initialize the pusher connection without required parameters"
      );
    }
    return PusherConnection.instance;
  }

  public getPusher() {
    return this.pusher;
  }
}
