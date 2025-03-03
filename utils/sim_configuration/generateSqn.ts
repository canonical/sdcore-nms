import * as crypto from "crypto";

export function generateSqn(): string {
    // 48 bytes = 6 bytes (each byte is 8 bits)
    const maxBytes: number = 6;
    // Create an array of 6 random bytes (48 bits)
    const randomBytes = new Uint8Array(maxBytes);
    // Use the cyrpto API to fill the array with random bytes
    crypto.getRandomValues(randomBytes);
    // Convert the random bytes to a hexadecimal string (12 digits)
    let sqn = Array.from(randomBytes)
        // Convert each bytes to HEX by making sure that ech number is always two hexadecimal digits
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
        // Make sure that it is Uppercase
        .toUpperCase();
    return sqn;
}