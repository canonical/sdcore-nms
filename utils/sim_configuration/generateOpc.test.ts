import { generateRandomKey, generateOpc, aes128GcmEncrypt,  bufferXor} from "./generateOpc";
import * as crypto from 'crypto';


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

    describe('aes128GcmEncrypt', () => {
        it('should correctly encrypt a 16-byte block using AES-128-GCM', () => {
            const key = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
            const data = Buffer.from('1234567890ABCDEF1234567890ABCDEF', 'hex');
            const iv = Buffer.from('000000000000', 'binary');
            const expectedCiphertext = Buffer.from([
                35, 207, 52, 2, 207, 5, 46, 100, 222, 45, 142, 75, 24, 138, 198, 223,
            ]);
            const { ciphertext } = aes128GcmEncrypt(key, data, iv);
            expect(ciphertext).toEqual(expectedCiphertext);
        });

        it('should throw an error if key length is invalid', () => {
            // Too short key
            const invalidKey = Buffer.from('0123456789ABCDEF', 'hex');
            const data = Buffer.from('1234567890ABCDEF1234567890ABCDEF', 'hex');

            const iv = crypto.randomBytes(12); // Generate a 12-byte IV for AES-GCM
            expect(() => aes128GcmEncrypt(invalidKey, data, iv)).toThrow();
        });

        it('should throw an error if data block is empty', () => {
            const key = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
            // Too long data block
            const invalidData = Buffer.from('', 'hex');

            const iv = crypto.randomBytes(12);
            expect(() => aes128GcmEncrypt(key, invalidData, iv)).toThrow();
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

        it('should generate a valid OPc from given valid OP and KI', () => {
            const result = generateOpc(validOp, validKi);
            expect(result).toMatch(/^[A-F0-9]{32}$/);
        });

        it('should throw an error if OP is not a 32-character hex string', () => {
            // 30 characters Op
            const invalidOp = '00112233445566778899AABBCCDD';

            expect(() => generateOpc(invalidOp, validKi)).toThrow(
                'Invalid OP: Must be a 128-bit hexadecimal string (32 characters).'
            );
        });

        it('should throw an error if KI is not a 32-character hex string', () => {
            // 12 characters Ki
            const invalidKi = '8899AABBCCDD';
            expect(() => generateOpc(validOp, invalidKi)).toThrow(
                'Invalid KI: Must be a 128-bit hexadecimal string (32 characters).'
            );
        });
    });
});
