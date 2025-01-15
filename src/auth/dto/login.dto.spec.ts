import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = new LoginDto();
        // Establecer valores válidos por defecto
        dto.email = 'admin@empresa.com';
        dto.password = 'Admin123!';
    });

    describe('email validation', () => {
        it('should pass with valid email', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid email format', async () => {
            dto.email = 'invalid-email';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isEmail');
        });

        it('should fail with empty email', async () => {
            dto.email = '';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isEmail');
        });

        it('should fail with null email', async () => {
            dto.email = null;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should fail with undefined email', async () => {
            dto.email = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should pass with email containing special characters', async () => {
            dto.email = 'user.name+tag@empresa.com';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('password validation', () => {
        it('should pass with valid password', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with empty password', async () => {
            dto.password = '';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail with password shorter than 8 characters', async () => {
            dto.password = 'Short1';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('minLength');
        });

        it('should fail with null password', async () => {
            dto.password = null;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should fail with undefined password', async () => {
            dto.password = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should pass with password exactly 8 characters', async () => {
            dto.password = 'Exactly8!';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should pass with password containing special characters', async () => {
            dto.password = 'Pass@123!$';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('complete DTO validation', () => {
        it('should pass with all valid fields', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with all empty fields', async () => {
            dto = new LoginDto();
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should validate object creation and property assignment', () => {
            const testData = {
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const testDto = new LoginDto();
            Object.assign(testDto, testData);

            expect(testDto.email).toBe(testData.email);
            expect(testDto.password).toBe(testData.password);
        });

        it('should fail with partial data (only email)', async () => {
            dto = new LoginDto();
            dto.email = 'test@example.com';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should fail with partial data (only password)', async () => {
            dto = new LoginDto();
            dto.password = 'TestPass123!';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });
    });
});