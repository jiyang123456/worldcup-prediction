import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SCRYPT_SALT_LENGTH);
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) {
    return false;
  }
  const [saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const hash = Buffer.from(hashHex, "hex");
  const computed = scryptSync(password, salt, hash.length);
  if (hash.length !== computed.length) {
    return false;
  }
  return timingSafeEqual(hash, computed);
}
