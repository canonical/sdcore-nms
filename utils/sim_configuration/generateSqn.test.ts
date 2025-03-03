import { generateSqn } from "./generateSqn";


describe('SQN Generator Unit Tests', () => {
    describe('generateSqn', () => {
        it('should generate a 12-character uppercase hexadecimal string', () => {
            const result = generateSqn();
            expect(result).toHaveLength(12);
            expect(result).toMatch(/^[A-F0-9]{12}$/);
        });
        it('should generate unique strings', () => {
            const result1 = generateSqn();
            const result2 = generateSqn();
            expect(result1).not.toEqual(result2);
        });
        it('should always return a 12-character string', () => {
            for (let i = 0; i < 100; i++) {
                const result = generateSqn();
                expect(result).toHaveLength(12);
            }
        });

    });
})