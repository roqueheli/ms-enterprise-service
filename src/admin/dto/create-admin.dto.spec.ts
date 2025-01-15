import { validate } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';

describe('CreateAdminDto', () => {
    let dto: CreateAdminDto;

    beforeEach(() => {
        dto = new CreateAdminDto();
        dto.email = 'admin@empresa.com';
        dto.first_name = 'Juan Carlos';
        dto.last_name = 'Rodríguez Pérez';
        dto.password_hash = 'password123';
    });

    it('should validate a correct dto', async () => {
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    describe('email validation', () => {
        it('should fail with an invalid email', async () => {
            dto.email = 'invalid-email';
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isEmail');
            expect(errors[0].property).toBe('email');
        });

        it('should fail with an empty email', async () => {
            dto.email = '';
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isEmail');
            expect(errors[0].property).toBe('email');
        });

        it('should pass with a valid email', async () => {
            dto.email = 'test@example.com';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('first_name validation', () => {
        it('should fail with a name shorter than 2 characters', async () => {
            dto.first_name = 'J';
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('minLength');
            expect(errors[0].property).toBe('first_name');
        });

        it('should fail with a name longer than 100 characters', async () => {
            dto.first_name = 'J'.repeat(101);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('maxLength');
            expect(errors[0].property).toBe('first_name');
        });

        it('should fail with a non-string value', async () => {
            (dto as any).first_name = 123;
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
            expect(errors[0].property).toBe('first_name');
        });

        it('should pass with a valid name', async () => {
            dto.first_name = 'Juan Carlos';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('last_name validation', () => {
        it('should fail with a last name shorter than 2 characters', async () => {
            dto.last_name = 'R';
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('minLength');
            expect(errors[0].property).toBe('last_name');
        });

        it('should fail with a last name longer than 100 characters', async () => {
            dto.last_name = 'R'.repeat(101);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('maxLength');
            expect(errors[0].property).toBe('last_name');
        });

        it('should fail with a non-string value', async () => {
            (dto as any).last_name = 123;
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
            expect(errors[0].property).toBe('last_name');
        });

        it('should pass with a valid last name', async () => {
            dto.last_name = 'Rodríguez Pérez';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('password_hash validation', () => {
        it('should fail with a password shorter than 6 characters', async () => {
            dto.password_hash = '12345';
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('minLength');
            expect(errors[0].property).toBe('password_hash');
        });

        it('should fail with a non-string value', async () => {
            (dto as any).password_hash = 123456;
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
            expect(errors[0].property).toBe('password_hash');
        });

        it('should pass with a valid password', async () => {
            dto.password_hash = 'password123';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO', async () => {
            const validDto = new CreateAdminDto();
            validDto.email = 'admin@empresa.com';
            validDto.first_name = 'Juan Carlos';
            validDto.last_name = 'Rodríguez Pérez';
            validDto.password_hash = 'password123';

            const errors = await validate(validDto);
            expect(errors.length).toBe(0);
        });

        it('should fail with missing required fields', async () => {
            const invalidDto = new CreateAdminDto();
            const errors = await validate(invalidDto);

            expect(errors.length).toBe(4); // Debería haber un error por cada campo requerido
            const errorProperties = errors.map(error => error.property);
            expect(errorProperties).toContain('email');
            expect(errorProperties).toContain('first_name');
            expect(errorProperties).toContain('last_name');
            expect(errorProperties).toContain('password_hash');
        });
    });
});