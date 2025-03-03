import {IMSIGenerationError, InvalidDataError} from "@/utils/errors";
import { randomBytes } from "crypto";

export function generateUniqueImsi(
    // 3 digits
    mcc: string,
    // 2 or 3 digits
    mnc: string,
    // A set of existing IMSIs to ensure uniqueness
    existingIMSIs: Set<string>,
    // Use maxAttempts to avoid infinite loop
    maxAttempts: number = 1000000
): string {

    // Validate MCC
    if (!/^\d{3}$/.test(mcc)) {
        throw new InvalidDataError("Invalid MCC. It must be exactly 3 digits.");
    }

    // Validate MNC (2 or 3 digits)
    if (!/^\d{2,3}$/.test(mnc)) {
        throw new InvalidDataError("Invalid MNC. It must be 2 or 3 digits.");
    }

    let attempts = 0;

    while (attempts < maxAttempts) {
        // Generate 10 random bytes and converts each byte to a single digit (0–9)
        // Then, join digits to make a string
        const msin = Array.from(randomBytes(10), byte => byte % 10).join('');

        // Concatenate MCC, MNC, and MSIN
        const imsi = `${mcc}${mnc}${msin}`;

        // Check for uniqueness
        if (!existingIMSIs.has(imsi)) {
            // Add IMSI to the set
            existingIMSIs.add(imsi);
            return imsi;
        }

        attempts++;
    }

    // If max attempts are reached, throw an error
    throw new IMSIGenerationError(
        `Failed to generate a unique IMSI after ${maxAttempts} attempts for MCC: ${mcc}, MNC: ${mnc}.`
    );
}
