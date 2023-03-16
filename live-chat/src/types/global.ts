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
    ownUser: User;
    users: User[];
    messages: Message[];
    socket: any;
    roomId: string;
    typingUsers: User[];
}
