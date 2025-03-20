import {
  generateRandomKey,
  generateOpc,
  aes128EncryptBlock,
  bufferXor,
} from "./generateOpc";

describe("Helper Functions Unit Tests", () => {
  describe("generateRandomKey", () => {
    it("should generate a 32-character uppercase hexadecimal string", () => {
      const result = generateRandomKey();
      expect(result).toMatch(/^[A-F0-9]{32}$/);
      expect(result).toHaveLength(32);
    });

    it("should generate a unique key each time it is called", () => {
      const result1 = generateRandomKey();
      const result2 = generateRandomKey();
      expect(result1).not.toBe(result2);
    });
  });

  describe("aes128EncryptBlock", () => {
    it("should correctly encrypt a 16-byte block using AES-128-ECB", () => {
      const key = Buffer.from("0123456789ABCDEF0123456789ABCDEF", "hex");
      const data = Buffer.from("1234567890ABCDEF1234567890ABCDEF", "hex");
      const expectedCiphertext = Uint8Array.from([
        13, 211, 125, 240, 149, 254, 179, 139, 232, 133, 159, 133, 40, 145, 2,
        40,
      ]);
      const ciphertext = aes128EncryptBlock(key, data);
      expect(ciphertext).toEqual(expectedCiphertext);
      expect(ciphertext).toBeInstanceOf(Uint8Array);
      expect(ciphertext.length).toBe(16);
    });

    it("should throw an error if key length is invalid", () => {
      // Too short key
      const invalidKey = Buffer.from("0123456789ABCDEF", "hex");
      const data = Buffer.from("1234567890ABCDEF1234567890ABCDEF", "hex");
      expect(() => aes128EncryptBlock(invalidKey, data)).toThrow(
        "Key must be 16 bytes (128 bits) for AES-128 encryption.",
      );
    });

    it("should throw an error if input data is empty", () => {
      const key = Buffer.from("0123456789ABCDEF0123456789ABCDEF", "hex");
      // Empty data block
      const invalidData = Buffer.from("", "hex");
      expect(() => aes128EncryptBlock(key, invalidData)).toThrow(
        "Input data must be 16 bytes (128 bits) for AES-128 encryption.",
      );
    });
  });

  describe("bufferXor", () => {
    it("should correctly XOR two buffers of equal length", () => {
      const buf1 = Buffer.from([0xaa, 0xbb, 0xcc]);
      const buf2 = Buffer.from([0x11, 0x22, 0x33]);
      const expected = Buffer.from([0xbb, 0x99, 0xff]);

      const result = bufferXor(buf1, buf2);
      expect(result).toEqual(expected);
    });

    it("should throw an error if buffers are not in equal length", () => {
      const buf1 = Buffer.from([0xaa, 0xbb]);
      const buf2 = Buffer.from([0x11, 0x22, 0x33]);

      expect(() => bufferXor(buf1, buf2)).toThrow(
        "Buffers must have the same length for XOR.",
      );
    });

    it("should return a buffer with all zeros when XORed with itself", () => {
      const buf = Buffer.from([0xaa, 0xbb, 0xcc]);
      const expected = Buffer.from([0x00, 0x00, 0x00]);

      const result = bufferXor(buf, buf);
      expect(result).toEqual(expected);
    });
  });
  describe("generateOpc", () => {
    test("should generate valid OPc and Ki as uppercase hex strings", () => {
      const result = generateOpc();
      expect(result.opc).toMatch(/^[A-F0-9]{32}$/);
      expect(result.ki).toMatch(/^[A-F0-9]{32}$/);
    });
  });
});
