import {CipherKey} from "crypto";
import {Message} from "../types";

/**
 * Encrypts a CypherKey using the public key of the recipient
 *
 */
// TODO: Review usage and remove if not needed
export const encryptKey = async (key: CipherKey, publicKey: CipherKey) => {};
export const encryptMessage = async (
  messageObj: Message,
  RECIPIENT_PUBLIC_KEY: string,
  SYMETRIC_KEY: string
) => {
  // Convert/Import the public key from string to a CryptoKey
  const publicKeyBuffer = Buffer.from(RECIPIENT_PUBLIC_KEY, "base64");
  const publicCryptoKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {name: "RSA-OAEP", hash: "SHA-256"},
    true,
    ["encrypt"]
  );

  // Convert/Import the symetric key from string to a CryptoKey
  const symetricKeyBuffer = Buffer.from(SYMETRIC_KEY, "base64");
  const symetricCryptoKey = await crypto.subtle.importKey(
    "raw",
    symetricKeyBuffer,
    {name: "AES-GCM"},
    true,
    ["encrypt"]
  );

  // Convert the message object to a string and then to a Buffer
  const messageString = JSON.stringify(messageObj);
  const messageBuffer = new TextEncoder().encode(messageString);

  // Encrypt the message using the Symetric CryptoKey and convert it to a string (base64)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    {name: "AES-GCM", iv, tagLength: 128},
    symetricCryptoKey,
    messageBuffer
  );
  const encryptedMessageString = Buffer.from(encryptedData).toString("base64");

  // Encrypt the Symetric CryptoKey using the recipient's CryptoKey,
  // then convert it to a string (base64) to include it in the message
  const encryptedSymetricKey = await crypto.subtle.encrypt(
    {name: "RSA-OAEP"},
    publicCryptoKey,
    symetricKeyBuffer
  );
  const encryptedSymetricKeyString =
    Buffer.from(encryptedSymetricKey).toString("base64");

  return {
    encryptedMessage: encryptedMessageString,
    encryptedSymetricKeyString,
    initializationVector: Buffer.from(iv).toString("base64"),
  };
};

export const decryptMessage = async (
  ciphertext: string,
  ENCRYPTED_SYMETRIC_KEY: string,
  INITIALIZATION_VECTOR: string,
  PRIVATE_KEY: string
): Promise<Message> => {
  // Convert/Import the key from string to a CryptoKey
  const privateKeyBuffer = Buffer.from(PRIVATE_KEY, "base64");
  const privateCryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {name: "RSA-OAEP", hash: "SHA-256"},
    true,
    ["decrypt"]
  );

  // - Convert the encrypted symetric key from string to a Buffer
  // - Decrypt the symetric key string using the private CryptoKey
  // - Convert it to a string (base64) to import it as a CryptoKey
  const encryptedSymetricKeyStringBuffer = Buffer.from(
    ENCRYPTED_SYMETRIC_KEY,
    "base64"
  );
  const symetricKeyBuffer = await crypto.subtle.decrypt(
    {name: "RSA-OAEP"},
    privateCryptoKey,
    encryptedSymetricKeyStringBuffer
  );
  const symetricCryptoKey = await crypto.subtle.importKey(
    "raw",
    symetricKeyBuffer,
    {name: "AES-GCM"},
    true,
    ["decrypt"]
  );

  // Decrypt the message using the imported Symetric CryptoKey
  // parse back into a JSON string, then convert it to a Message object
  const ciphertextBuffer = Buffer.from(ciphertext, "base64");

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(INITIALIZATION_VECTOR, "base64"),
      tagLength: 128, // Length of the authentication tag
    },
    symetricCryptoKey,
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
