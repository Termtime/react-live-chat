import {Message} from "../types";

export const encryptMessage = async (
  messageObj: Message,
  RECIPIENT_PUBLIC_KEY: string
): Promise<string> => {
  const keyBuffer = Buffer.from(RECIPIENT_PUBLIC_KEY, "base64");
  const publicKeyObj = await crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {name: "RSA-OAEP", hash: "SHA-256"},
    true,
    ["encrypt"]
  );

  const messageString = JSON.stringify(messageObj);
  const messageBuffer = new TextEncoder().encode(messageString);
  const encryptedData = await crypto.subtle.encrypt(
    {name: "RSA-OAEP"},
    publicKeyObj,
    messageBuffer
  );

  return Buffer.from(encryptedData).toString("base64");
};

export const decryptMessage = async (
  ciphertext: string,
  SECRET_KEY: string
): Promise<Message> => {
  const keyBuffer = Buffer.from(SECRET_KEY, "base64");

  const importedPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    {name: "RSA-OAEP", hash: "SHA-256"},
    true,
    ["decrypt"]
  );

  const ciphertextBuffer = Buffer.from(ciphertext, "base64");

  const decryptedData = await crypto.subtle.decrypt(
    {name: "RSA-OAEP"},
    importedPrivateKey,
    ciphertextBuffer
  );

  const decryptedString = new TextDecoder().decode(decryptedData);

  const decryptedMessage: Message = JSON.parse(decryptedString);

  if (decryptedMessage.body && decryptedMessage.time && decryptedMessage.user) {
    return decryptedMessage;
  }

  throw new Error("Could not decrypt message, integrity check failed.");
};

export const generateKeys = async () => {
  const algorithm: RsaHashedKeyGenParams = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  };
  const extractable = true;
  const keyUsages: KeyUsage[] = ["encrypt", "decrypt"];

  const {publicKey, privateKey} = await crypto.subtle.generateKey(
    algorithm,
    extractable,
    keyUsages
  );

  const privateKeyData = await crypto.subtle.exportKey("pkcs8", privateKey);

  const publicKeyData = await crypto.subtle.exportKey("spki", publicKey);

  const privateKeyString = Buffer.from(privateKeyData).toString("base64");
  const publicKeyString = Buffer.from(publicKeyData).toString("base64");

  return {privateKey: privateKeyString, publicKey: publicKeyString};
};
