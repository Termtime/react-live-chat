import CryptoJS from "crypto-js";
import { Message, UserEncryptedMessage } from "../types";

export const encryptMessage = (message: Message, SECRET_KEY: string) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(message), SECRET_KEY);
    return encrypted.toString();
};

export const decryptMessage = (
    message: string,
    SECRET_KEY: string
): Message => {
    const decrypted = CryptoJS.AES.decrypt(JSON.stringify(message), SECRET_KEY);

    const decryptedMessage = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    // check decrypted message integrity
    if (
        decryptedMessage.user &&
        decryptedMessage.body &&
        decryptedMessage.time
    ) {
        return decryptedMessage;
    }

    throw new Error("Could not decrypt message, integrity check failed.");
};

export const getPrivateKey = () => {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
};
