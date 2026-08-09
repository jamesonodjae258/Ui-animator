/* ── AES-256-GCM token encryption ──────────────────────────── */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex === "your-32-byte-hex-key") {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY env var is missing or still set to the placeholder value. " +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars). Got ${buf.length} bytes.`,
    );
  }
  return buf;
}

export interface EncryptedValue {
  ciphertext: string;
  iv: string;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns the ciphertext (with auth tag appended) and IV, both as hex strings.
 */
export function encrypt(plaintext: string): EncryptedValue {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("hex"),
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypt a ciphertext (with appended auth tag) using AES-256-GCM.
 */
export function decrypt(ciphertext: string, iv: string): string {
  const key = getKey();
  const data = Buffer.from(ciphertext, "hex");
  const ivBuf = Buffer.from(iv, "hex");

  const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
  const encrypted = data.subarray(0, data.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, ivBuf, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
