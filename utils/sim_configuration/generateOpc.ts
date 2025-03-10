import * as crypto from "crypto";
import { InvalidDataError, OperationError } from "../errors";


export function generateRandomKey(): string {
    // Generate 128 bits = 16 bytes in HEX
    return crypto.randomBytes(16).toString("hex").toUpperCase();
}

/**
 * Using aes128EncryptBlock, only a single 16-byte block is encrypted.
 * AES-GCM, AES-CTR or AES-CBC's strength lies in deriving unique ciphertexts for cryptographic
 * randomization on processing multiple blocks. Since the code only encrypts one standalone block,
 * there will be no observable differences  among any AES encryption modes.
 * However, AES-ECB is the more practical one as it does not require any input vector or
 * authentication tag (not effectively used in the single block case).
 */
export function aes128EncryptBlock(key: Uint8Array, data: Uint8Array): Uint8Array {
    if (key.length !== 16) {
        const errorMessage = "Key must be 16 bytes (128 bits) for AES-128 encryption.";
        console.error(errorMessage);
        throw new InvalidDataError(errorMessage);
    }
    if (data.length !== 16) {
        const errorMessage = "Input data must be 16 bytes (128 bits) for AES-128 encryption.";
        console.error(errorMessage);
        throw new InvalidDataError(errorMessage);
    }
    try {
        const cipher = crypto.createCipheriv("aes-128-ecb", key, Buffer.alloc(0));
        cipher.setAutoPadding(false);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        return new Uint8Array(encrypted);
    } catch (error) {
        const errorMessage = `Failed to encrypt data: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        throw new OperationError(errorMessage);
    }
}

export function bufferXor(buf1: Buffer, buf2: Buffer): Buffer {
    if (buf1.length !== buf2.length) {
        const errorMessage = "Buffers must have the same length for XOR.";
        console.error(errorMessage);
        throw new InvalidDataError(errorMessage);
    }
    return Buffer.from(buf1.map((b, i) => b ^ buf2[i]));
}


export function generateOpc(): {opc: string; ki: string }{
    const op = generateRandomKey();
    const ki = generateRandomKey();

    // Convert to binary buffers which is raw binary data to make operations byte by byte
    const opBuffer = Buffer.from(op, "hex");
    const kiBuffer = Buffer.from(ki, "hex");
    try {

        // Perform AES-128 encryption of OP using Ki
        const ciphertext = aes128EncryptBlock(kiBuffer, opBuffer);

        // XOR encrypted OP (ciphertext) with the original OP to derive OPc
        const opcBuffer = bufferXor(Buffer.from(ciphertext), opBuffer);

        // Return OPc and Ki as uppercase hexadecimal strings
        return {
            opc: opcBuffer.toString("hex").toUpperCase(),
            ki: ki,
        };
    } catch (error) {
        const errorMessage = `Failed to generate OPc: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        throw new OperationError(errorMessage);
    }
}
