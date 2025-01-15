// src/admin/dto/update-admin.dto.spec.ts
import { validate } from 'class-validator';
import { UpdateAdminDto } from './update-admin.dto';

describe('UpdateAdminDto', () => {
    let dto: UpdateAdminDto;

    beforeEach(() => {
        dto = new UpdateAdminDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    it('should allow empty object (no properties)', async () => {
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    describe('partial updates', () => {
        it('should validate with only email', async () => {
            dto.email = 'test@example.com';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only first_name', async () => {
            dto.first_name = 'Juan Carlos';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only last_name', async () => {
            dto.last_name = 'Rodríguez Pérez';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only password_hash', async () => {
            dto.password_hash = 'newpassword123';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with multiple properties', async () => {
            dto.first_name = 'Juan Carlos';
            dto.last_name = 'Rodríguez Pérez';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('validation rules inheritance', () => {
        describe('email validation', () => {
            it('should fail with an invalid email', async () => {
                dto.email = 'invalid-email';
                const errors = await validate(dto);

                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].constraints).toHaveProperty('isEmail');
                expect(errors[0].property).toBe('email');
            });

            it('should pass with a valid email', async () => {
                dto.email = 'admin@empresa.com';
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
        });

        describe('password_hash validation', () => {
            it('should fail with a password shorter than 6 characters', async () => {
                dto.password_hash = '12345';
                const errors = await validate(dto);

                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].constraints).toHaveProperty('minLength');
                expect(errors[0].property).toBe('password_hash');
            });

            it('should pass with a valid password', async () => {
                dto.password_hash = 'password123';
                const errors = await validate(dto);
                expect(errors.length).toBe(0);
            });
        });
    });

    describe('complete update scenario', () => {
        it('should validate a complete valid update', async () => {
            dto.email = 'admin@empresa.com';
            dto.first_name = 'Juan Carlos';
            dto.last_name = 'Rodríguez Pérez';
            dto.password_hash = 'password123';

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with mixed valid and undefined properties', async () => {
            dto.email = 'admin@empresa.com';
            dto.first_name = 'Juan Carlos';
            // last_name y password_hash se dejan undefined intencionalmente

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('type checking', () => {
        it('should fail with non-string values', async () => {
            const invalidDto = new UpdateAdminDto();
            (invalidDto as any).first_name = 123;
            (invalidDto as any).last_name = 456;
            (invalidDto as any).email = 789;
            (invalidDto as any).password_hash = 101112;

            const errors = await validate(invalidDto);

            // Verificamos que hay errores para cada campo
            expect(errors.length).toBe(4);

            // Verificamos las restricciones específicas para cada campo
            const firstNameError = errors.find(error => error.property === 'first_name');
            expect(firstNameError).toBeDefined();
            expect(firstNameError?.constraints).toHaveProperty('isString');

            const lastNameError = errors.find(error => error.property === 'last_name');
            expect(lastNameError).toBeDefined();
            expect(lastNameError?.constraints).toHaveProperty('isString');

            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail'); // El email tiene una validación específica

            const passwordHashError = errors.find(error => error.property === 'password_hash');
            expect(passwordHashError).toBeDefined();
            expect(passwordHashError?.constraints).toHaveProperty('isString');
        });
    });
});