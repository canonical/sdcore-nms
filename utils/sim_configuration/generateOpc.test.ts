import { generateRandomKey, generateOpc, aes128EncryptBlock,  bufferXor} from "./generateOpc";


describe('OPc Generator Unit Tests', () => {
    describe('generateRandomKey', () => {
        it('should generate a 32-character uppercase hexadecimal string', () => {
            const result = generateRandomKey();
            expect(result).toMatch(/^[A-F0-9]{32}$/);
            expect(result).toHaveLength(32);
        });

        it('should generate a unique key each time it is called', () => {
            const result1 = generateRandomKey();
            const result2 = generateRandomKey();
            expect(result1).not.toBe(result2);
        });
    });

    describe('aes128EncryptBlock', () => {
        it('should correctly encrypt a 16-byte block using AES-128-ECB', async () => {
            const key = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
            const data = Buffer.from('1234567890ABCDEF1234567890ABCDEF', 'hex');
            const expectedCiphertext = Uint8Array.from([
                13, 211, 125, 240, 149, 254, 179, 139, 232, 133, 159, 133, 40, 145, 2, 40
            ]);
            const ciphertext = await aes128EncryptBlock(key, data);
            expect(ciphertext).toEqual(expectedCiphertext);
            expect(ciphertext).toBeInstanceOf(Uint8Array);
            expect(ciphertext.length).toBe(16);
        });

        it('should throw an error if key length is invalid', async () => {
            // Too short key
            const invalidKey = Buffer.from('0123456789ABCDEF', 'hex');
            const data = Buffer.from('1234567890ABCDEF1234567890ABCDEF', 'hex');
            await expect(aes128EncryptBlock(invalidKey, data)).rejects.toThrow(
                'Key must be 16 bytes (128 bits) for AES-128 encryption.'
            );
        });

        it('should throw an error if input data is empty', async() => {
            const key = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
            // Empty data block
            const invalidData = Buffer.from('', 'hex');
            await expect(() => aes128EncryptBlock(key, invalidData)).rejects.toThrow(
                'Input data must be 16 bytes (128 bits) for AES-128 encryption.');
        });
    });

    describe('bufferXor', () => {
        it('should correctly XOR two buffers of equal length', () => {
            const buf1 = Buffer.from([0xAA, 0xBB, 0xCC]);
            const buf2 = Buffer.from([0x11, 0x22, 0x33]);
            const expected = Buffer.from([0xBB, 0x99, 0xFF]);

            const result = bufferXor(buf1, buf2);
            expect(result).toEqual(expected);
        });

        it('should throw an error if buffers are not in equal length', () => {
            const buf1 = Buffer.from([0xAA, 0xBB]);
            const buf2 = Buffer.from([0x11, 0x22, 0x33]);

            expect(() => bufferXor(buf1, buf2)).toThrow('Buffers must have the same length for XOR.');
        });

        it('should return a buffer with all zeros when XORed with itself', () => {
            const buf = Buffer.from([0xAA, 0xBB, 0xCC]);
            const expected = Buffer.from([0x00, 0x00, 0x00]);

            const result = bufferXor(buf, buf);
            expect(result).toEqual(expected);
        });
    });

    describe('generateOpc', () => {
        const validOp = '00112233445566778899AABBCCDDEEFF';
        const validKi = '8899AABBCCDDEEFF0011223344556677';

        it('should generate a valid OPc from given valid OP and KI', async () => {
            const result = await generateOpc(validOp, validKi);
            expect(result).toMatch(/^[A-F0-9]{32}$/);
        });

        it('should throw an error if OP is not a 32-character hex string', async () => {
            // 30 characters Op
            const invalidOp = '00112233445566778899AABBCCDD';

            await expect(generateOpc(invalidOp, validKi)).rejects.toThrow(
                'Invalid OP: Must be a 128-bit hexadecimal string (32 characters).'
            );
        });

        it('should throw an error if KI is not a 32-character hex string', async () => {
            // 12 characters Ki
            const invalidKi = '8899AABBCCDD';
            await expect(generateOpc(validOp, invalidKi)).rejects.toThrow(
                'Invalid KI: Must be a 128-bit hexadecimal string (32 characters).'
            );
        });
    });
});
