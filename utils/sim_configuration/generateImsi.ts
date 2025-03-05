import {IMSIGenerationError, InvalidDataError} from "@/utils/errors";
import { randomBytes } from "crypto";
import { getAllImsis } from "@/utils/callSubscriberApi"

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

    let attempts = 0;
    // maxAttempts usage is a workaround until we implement the fix in the Webconsole to
    // return Conflict (409) error for an existing subscriber.
    let maxAttempts = 1000;

    while (attempts < maxAttempts) {
        // Generate 10 random bytes and converts each byte to a single digit (0–9)
        // Then, join digits to make a string
        const msin = Array.from(randomBytes(10), byte => byte % 10).join('');

        // Concatenate MCC, MNC, and MSIN
        const imsi = `${mcc}${mnc}${msin}`;
        const existingIMSIs = await getAllImsis(token);
        // Check for uniqueness
        if (!existingIMSIs.has(imsi)) {
            return imsi;
        }
        attempts++;
    }

    const errorMessage = `Failed to generate a unique IMSI after ${maxAttempts} attempts using MCC: ${mcc}, MNC: ${mnc}.`;
    console.error(`generateUniqueImsi Error: ${errorMessage}`);
    throw new IMSIGenerationError(errorMessage);
}
