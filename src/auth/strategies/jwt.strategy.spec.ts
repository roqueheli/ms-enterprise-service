import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let configService: ConfigService;

    const mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret')
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should get JWT_SECRET from config service', () => {
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
        });

        it('should be properly configured', () => {
            // Verificamos que la estrategia sea una instancia válida
            expect(strategy).toBeInstanceOf(JwtStrategy);

            // Verificamos que el ConfigService fue llamado con el parámetro correcto
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');

            // Verificamos que la estrategia tenga las propiedades necesarias
            expect(strategy).toHaveProperty('name', 'jwt');
        });
    });

    describe('validate', () => {
        it('should validate and return the payload with admin_id and email', async () => {
            const payload = {
                admin_id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'admin@example.com'
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                admin_id: payload.admin_id,
                email: payload.email
            });
        });

        it('should handle payload with additional properties', async () => {
            const payload = {
                admin_id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'admin@example.com',
                extraField: 'should be ignored'
            };

            const result = await strategy.validate(payload as any);

            expect(result).toEqual({
                admin_id: payload.admin_id,
                email: payload.email
            });
            expect(result).not.toHaveProperty('extraField');
        });

        it('should handle valid UUID format for admin_id', async () => {
            const payload = {
                admin_id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'admin@example.com'
            };

            const result = await strategy.validate(payload);

            expect(result.admin_id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
            );
        });

        it('should handle valid email format', async () => {
            const payload = {
                admin_id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'admin@example.com'
            };

            const result = await strategy.validate(payload);

            expect(result.email).toMatch(
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
            );
        });
    });

    describe('error handling', () => {
        it('should handle missing admin_id in payload', async () => {
            const payload = {
                email: 'admin@example.com'
            };

            const result = await strategy.validate(payload as any);
            expect(result.admin_id).toBeUndefined();
        });

        it('should handle missing email in payload', async () => {
            const payload = {
                admin_id: '123e4567-e89b-12d3-a456-426614174000'
            };

            const result = await strategy.validate(payload as any);
            expect(result.email).toBeUndefined();
        });

        it('should handle empty payload', async () => {
            const payload = {};

            const result = await strategy.validate(payload as any);
            expect(result).toEqual({
                admin_id: undefined,
                email: undefined
            });
        });
    });

    describe('strategy configuration', () => {
        it('should be configured with correct options', () => {
            const strategy = new JwtStrategy(configService);

            // Verificamos que la estrategia tenga el nombre correcto
            expect(strategy).toHaveProperty('name', 'jwt');

            // Verificamos que el ConfigService fue llamado
            expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
        });
    });
});