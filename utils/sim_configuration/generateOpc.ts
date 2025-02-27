import * as crypto from "crypto";

/**
 * Generates a random 128-bit (16-byte) hexadecimal key.
 *
 * @returns {string} A random 128-bit hex string in uppercase.
 */
export function generateRandomKey(): string {
    // Generate 128 bits = 16 bytes in HEX
    return crypto.randomBytes(16).toString("hex").toUpperCase();
}


/**
 * AES-128 ECB encryption function.
 *
 * @param {Buffer} key - The 128-bit encryption key.
 * @param {Buffer} data - The 128-bit block to encrypt.
 * @returns {Buffer} The encrypted data block.
 */
export function aes128EcbEncrypt(key: Buffer, data: Buffer): Buffer {
    const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
    // Disable automatic padding as input data must be exactly 128 bits (16 bytes) for Milenage.
    cipher.setAutoPadding(false);
    // Encryption process produces separate `Buffer` outputs and
    // these need to be joined to form the entire encrypted message
    return Buffer.concat([cipher.update(data), cipher.final()]);
}

/**
 * - Performs a bitwise XOR operation between two `Buffer` objects.
 *
 * @param {Buffer} buf1 - The first buffer.
 * @param {Buffer} buf2 - The second buffer.
 * @returns {Buffer} The resulting XORed buffer.
 */
export function bufferXor(buf1: Buffer, buf2: Buffer): Buffer {
    if (buf1.length !== buf2.length) {
        throw new Error("Buffers must have the same length for XOR.");
    }
    return Buffer.from(buf1.map((b, i) => b ^ buf2[i]));
}

/**
 * Generate the OPc (Operator Code) using a Milenage-based algorithm.
 *
 * @param {string} op - The Operator Key (OP), a 128-bit hexadecimal string.
 * @param {string} ki - The private key (Ki), a 128-bit hexadecimal string.
 * @returns {string} The derived OPc (Operator Code), a 128-bit hexadecimal string in uppercase.
 */
export function generateOpc(op: string, ki: string): string {
    // Validate Op input is a 32-character hexadecimal string
    if (!/^[a-fA-F0-9]{32}$/.test(op)) {
        throw new Error("Invalid OP: Must be a 128-bit hexadecimal string (32 characters).");
    }
    // Validate Ki input is a 32-character hexadecimal string
    if (!/^[a-fA-F0-9]{32}$/.test(ki)) {
        throw new Error("Invalid KI: Must be a 128-bit hexadecimal string (32 characters).");
    }

    // Convert to binary buffers which is raw binary data to make operations byte by byte
    const opBuffer = Buffer.from(op, "hex");
    const kiBuffer = Buffer.from(ki, "hex");

    if (opBuffer.length !== 16 || kiBuffer.length !== 16) {
        throw new Error("Invalid input: Parsed Buffers must each be exactly 16 bytes.");
    }

    // Perform AES-128 encryption of OP using Ki as the key
    const encryptedOp = aes128EcbEncrypt(kiBuffer, opBuffer);

    // XOR the encrypted OP with the original OP to derive OPc
    const opcBuffer = bufferXor(encryptedOp, opBuffer);

    // Return OPc as an uppercase hexadecimal string
    return opcBuffer.toString("hex").toUpperCase();
}
