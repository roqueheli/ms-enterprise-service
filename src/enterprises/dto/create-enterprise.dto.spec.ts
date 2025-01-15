// src/enterprises/dto/create-enterprise.dto.spec.ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEnterpriseDto } from './create-enterprise.dto';
import { EnterpriseSettingsDto } from './enterprise-settings.dto';

describe('CreateEnterpriseDto', () => {
    let validEnterpriseData: any;

    beforeEach(() => {
        validEnterpriseData = {
            name: 'TechCorp Inc.',
            description: 'Empresa líder en soluciones tecnológicas',
            website: 'https://techcorp.com',
            industry: 'Medical',
            contact_email: 'contact@techcorp.com',
            settings: {
                theme: 'light',
                language: 'es'
            }
        };
    });

    describe('Validaciones básicas', () => {
        it('should validate a complete and valid enterprise dto', async () => {
            const dto = plainToInstance(CreateEnterpriseDto, validEnterpriseData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only required fields', async () => {
            const minimalData = {
                name: 'TechCorp Inc.',
                contact_email: 'contact@techcorp.com'
            };
            const dto = plainToInstance(CreateEnterpriseDto, minimalData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('name validations', () => {
        it('should fail when name is missing', async () => {
            const { name, ...dataWithoutName } = validEnterpriseData;
            const dto = plainToInstance(CreateEnterpriseDto, dataWithoutName);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints?.isString).toBeDefined();
        });

        it('should fail when name is not a string', async () => {
            const invalidData = { ...validEnterpriseData, name: 123 };
            const dto = plainToInstance(CreateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints?.isString).toBeDefined();
        });
    });

    describe('contact_email validations', () => {
        it('should fail when contact_email is missing', async () => {
            const { contact_email, ...dataWithoutEmail } = validEnterpriseData;
            const dto = plainToInstance(CreateEnterpriseDto, dataWithoutEmail);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('contact_email');
            expect(errors[0].constraints?.isEmail).toBeDefined();
        });

        it('should fail with invalid email format', async () => {
            const invalidData = { ...validEnterpriseData, contact_email: 'invalid-email' };
            const dto = plainToInstance(CreateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('contact_email');
            expect(errors[0].constraints?.isEmail).toBeDefined();
        });
    });

    describe('website validations', () => {
        it('should accept valid URL', async () => {
            const dto = plainToInstance(CreateEnterpriseDto, validEnterpriseData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid URL format', async () => {
            const invalidData = { ...validEnterpriseData, website: 'invalid-url' };
            const dto = plainToInstance(CreateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('website');
            expect(errors[0].constraints?.isUrl).toBeDefined();
        });
    });

    describe('settings validations', () => {
        it('should accept valid settings object', async () => {
            const dto = plainToInstance(CreateEnterpriseDto, validEnterpriseData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should accept undefined settings', async () => {
            const { settings, ...dataWithoutSettings } = validEnterpriseData;
            const dto = plainToInstance(CreateEnterpriseDto, dataWithoutSettings);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should transform settings to EnterpriseSettingsDto instance', () => {
            const dto = plainToInstance(CreateEnterpriseDto, validEnterpriseData);
            expect(dto.settings).toBeInstanceOf(EnterpriseSettingsDto);
        });
    });

    describe('optional fields validations', () => {
        it('should accept missing optional fields', async () => {
            const minimalData = {
                name: 'TechCorp Inc.',
                contact_email: 'contact@techcorp.com'
            };
            const dto = plainToInstance(CreateEnterpriseDto, minimalData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate optional fields when provided', async () => {
            const dto = plainToInstance(CreateEnterpriseDto, validEnterpriseData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail when optional fields have invalid types', async () => {
            const invalidData = {
                ...validEnterpriseData,
                description: 123,
                industry: 456
            };
            const dto = plainToInstance(CreateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const properties = errors.map(error => error.property);
            expect(properties).toContain('description');
            expect(properties).toContain('industry');
        });
    });
});