import * as crypto from "crypto";

export function generateSqn(): string {
    // 48 bits = 6 bytes (each byte is 8 bits)
    const maxBytes: number = 6;
    const randomBytes = new Uint8Array(maxBytes);
    // Fill the array with random bytes
    crypto.getRandomValues(randomBytes);
    let sqn = Array.from(randomBytes)
        // Convert each bytes to HEX by making sure that ech number is always two hexadecimal digits
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    return sqn;
}