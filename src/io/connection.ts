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
import Pusher, {Members, PresenceChannel} from "pusher-js";
import {generateLinkedColor, getPusherInstance} from "../utils";
import {PUSHER_CLIENT_EVENT, PUSHER_EVENT} from "../types/events";

type PusherMember = {id: string; info: Omit<User, "id">};

export class PusherConnection {
  private static instance: PusherConnection;

  private pusher!: Pusher;

  private constructor() {}

  private initializePusher(roomId: string) {
    console.log("Initializing pusher connection");

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = process.env.NODE_ENV === "development";

    const pusher = getPusherInstance();

    if (!pusher) {
      throw new Error("Pusher instance not found");
    }

    const channel = pusher.subscribe(roomId);

    // Make sure we are connected to the channel before continuing
    channel.bind(PUSHER_EVENT.SUBSCRIPTION_SUCCEEDED, () => {
      const pressenceChannel = pusher.subscribe(
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

  public static getInstance(roomId?: string) {
    if (!PusherConnection.instance && roomId) {
      PusherConnection.instance = new PusherConnection();
      PusherConnection.instance.initializePusher(roomId);
    } else if (!PusherConnection.instance && !roomId) {
      console.error("No connection is initialized");
    }
    return PusherConnection.instance;
  }

  public getPusher() {
    return this.pusher;
  }
}
