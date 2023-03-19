export interface User {
    username: string;
    id: string;
}

export interface Message {
    body: string;
    time: string;
    user: User;
}

export interface AppState {
    ownUser: User | null;
    users: User[];
    messages: Message[];
    socket: any | null;
    roomId: string | null;
    typingUsers: User[];
}

export interface RoomHandshake {
    username: string;
    id: string;
    roomId: string;
}
