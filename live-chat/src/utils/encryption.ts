import {Message} from "../types";

export const encryptMessage = async (
  messageObj: Message,
  RECIPIENT_PUBLIC_KEY: string,
  SYMETRIC_KEY: string
) => {
  const keyBuffer = Buffer.from(RECIPIENT_PUBLIC_KEY, "base64");
  const publicKeyObj = await crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {name: "RSA-OAEP", hash: "SHA-256"},
    true,
    ["encrypt"]
  );

  const symetricKeyBuffer = Buffer.from(SYMETRIC_KEY, "base64");
  const symetricKeyObj = await crypto.subtle.importKey(
    "raw",
    symetricKeyBuffer,
    {name: "AES-GCM"},
    true,
    ["encrypt"]
  );

  const messageString = JSON.stringify(messageObj);
  const messageBuffer = new TextEncoder().encode(messageString);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // encrypt using the symetric key
  const encryptedData = await crypto.subtle.encrypt(
    {name: "AES-GCM", iv, tagLength: 128},
    symetricKeyObj,
    messageBuffer
  );

  // encrypt the symetric key using the public key
  const encryptedSymetricKey = await crypto.subtle.encrypt(
    {name: "RSA-OAEP"},
    publicKeyObj,
    symetricKeyBuffer
  );

  const encryptedMessage = Buffer.from(encryptedData).toString("base64");

  const encryptedSymetricKeyString =
    Buffer.from(encryptedSymetricKey).toString("base64");

  return {
    encryptedMessage,
    encryptedSymetricKeyString,
    initializationVector: iv,
  };
};

export const decryptMessage = async (
  ciphertext: string,
  ENCRYPTED_SYMETRIC_KEY: string,
  INITIALIZATION_VECTOR: Uint8Array,
  PRIVATE_KEY: string
): Promise<Message> => {
  const keyBuffer = Buffer.from(PRIVATE_KEY, "base64");

  const importedPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    {name: "RSA-OAEP", hash: "SHA-256"},
    true,
    ["decrypt"]
  );

  const encryptedSymetricKeyBuffer = Buffer.from(
    ENCRYPTED_SYMETRIC_KEY,
    "base64"
  );

  // decrypt the symetric key using the private key
  const decryptedSymetricKey = await crypto.subtle.decrypt(
    {name: "RSA-OAEP"},
    importedPrivateKey,
    encryptedSymetricKeyBuffer
  );

  // Get the cryptokey by importing the decrypted symetric key
  const decryptedSymetricKeyString =
    Buffer.from(decryptedSymetricKey).toString("base64");

  const symetricKeyBuffer = Buffer.from(decryptedSymetricKeyString, "base64");
  const symetricKeyObj = await crypto.subtle.importKey(
    "raw",
    symetricKeyBuffer,
    {name: "AES-GCM"},
    true,
    ["decrypt"]
  );

  // Decrypt the message using the imported symetric key
  const ciphertextBuffer = Buffer.from(ciphertext, "base64");
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: INITIALIZATION_VECTOR,
      tagLength: 128, // Length of the authentication tag
    },
    symetricKeyObj,
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

  const symetricKey = await crypto.subtle.generateKey(
    {name: "AES-GCM", length: 256},
    true,
    ["encrypt", "decrypt"]
  );

  const privateKeyData = await crypto.subtle.exportKey("pkcs8", privateKey);

  const publicKeyData = await crypto.subtle.exportKey("spki", publicKey);

  const symetricKeyData = await crypto.subtle.exportKey("raw", symetricKey);

  const privateKeyString = Buffer.from(privateKeyData).toString("base64");
  const publicKeyString = Buffer.from(publicKeyData).toString("base64");
  const symetricKeyString = Buffer.from(symetricKeyData).toString("base64");

  return {
    privateKey: privateKeyString,
    publicKey: publicKeyString,
    symetricKey: symetricKeyString,
  };
};
