import { InvalidDataError } from "@/utils/errors";
import { randomBytes } from "crypto";

export async function generateUniqueImsi(
    // 3 digits
    mcc: string,
    // 2 or 3 digits
    mnc: string,
    // A valid token
    token: string,
): Promise<string> {

    // Validate MCC
    if (!/^\d{3}$/.test(mcc)) {
        const errorMessage = "Invalid MCC. It must be exactly 3 digits.";
        console.error(`generateUniqueImsi Error: ${errorMessage}`);
        throw new InvalidDataError(errorMessage);
    }

    // Validate MNC (2 or 3 digits)
    if (!/^\d{2,3}$/.test(mnc)) {
        const errorMessage = "Invalid MNC. It must be 2 or 3 digits.";
        console.error(`generateUniqueImsi Error: ${errorMessage}`);
        throw new InvalidDataError(errorMessage);
    }

    // Generate 10 random bytes and converts each byte to a single digit (0–9)
    // Then, join digits to make a string
    const msin = Array.from(randomBytes(10), byte => Math.floor(byte / 25.6)).join('');
    // Concatenate MCC, MNC, and MSIN
    return`${mcc}${mnc}${msin}`;
}

