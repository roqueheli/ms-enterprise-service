import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AccessType, EnterpriseSettingsDto, ReportGenerationType } from './enterprise-settings.dto';
import { UpdateEnterpriseDto } from './update-enterprise.dto';

describe('UpdateEnterpriseDto', () => {
    let validUpdateData: any;

    beforeEach(() => {
        validUpdateData = {
            name: 'Updated TechCorp Inc.',
            description: 'Updated description',
            website: 'https://updated-techcorp.com',
            industry: 'Technology',
            contact_email: 'updated@techcorp.com',
            settings: {
                report_generation_type: ReportGenerationType.IMMEDIATE,
                access_type: AccessType.FULL
            }
        };
    });

    describe('Basic validation', () => {
        it('should validate with all fields', async () => {
            const dto = plainToInstance(UpdateEnterpriseDto, validUpdateData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with no fields (empty update)', async () => {
            const dto = plainToInstance(UpdateEnterpriseDto, {});
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with partial fields', async () => {
            const partialData = {
                name: 'Updated Name',
                contact_email: 'new@email.com'
            };
            const dto = plainToInstance(UpdateEnterpriseDto, partialData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Inherited field validations', () => {
        it('should validate name when provided', async () => {
            const invalidData = {
                name: 123 // invalid type
            };
            const dto = plainToInstance(UpdateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints?.isString).toBeDefined();
        });

        it('should validate contact_email when provided', async () => {
            const invalidData = {
                contact_email: 'invalid-email'
            };
            const dto = plainToInstance(UpdateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('contact_email');
            expect(errors[0].constraints?.isEmail).toBeDefined();
        });

        it('should validate website when provided', async () => {
            const invalidData = {
                website: 'invalid-url'
            };
            const dto = plainToInstance(UpdateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('website');
            expect(errors[0].constraints?.isUrl).toBeDefined();
        });
    });

    describe('Settings validation', () => {
        it('should validate with valid settings', async () => {
            const data = {
                settings: {
                    report_generation_type: ReportGenerationType.IMMEDIATE,
                    access_type: AccessType.FULL
                }
            };
            const dto = plainToInstance(UpdateEnterpriseDto, data);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with partial settings', async () => {
            const data = {
                settings: {
                    report_generation_type: ReportGenerationType.BATCH
                }
            };
            const dto = plainToInstance(UpdateEnterpriseDto, data);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid settings values', async () => {
            const invalidData = {
                settings: {
                    report_generation_type: 'invalid_type',
                    access_type: 'invalid_access'
                }
            };
            const dto = plainToInstance(UpdateEnterpriseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const settingsErrors = errors.find(error => error.property === 'settings');
            expect(settingsErrors).toBeDefined();
        });
    });

    describe('Type transformations', () => {
        it('should transform settings to EnterpriseSettingsDto instance', () => {
            const dto = plainToInstance(UpdateEnterpriseDto, validUpdateData);
            expect(dto.settings).toBeInstanceOf(EnterpriseSettingsDto);
        });

        it('should handle null settings', () => {
            const dataWithNullSettings = { ...validUpdateData, settings: null };
            const dto = plainToInstance(UpdateEnterpriseDto, dataWithNullSettings);
            expect(dto.settings).toBeNull();
        });
    });

    describe('Multiple field updates', () => {
        it('should validate multiple field updates simultaneously', async () => {
            const multipleUpdates = {
                name: 'New Name',
                contact_email: 'new@email.com',
                website: 'https://new-website.com',
                settings: {
                    report_generation_type: ReportGenerationType.BATCH,
                    access_type: AccessType.LIMITED
                }
            };
            const dto = plainToInstance(UpdateEnterpriseDto, multipleUpdates);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should report multiple validation errors simultaneously', async () => {
            const invalidUpdates = {
                name: 123,
                contact_email: 'invalid-email',
                website: 'invalid-url',
                settings: {
                    report_generation_type: 'invalid_type'
                }
            };
            const dto = plainToInstance(UpdateEnterpriseDto, invalidUpdates);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const properties = errors.map(error => error.property);
            expect(properties).toContain('name');
            expect(properties).toContain('contact_email');
            expect(properties).toContain('website');
        });
    });
});