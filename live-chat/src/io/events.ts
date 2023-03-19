import { User, Message } from "../types";

export interface ServerToClientEvents {
    "user-joined": (users: User[]) => void;
    "user-left": (users: User[]) => void;
    message: (message: Message) => void;
    "is-typing": (user: User) => void;
    "stopped-typing": (user: User) => void;
}
