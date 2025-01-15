import { EnterpriseSettings } from './enterprise-settings.entity';
import { Enterprise } from './enterprise.entity';

describe('Enterprise Entity', () => {
    let enterprise: Enterprise;

    beforeEach(() => {
        enterprise = new Enterprise();
        enterprise.enterprise_id = '123e4567-e89b-12d3-a456-426614174000';
        enterprise.name = 'TechCorp Solutions';
        enterprise.description = 'Empresa líder en soluciones tecnológicas';
        enterprise.website = 'https://techcorp.com';
        enterprise.industry = 'Tecnología';
        enterprise.created_at = new Date();
        enterprise.updated_at = new Date();
        enterprise.settings = new EnterpriseSettings();
    });

    describe('Entity structure', () => {
        it('should have all required properties', () => {
            expect(enterprise).toHaveProperty('enterprise_id');
            expect(enterprise).toHaveProperty('name');
            expect(enterprise).toHaveProperty('description');
            expect(enterprise).toHaveProperty('website');
            expect(enterprise).toHaveProperty('industry');
            expect(enterprise).toHaveProperty('settings');
            expect(enterprise).toHaveProperty('created_at');
            expect(enterprise).toHaveProperty('updated_at');
        });

        it('should have correct types for properties', () => {
            expect(typeof enterprise.enterprise_id).toBe('string');
            expect(typeof enterprise.name).toBe('string');
            expect(typeof enterprise.description).toBe('string');
            expect(typeof enterprise.website).toBe('string');
            expect(typeof enterprise.industry).toBe('string');
            expect(enterprise.settings).toBeInstanceOf(EnterpriseSettings);
            expect(enterprise.created_at).toBeInstanceOf(Date);
            expect(enterprise.updated_at).toBeInstanceOf(Date);
        });

        it('should allow nullable fields to be null', () => {
            enterprise.description = null;
            enterprise.website = null;
            enterprise.industry = null;

            expect(enterprise.description).toBeNull();
            expect(enterprise.website).toBeNull();
            expect(enterprise.industry).toBeNull();
        });
    });

    describe('getFormattedWebsite method', () => {
        it('should return empty string when website is null', () => {
            enterprise.website = null;
            expect(enterprise.getFormattedWebsite()).toBe('');
        });

        it('should return website as-is when it starts with http', () => {
            enterprise.website = 'http://example.com';
            expect(enterprise.getFormattedWebsite()).toBe('http://example.com');

            enterprise.website = 'https://example.com';
            expect(enterprise.getFormattedWebsite()).toBe('https://example.com');
        });

        it('should add https:// when website does not start with http', () => {
            enterprise.website = 'example.com';
            expect(enterprise.getFormattedWebsite()).toBe('https://example.com');
        });
    });

    describe('Relationships', () => {
        it('should have settings property as EnterpriseSettings instance', () => {
            expect(enterprise.settings).toBeInstanceOf(EnterpriseSettings);
        });

        it('should allow settings to be null', () => {
            enterprise.settings = null;
            expect(enterprise.settings).toBeNull();
        });
    });

    describe('Timestamps', () => {
        it('should have valid created_at date', () => {
            expect(enterprise.created_at).toBeInstanceOf(Date);
            expect(enterprise.created_at.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should have valid updated_at date', () => {
            expect(enterprise.updated_at).toBeInstanceOf(Date);
            expect(enterprise.updated_at.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should have updated_at greater than or equal to created_at', () => {
            expect(enterprise.updated_at.getTime())
                .toBeGreaterThanOrEqual(enterprise.created_at.getTime());
        });
    });
});