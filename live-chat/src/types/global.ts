export interface User {
    username: string;
    id: string;
    publicKey?: string;
}

export interface AuthUser {
    username: string;
    id: string;
    privateKey: string | null;
}

export interface Message {
    body: string;
    time: string;
    user: User;
}

export interface UserEncryptedMessage {
    /**
     * Encrypted Message in string form
     */
    message: string;
    recipientsPublicKeys: string[];
    roomId: string;
}

export interface RoomHandshake {
    user: User;
    roomId: string;
}
