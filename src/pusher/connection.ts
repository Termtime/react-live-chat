import {
  receivedMessage,
  userStartedTyping,
  userStoppedTyping,
  userJoined,
  userLeft,
  Room,
} from "../redux/toolkit/features/chatSlice";
import {getAppDispatch} from "../redux/toolkit/store";
import {UserEncryptedMessage, User, PublicAuthUser} from "../types";
import Pusher, {Members, PresenceChannel} from "pusher-js";
import {generateLinkedColor} from "../utils";
import {
  PUSHER_CLIENT_EVENT,
  PUSHER_EVENT,
  PUSHER_PRESSENCE_EVENT,
} from "../types/events";

type PusherMember = {id: string; info: Omit<User, "id">};

export interface InitializePusherParams {
  roomId: string;
  authUserInfo: PublicAuthUser;
}

export class PusherConnection {
  private static instance: PusherConnection;

  private pusher!: Pusher;

  private constructor() {}

  private initializePusher(authUserInfo: PublicAuthUser) {
    console.log(
      "Initializing pusher connection as user",
      authUserInfo.username
    );

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = process.env.NODE_ENV === "development";

    const appKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    console.log("Pusher environment variables", {appKey, cluster});
    if (!appKey || !cluster) {
      throw new Error("Pusher environment variables not set");
    }

    this.pusher = new Pusher(appKey, {
      cluster,
      authEndpoint: "/api/pusher/user-auth",
      auth: {
        params: {
          username: authUserInfo.username,
          publicKey: authUserInfo.publicKey,
        },
      },
    });
  }

  public static setup(authUserInfo: PublicAuthUser) {
    if (!PusherConnection.instance && authUserInfo) {
      console.log("Initializing pusher instance with info:", authUserInfo);
      // Initialize the Singleton instance
      PusherConnection.instance = new PusherConnection();
      PusherConnection.instance.initializePusher(authUserInfo);
      return PusherConnection.instance;
    }
  }

  public static getInstance() {
    if (!PusherConnection.instance) {
      throw new Error(
        "Pusher instance not initialized, have you called setup()?"
      );
    }
    return PusherConnection.instance;
  }

  public connectToChannel(roomName: string): Promise<Room> {
    const roomId = `presence-${roomName}`;
    const pressenceChannel = this.pusher.subscribe(roomId) as PresenceChannel;

    const promise = new Promise<Room>((resolve, reject) => {
      // ON SUBSCRIPTION SUCCEEDED
      pressenceChannel.bind(
        PUSHER_EVENT.SUBSCRIPTION_SUCCEEDED,
        (members: Members) => {
          const dispatch = getAppDispatch();

          // TODO: Move this functionality to the application layer
          const onReceivedMessage = (message: UserEncryptedMessage[]) => {
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

          console.log("[PUSHER] Configuring pusher events");

          // MEMBER ADDED
          pressenceChannel.bind(
            PUSHER_PRESSENCE_EVENT.MEMBER_ADDED,
            (member: PusherMember) => {
              const user: User = {
                id: member.id,
                username: member.info.username,
                publicKey: member.info.publicKey,
                color: generateLinkedColor(member.info.username),
              };

              dispatch(userJoined(user));
            }
          );

          // MEMBER REMOVED
          pressenceChannel.bind(
            PUSHER_PRESSENCE_EVENT.MEMBER_REMOVED,
            (member: PusherMember) => {
              const user: User = {
                id: member.id,
                username: member.info.username,
                publicKey: member.info.publicKey,
                color: generateLinkedColor(member.info.username),
              };

              dispatch(userLeft(user));
            }
          );

          // ON RECEIVED MESSAGE
          // TODO: Show a clickable bubble to take to the last message instead of forcing the scroll.
          pressenceChannel.bind(
            PUSHER_CLIENT_EVENT.MESSAGE,
            (message: UserEncryptedMessage[]) => onReceivedMessage(message)
          );

          // USER STARTED TYPING
          pressenceChannel.bind(
            PUSHER_CLIENT_EVENT.START_TYPING,
            (user: User) => dispatch(userStartedTyping(user))
          );

          // USER STOPPED TYPING
          pressenceChannel.bind(PUSHER_CLIENT_EVENT.STOP_TYPING, (user: User) =>
            dispatch(userStoppedTyping(user))
          );

          // Get the list of `Pusher.Member` objects of the pressence channel
          // and parse them as `User` objects (Adapter pattern)
          const users: User[] = [];

          members.each((member: {id: string; info: Omit<User, "id">}) => {
            const user: User = {
              id: member.id,
              username: member.info.username,
              publicKey: member.info.publicKey,
              color: generateLinkedColor(member.info.username),
            };

            users.push(user);
          });

          resolve({
            id: roomId,
            name: roomName,
            users: users,
          });

          return this.pusher;
        }
      );

      // ON SUBSCRIPTION ERROR
      pressenceChannel.bind(PUSHER_EVENT.SUBSCRIPTION_ERROR, (error: any) => {
        reject(new Error(`Error connecting to channel: ${error}`));
      });
    });

    return promise;
  }

  public disconnect(roomId: string) {
    this.pusher.unsubscribe(`presence-${roomId}`);
  }

  public getPusher() {
    return this.pusher;
  }
}
