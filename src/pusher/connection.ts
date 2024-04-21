import {
  receivedMessage,
  userStartedTyping,
  userStoppedTyping,
  userJoined,
  userLeft,
  RoomV2,
} from "../redux/toolkit/features/chatSlice";
import {getAppDispatch} from "../redux/toolkit/store";
import {UserEncryptedMessage, User, PusherUserPayload} from "../types";
import Pusher, {Members, PresenceChannel} from "pusher-js";
import {generateLinkedColor} from "../utils";
import {
  PUSHER_CLIENT_EVENT,
  PUSHER_EVENT,
  PUSHER_PRESSENCE_EVENT,
} from "../types/events";

interface ConnectResponse {
  room: RoomV2;
  myId: string;
}

type PusherMember = {id: string; info: Omit<User, "id">};

export interface InitializePusherParams {
  roomId: string;
  authUserInfo: PusherUserPayload;
}

export class PusherConnection {
  private static instance: PusherConnection;

  private pusher!: Pusher;

  private constructor() {}

  private initializePusher(publicKey: string) {
    console.log("Initializing pusher connection");

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
          publicKey: publicKey,
        },
      },
    });
  }

  public static setup(publicKey: string) {
    if (!PusherConnection.instance && publicKey) {
      console.log("Initializing pusher instance with info:", publicKey);
      // Initialize the Singleton instance
      PusherConnection.instance = new PusherConnection();
      PusherConnection.instance.initializePusher(publicKey);
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

  public connectToChannel(roomName: string): Promise<ConnectResponse> {
    const roomId = `presence-${roomName}`;
    const pressenceChannel = this.pusher.subscribe(roomId) as PresenceChannel;

    const promise = new Promise<ConnectResponse>((resolve, reject) => {
      // ON SUBSCRIPTION SUCCEEDED
      pressenceChannel.bind(
        PUSHER_EVENT.SUBSCRIPTION_SUCCEEDED,
        (members: Members) => {
          const dispatch = getAppDispatch();

          // TODO: Move this functionality to the application layer
          // const onReceivedMessage = (message: UserEncryptedMessage[], roomId) => {
          //   if (typeof window !== "undefined") {

          //     document
          //       .querySelector("#messages")
          //       ?.scrollTo(
          //         0,
          //         document?.querySelector("#messages")?.scrollHeight || 0
          //       );
          //   }
          // };

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

              dispatch(
                userJoined({
                  user,
                  roomId,
                })
              );
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

              dispatch(
                userLeft({
                  user,
                  roomId,
                })
              );
            }
          );

          // ON RECEIVED MESSAGE
          // TODO: Show a clickable bubble to take to the last message instead of forcing the scroll.
          pressenceChannel.bind(
            PUSHER_CLIENT_EVENT.MESSAGE,
            (message: UserEncryptedMessage[]) =>
              dispatch(receivedMessage(message))
          );

          // USER STARTED TYPING
          pressenceChannel.bind(
            PUSHER_CLIENT_EVENT.START_TYPING,
            (
              data: any,
              metadata: {
                user_id: string;
              }
            ) => {
              console.log(metadata.user_id);
              dispatch(
                userStartedTyping({
                  userId: metadata.user_id,
                  roomId,
                })
              );
            }
          );

          // USER STOPPED TYPING
          pressenceChannel.bind(
            PUSHER_CLIENT_EVENT.STOP_TYPING,
            (
              data: any,
              metadata: {
                user_id: string;
              }
            ) =>
              dispatch(
                userStoppedTyping({
                  userId: metadata.user_id,
                  roomId,
                })
              )
          );

          // Get the list of `Pusher.Member` objects of the pressence channel
          // and parse them as `User` objects (Adapter pattern)
          const users: User[] = [];

          const me: User = {
            id: members.myID,
            username: members.me.info.username,
            publicKey: members.me.info.publicKey,
            color: generateLinkedColor(members.myID),
          };

          members.each((member: {id: string; info: Omit<User, "id">}) => {
            const user: User = {
              id: member.id,
              username: member.info.username,
              publicKey: member.info.publicKey,
              color: generateLinkedColor(members.myID),
            };

            users.push(user);
          });

          console.log({
            room: {
              id: roomId,
              name: roomName,
              users: users,
            },
            myId: me.id,
          });
          resolve({
            room: {
              id: roomId,
              name: roomName,
              users: users,
              isLoading: false,
              lastMessage: null,
              messages: [],
              typingUsers: [],
            },
            myId: me.id,
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

  public disconnect() {
    this.pusher.disconnect();
  }

  public getPusher() {
    return this.pusher;
  }
}
