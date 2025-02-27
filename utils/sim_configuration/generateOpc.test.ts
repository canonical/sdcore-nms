import { generateRandomKey, generateOpc, aes128EcbEncrypt,  bufferXor} from "./generateOpc";
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

    describe('aes128EcbEncrypt', () => {
        it('should correctly encrypt a 16-byte block using AES-128-ECB', () => {
            const key = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
            const data = Buffer.from('1234567890ABCDEF1234567890ABCDEF', 'hex');

            const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
            cipher.setAutoPadding(false);
            const expectedEncryptedData = Buffer.concat([cipher.update(data), cipher.final()]);

            const result = aes128EcbEncrypt(key, data);
            expect(result).toEqual(expectedEncryptedData);
        });

        it('should throw an error if key length is invalid', () => {
            // Too short key
            const invalidKey = Buffer.from('0123456789ABCDEF', 'hex');
            const data = Buffer.from('1234567890ABCDEF1234567890ABCDEF', 'hex');

            expect(() => aes128EcbEncrypt(invalidKey, data)).toThrow();
        });

        it('should throw an error if data block length is not 16 bytes', () => {
            const key = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
            // Too long data block
            const invalidData = Buffer.from('1234567890AB0123456789ABCDEF01234567', 'hex');

            expect(() => aes128EcbEncrypt(key, invalidData)).toThrow();
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

        it('should throw an error if parsed buffers for OP or KI are not 16 bytes', () => {
            // 4 bytes Op
            const invalidOp = '00112233';
            // 8 bytes Ki
            const invalidKi = 'AABBCCDDEEFF0011';

            expect(() => generateOpc(invalidOp, validKi)).toThrow(
                'Invalid OP: Must be a 128-bit hexadecimal string (32 characters).'
            );
            expect(() => generateOpc(validOp, invalidKi)).toThrow(
                'Invalid KI: Must be a 128-bit hexadecimal string (32 characters).'
            );
        });
    });
});
