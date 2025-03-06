import * as crypto from "crypto";
import { OperationError } from "../errors";

export function generateSqn(): string {

    try {
        // 48 bits = 6 bytes (each byte is 8 bits)
        const maxBytes: number = 6;
        const randomBytes = crypto.randomBytes(maxBytes);
        let sqn = Array.from(randomBytes)
            // Convert each byte to HEX by making sure that ech number is always two hexadecimal digits
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
        return sqn;
    } catch (error) {
        console.error(`Error generating SQN: ${error}`);
        throw new OperationError(`SQN generation failed: ${error}`);
    }

}