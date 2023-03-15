export interface User {
    username: string;
    id: string;
}

export interface Message {
    body: string;
    time: string;
    user: User;
}
