export interface User {
  username: string;
  id: string;
  publicKey?: string;
  color?: string;
}

// TODO: Review usage and reduce if possible
export interface PublicAuthUser {
  username: string;
  publicKey: string;
  color?: string;
}

export interface AuthUser {
  username: string;
  id?: string;
  privateKey: string;
  publicKey: string;
  symetricKey: string;
  color?: string;
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
  /**
   * Key used to encrypt the message, encrypted with the recipient's public key
   */
  key: string;
  /**
   *
   */
  recipient: User;
  /**
   * Room ID
   */
  roomId: string;

  /**
   * Initialization Vector
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
   */
  iv: string;
}

export interface RoomHandshake {
  user: PublicAuthUser;
  roomId: string;
}
