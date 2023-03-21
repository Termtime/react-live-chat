import { User, Message, RoomHandshake, UserEncryptedMessage } from "../types";

export interface ServerToClientEvents {
    userJoined: (user: User) => void;
    userLeft: (user: User) => void;
    message: (userEncryptedMessages: UserEncryptedMessage) => void;
    userStartedTyping: (user: User) => void;
    userStoppedTyping: (user: User) => void;
}

export interface ClientToServerEvents {
    joinRoom: (
        handshake: RoomHandshake,
        callback: (userList: User[]) => void
    ) => void;
    leaveRoom: (roomId: string) => void;
    message: (userEncryptedMessages: UserEncryptedMessage) => void;
    startedTyping: (roomId: string) => void;
    stoppedTyping: (roomId: string) => void;
}
