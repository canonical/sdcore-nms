import { generateUniqueImsi } from "@/utils/sim_configuration/generateImsi";


describe('IMSI Generator Unit Tests', () => {
    let existingIMSIs: Set<string>;
    beforeEach(() => {
        // Initialize an empty set of existing IMSIs for each test
        // In the implementation, getAllImsis from @utils/callSubscriberApi should be called to get existingIMSIs.
        existingIMSIs = new Set();
    });
    it("should generate a unique IMSI with valid MCC, MNC", () => {
        const mcc = "310";
        const mnc = "410";

        const imsi = generateUniqueImsi(mcc, mnc, existingIMSIs);

        // Validate that the generated IMSI starts with MCC + MNC and is 16 digits long
        expect(imsi).toMatch(new RegExp(`^${mcc}${mnc}\\d{10}$`));
        // IMSI length should be 16.
        expect([16]).toContain(imsi.length);
        // Validate that the generated IMSI was added to the set
        expect(existingIMSIs.has(imsi)).toBeTruthy();
    });

    it("should throw InvalidDataError if MCC is not exactly 3 digits", () => {
        // Invalid MCC (only 2 digits)
        const mcc = "31";
        const mnc = "410";
        expect(() => generateUniqueImsi(mcc, mnc, existingIMSIs)).toThrow("Invalid MCC. It must be exactly 3 digits.");
    });

    it("should throw InvalidDataError if MNC is not 2 or 3 digits", () => {
        const mcc = "310";
        const mnc = "4"; // Invalid MNC (only 1 digit)
        expect(() => generateUniqueImsi(mcc, mnc, existingIMSIs)).toThrow("Invalid MNC. It must be 2 or 3 digits.");
    });

    it("should generate multiple unique IMSIs for the same MCC and MNC", () => {
        const mcc = "310";
        const mnc = "410";

        const imsi1 = generateUniqueImsi(mcc, mnc, existingIMSIs);
        const imsi2 = generateUniqueImsi(mcc, mnc, existingIMSIs);

        // Both IMSIs should start with the same MCC + MNC, but must be different
        expect(imsi1).not.toEqual(imsi2);
        expect(existingIMSIs.size).toBe(2);
    });
    });