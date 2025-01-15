import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
    AccessType,
    EnterpriseSettingsDto,
    ReportGenerationType
} from './enterprise-settings.dto';

describe('EnterpriseSettingsDto', () => {
    let validSettingsData: any;

    beforeEach(() => {
        validSettingsData = {
            id: '1',
            report_generation_type: ReportGenerationType.IMMEDIATE,
            access_type: AccessType.FULL
        };
    });

    describe('Basic validation', () => {
        it('should validate a complete valid settings dto', async () => {
            const dto = plainToInstance(EnterpriseSettingsDto, validSettingsData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with no optional fields', async () => {
            const minimalData = {
                id: '1'
            };
            const dto = plainToInstance(EnterpriseSettingsDto, minimalData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with partial optional fields', async () => {
            const partialData = {
                id: '1',
                report_generation_type: ReportGenerationType.IMMEDIATE
            };
            const dto = plainToInstance(EnterpriseSettingsDto, partialData);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('report_generation_type validations', () => {
        it('should accept valid report generation types', async () => {
            const validTypes = Object.values(ReportGenerationType);

            for (const type of validTypes) {
                const data = { ...validSettingsData, report_generation_type: type };
                const dto = plainToInstance(EnterpriseSettingsDto, data);
                const errors = await validate(dto);
                expect(errors.length).toBe(0);
            }
        });

        it('should fail with invalid report generation type', async () => {
            const invalidData = {
                ...validSettingsData,
                report_generation_type: 'invalid_type'
            };
            const dto = plainToInstance(EnterpriseSettingsDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('report_generation_type');
            expect(errors[0].constraints?.isEnum).toBeDefined();
        });

        it('should accept undefined report generation type', async () => {
            const { report_generation_type, ...dataWithoutReportType } = validSettingsData;
            const dto = plainToInstance(EnterpriseSettingsDto, dataWithoutReportType);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('access_type validations', () => {
        it('should accept valid access types', async () => {
            const validTypes = Object.values(AccessType);

            for (const type of validTypes) {
                const data = { ...validSettingsData, access_type: type };
                const dto = plainToInstance(EnterpriseSettingsDto, data);
                const errors = await validate(dto);
                expect(errors.length).toBe(0);
            }
        });

        it('should fail with invalid access type', async () => {
            const invalidData = {
                ...validSettingsData,
                access_type: 'invalid_access'
            };
            const dto = plainToInstance(EnterpriseSettingsDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('access_type');
            expect(errors[0].constraints?.isEnum).toBeDefined();
        });

        it('should accept undefined access type', async () => {
            const { access_type, ...dataWithoutAccessType } = validSettingsData;
            const dto = plainToInstance(EnterpriseSettingsDto, dataWithoutAccessType);
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Enum values', () => {
        it('should have correct values for ReportGenerationType', () => {
            expect(ReportGenerationType.IMMEDIATE).toBe('immediate');
            expect(ReportGenerationType.BATCH).toBe('batch');
            expect(Object.keys(ReportGenerationType).length).toBe(2);
        });

        it('should have correct values for AccessType', () => {
            expect(AccessType.FULL).toBe('full');
            expect(AccessType.LIMITED).toBe('limited');
            expect(AccessType.CUSTOM).toBe('custom');
            expect(Object.keys(AccessType).length).toBe(3);
        });
    });

    describe('Type transformations', () => {
        it('should transform string values to enum values', () => {
            const stringData = {
                id: '1',
                report_generation_type: 'immediate',
                access_type: 'full'
            };
            const dto = plainToInstance(EnterpriseSettingsDto, stringData);

            expect(dto.report_generation_type).toBe(ReportGenerationType.IMMEDIATE);
            expect(dto.access_type).toBe(AccessType.FULL);
        });

        it('should handle null values for optional fields', () => {
            const nullData = {
                id: '1',
                report_generation_type: null,
                access_type: null
            };
            const dto = plainToInstance(EnterpriseSettingsDto, nullData);

            expect(dto.report_generation_type).toBeNull();
            expect(dto.access_type).toBeNull();
        });
    });

    describe('Multiple validation errors', () => {
        it('should report multiple validation errors simultaneously', async () => {
            const invalidData = {
                id: '1',
                report_generation_type: 'invalid_type',
                access_type: 'invalid_access'
            };
            const dto = plainToInstance(EnterpriseSettingsDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(2);
            const properties = errors.map(error => error.property);
            expect(properties).toContain('report_generation_type');
            expect(properties).toContain('access_type');
        });
    });
});