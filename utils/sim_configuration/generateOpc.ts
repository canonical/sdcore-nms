import * as crypto from "crypto";
import { InvalidDataError } from "../errors";


export function generateRandomKey(): string {
    // Generate 128 bits = 16 bytes in HEX
    return crypto.randomBytes(16).toString("hex").toUpperCase();
}


export function aes128GcmEncrypt(key: Buffer, data: Buffer, iv: Buffer): {
    ciphertext: Buffer, authTag: Buffer} {
    if (key.length !== 16) {
        throw new InvalidDataError("Invalid Key: Key must be exactly 16 bytes (128 bits).");
    }

    if (iv.length !== 12) {
        throw new InvalidDataError("Invalid IV: IV must be exactly 12 bytes for AES-GCM.");
    }

    if (!data || data.length === 0) {
        throw new InvalidDataError("Invalid Data: Data to encrypt cannot be null or empty.");
    }
    const cipher = crypto.createCipheriv("aes-128-gcm", key, iv);
    // Encryption process produces ciphertext and authentication tag
    const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return { ciphertext, authTag };
}


export function bufferXor(buf1: Buffer, buf2: Buffer): Buffer {
    if (buf1.length !== buf2.length) {
        throw new InvalidDataError("Buffers must have the same length for XOR.");
    }
    return Buffer.from(buf1.map((b, i) => b ^ buf2[i]));
}


export function generateOpc(op: string, ki: string): string {
    // Validate Op input is a 32-character hexadecimal string
    if (op.length !== 32 || !/^[a-fA-F0-9]+$/.test(op.trim())) {
        throw new InvalidDataError("Invalid OP: Must be a 128-bit hexadecimal string (32 characters).");
    }
    // Validate Ki input is a 32-character hexadecimal string
    if (ki.length !== 32 || !/^[a-fA-F0-9]+$/.test(ki.trim())) {
        throw new InvalidDataError("Invalid KI: Must be a 128-bit hexadecimal string (32 characters).");
    }

    // Convert to binary buffers which is raw binary data to make operations byte by byte
    const opBuffer = Buffer.from(op, "hex");
    const kiBuffer = Buffer.from(ki, "hex");

    // Generate a random 12-byte IV for AES-GCM (standard recommended IV length for AES-GCM)
    const iv = crypto.randomBytes(12);

    // Perform AES-128-GCM encryption of OP using Ki as the key and the random IV
    const  { ciphertext } = aes128GcmEncrypt(kiBuffer, opBuffer, iv);

    // XOR the encrypted OP (ciphertext) with the original OP to derive OPc
    const opcBuffer = bufferXor(ciphertext, opBuffer);

    // Return OPc as an uppercase hexadecimal string
    return opcBuffer.toString("hex").toUpperCase();
}
