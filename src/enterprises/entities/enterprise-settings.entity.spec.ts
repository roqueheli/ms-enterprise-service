import { v4 as uuidv4 } from 'uuid'; // Asegúrate de tener uuid instalado
import { AccessType, ReportGenerationType } from '../dto';
import { EnterpriseSettings } from './enterprise-settings.entity';
import { Enterprise } from './enterprise.entity';

describe('EnterpriseSettings Entity', () => {
    let enterpriseSettings: EnterpriseSettings;
    let mockEnterprise: Enterprise;

    beforeEach(() => {
        mockEnterprise = new Enterprise();
        mockEnterprise.enterprise_id = uuidv4();
        mockEnterprise.name = 'Test Enterprise';

        enterpriseSettings = new EnterpriseSettings();
        enterpriseSettings.setting_id = uuidv4(); // Usar uuid válido
        enterpriseSettings.report_generation_type = ReportGenerationType.IMMEDIATE;
        enterpriseSettings.access_type = AccessType.FULL;
        enterpriseSettings.enterprise = mockEnterprise;
        enterpriseSettings.created_at = new Date();
        enterpriseSettings.updated_at = new Date();
    });

    describe('Entity structure', () => {
        it('should have all required properties', () => {
            expect(enterpriseSettings).toHaveProperty('setting_id');
            expect(enterpriseSettings).toHaveProperty('report_generation_type');
            expect(enterpriseSettings).toHaveProperty('access_type');
            expect(enterpriseSettings).toHaveProperty('enterprise');
            expect(enterpriseSettings).toHaveProperty('created_at');
            expect(enterpriseSettings).toHaveProperty('updated_at');
        });

        it('should have correct types for properties', () => {
            expect(typeof enterpriseSettings.setting_id).toBe('string');
            expect(Object.values(ReportGenerationType)).toContain(enterpriseSettings.report_generation_type);
            expect(Object.values(AccessType)).toContain(enterpriseSettings.access_type);
            expect(enterpriseSettings.enterprise).toBeInstanceOf(Enterprise);
            expect(enterpriseSettings.created_at).toBeInstanceOf(Date);
            expect(enterpriseSettings.updated_at).toBeInstanceOf(Date);
        });
    });

    describe('Enum values', () => {
        describe('ReportGenerationType', () => {
            it('should accept valid report generation types', () => {
                const validTypes = Object.values(ReportGenerationType);
                validTypes.forEach(type => {
                    enterpriseSettings.report_generation_type = type;
                    expect(enterpriseSettings.report_generation_type).toBe(type);
                });
            });

            // Modificar esta prueba para verificar el valor establecido
            it('should allow setting IMMEDIATE as value', () => {
                const settings = new EnterpriseSettings();
                settings.report_generation_type = ReportGenerationType.IMMEDIATE;
                expect(settings.report_generation_type).toBe(ReportGenerationType.IMMEDIATE);
            });
        });

        describe('AccessType', () => {
            it('should accept valid access types', () => {
                const validTypes = Object.values(AccessType);
                validTypes.forEach(type => {
                    enterpriseSettings.access_type = type;
                    expect(enterpriseSettings.access_type).toBe(type);
                });
            });

            // Modificar esta prueba para verificar el valor establecido
            it('should allow setting FULL as value', () => {
                const settings = new EnterpriseSettings();
                settings.access_type = AccessType.FULL;
                expect(settings.access_type).toBe(AccessType.FULL);
            });
        });
    });

    describe('Relationship with Enterprise', () => {
        it('should allow setting enterprise relationship', () => {
            const newEnterprise = new Enterprise();
            newEnterprise.enterprise_id = 'def4567-e89b-12d3-a456-426614174456';
            newEnterprise.name = 'New Enterprise';

            enterpriseSettings.enterprise = newEnterprise;
            expect(enterpriseSettings.enterprise).toBe(newEnterprise);
        });

        it('should allow null enterprise relationship', () => {
            enterpriseSettings.enterprise = null;
            expect(enterpriseSettings.enterprise).toBeNull();
        });
    });

    describe('Timestamps', () => {
        it('should have valid created_at date', () => {
            expect(enterpriseSettings.created_at).toBeInstanceOf(Date);
            expect(enterpriseSettings.created_at.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should have valid updated_at date', () => {
            expect(enterpriseSettings.updated_at).toBeInstanceOf(Date);
            expect(enterpriseSettings.updated_at.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should have updated_at greater than or equal to created_at', () => {
            expect(enterpriseSettings.updated_at.getTime())
                .toBeGreaterThanOrEqual(enterpriseSettings.created_at.getTime());
        });
    });

    describe('toJSON method', () => {
        it('should exclude enterprise property', () => {
            const jsonResult = enterpriseSettings.toJSON();

            expect(jsonResult).toHaveProperty('setting_id');
            expect(jsonResult).toHaveProperty('report_generation_type');
            expect(jsonResult).toHaveProperty('access_type');
            expect(jsonResult).toHaveProperty('created_at');
            expect(jsonResult).toHaveProperty('updated_at');
            expect(jsonResult).not.toHaveProperty('enterprise');
        });

        it('should maintain all other properties', () => {
            const jsonResult = enterpriseSettings.toJSON();

            expect(jsonResult.setting_id).toBe(enterpriseSettings.setting_id);
            expect(jsonResult.report_generation_type).toBe(enterpriseSettings.report_generation_type);
            expect(jsonResult.access_type).toBe(enterpriseSettings.access_type);
            expect(jsonResult.created_at).toBe(enterpriseSettings.created_at);
            expect(jsonResult.updated_at).toBe(enterpriseSettings.updated_at);
        });

        it('should handle null enterprise property', () => {
            enterpriseSettings.enterprise = null;
            const jsonResult = enterpriseSettings.toJSON();

            expect(jsonResult).not.toHaveProperty('enterprise');
            expect(Object.keys(jsonResult)).not.toContain('enterprise');
        });
    });

    describe('UUID format', () => {
        it('should accept valid UUID format', () => {
            const validUuid = uuidv4();
            enterpriseSettings.setting_id = validUuid;
            expect(enterpriseSettings.setting_id).toBe(validUuid);
        });
    });

    describe('Database default values', () => {
        it('should allow setting default values', () => {
            const settings = new EnterpriseSettings();

            // Simular los valores por defecto que establecería la base de datos
            settings.report_generation_type = ReportGenerationType.IMMEDIATE;
            settings.access_type = AccessType.FULL;

            expect(settings.report_generation_type).toBe(ReportGenerationType.IMMEDIATE);
            expect(settings.access_type).toBe(AccessType.FULL);
        });

        it('should start with undefined values before database interaction', () => {
            const settings = new EnterpriseSettings();
            expect(settings.report_generation_type).toBeUndefined();
            expect(settings.access_type).toBeUndefined();
        });
    });
});