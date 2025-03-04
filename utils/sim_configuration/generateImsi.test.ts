import { generateUniqueImsi } from "./generateImsi";


jest.mock("../callSubscriberApi", () => ({
    getAllImsis: jest.fn().mockResolvedValue(new Set(['mock-value'])),
}));
describe('IMSI Generator Unit Tests', () => {
    const token = "test-token";
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should generate a unique IMSI with valid MCC, MNC", async () => {
        const mcc = "310";
        const mnc = "410";

        const imsi = await generateUniqueImsi(mcc, mnc, token);

        // Validate that the generated IMSI starts with MCC + MNC and is 16 digits long
        expect(imsi).toMatch(new RegExp(`^${mcc}${mnc}\\d{10}$`));
        // IMSI length should be 16.
        expect(imsi.length).toEqual(16);
    });

    it("should throw InvalidDataError if MCC is not exactly 3 digits", async () => {
        // Invalid MCC (only 2 digits)
        const mcc = "31";
        const mnc = "410";
        await expect(generateUniqueImsi(mcc, mnc, token)).rejects.toThrow("Invalid MCC. It must be exactly 3 digits.");
    });

    it("should throw InvalidDataError if MNC is not 2 or 3 digits", async () => {
        const mcc = "310";
        const mnc = "4"; // Invalid MNC (only 1 digit)
        await expect(generateUniqueImsi(mcc, mnc, token)).rejects.toThrow("Invalid MNC. It must be 2 or 3 digits.");
    });

    it("should generate multiple unique IMSIs for the same MCC and MNC", async () => {
        const mcc = "310";
        const mnc = "410";

        const imsi1 = await generateUniqueImsi(mcc, mnc, token);
        const imsi2 = await generateUniqueImsi(mcc, mnc, token);

        // Both IMSIs should start with the same MCC + MNC, but must be different
        expect(imsi1).not.toEqual(imsi2);
    });
    });