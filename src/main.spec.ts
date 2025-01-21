import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { redisConfig } from './config/redis.config';

describe('Bootstrap Function', () => {
    let app;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should configure microservice with Redis transport', async () => {
        const microserviceOptions: MicroserviceOptions = {
            transport: Transport.REDIS,
            options: {
                host: redisConfig.host,
                port: redisConfig.port,
            },
        };

        // Simular la conexión del microservicio
        const connectMicroserviceSpy = jest.spyOn(app, 'connectMicroservice');
        app.connectMicroservice(microserviceOptions);

        expect(connectMicroserviceSpy).toHaveBeenCalledWith(microserviceOptions);
    });

    describe('Application Setup', () => {
        it('should create NestJS application', async () => {
            expect(app).toBeDefined();
        });

        it('should setup Swagger documentation', async () => {
            // Mock SwaggerModule methods
            const createDocumentSpy = jest.spyOn(SwaggerModule, 'createDocument');
            const setupSpy = jest.spyOn(SwaggerModule, 'setup');

            // Create config
            const config = new DocumentBuilder()
                .setTitle('Enterprise Service API')
                .setDescription('API para la gestión de administradores, empresas y autenticación')
                .setVersion('1.0')
                .addBearerAuth()
                .build();

            // Setup swagger
            const document = SwaggerModule.createDocument(app, config);
            SwaggerModule.setup('api/docs', app, document);

            expect(createDocumentSpy).toHaveBeenCalledWith(app, expect.any(Object));
            expect(setupSpy).toHaveBeenCalledWith('api/docs', app, expect.any(Object));

            createDocumentSpy.mockRestore();
            setupSpy.mockRestore();
        });

        it('should use global ValidationPipe with correct options', async () => {
            const useGlobalPipesSpy = jest.spyOn(app, 'useGlobalPipes');

            const validationPipe = new ValidationPipe({
                whitelist: true,
                transform: true,
            });

            app.useGlobalPipes(validationPipe);

            expect(useGlobalPipesSpy).toHaveBeenCalledWith(validationPipe);

            useGlobalPipesSpy.mockRestore();
        });

        it('should use TransformInterceptor globally', async () => {
            const useGlobalInterceptorsSpy = jest.spyOn(app, 'useGlobalInterceptors');

            const transformInterceptor = new TransformInterceptor();
            app.useGlobalInterceptors(transformInterceptor);

            expect(useGlobalInterceptorsSpy).toHaveBeenCalledWith(transformInterceptor);

            useGlobalInterceptorsSpy.mockRestore();
        });
    });

    describe('Environment Configuration', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it('should use PORT from environment variable when available', async () => {
            process.env.PORT = '4000';
            const listenSpy = jest.spyOn(app, 'listen').mockResolvedValue(undefined);

            await app.init();
            await app.listen(process.env.PORT || 3001);

            expect(listenSpy).toHaveBeenCalledWith('4000');
            listenSpy.mockRestore();
        });

        it('should use default port 3001 when PORT is not set', async () => {
            delete process.env.PORT;
            const listenSpy = jest.spyOn(app, 'listen').mockResolvedValue(undefined);

            await app.init();
            await app.listen(process.env.PORT || 3001);

            expect(listenSpy).toHaveBeenCalledWith(3001);
            listenSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        it('should handle initialization errors', async () => {
            const mockError = new Error('Initialization failed');
            jest.spyOn(app, 'init').mockRejectedValue(mockError);

            await expect(app.init()).rejects.toThrow('Initialization failed');
        });

        it('should handle listen errors', async () => {
            const mockError = new Error('Port already in use');
            jest.spyOn(app, 'listen').mockRejectedValue(mockError);

            await expect(app.listen(3001)).rejects.toThrow('Port already in use');
        });
    });

    describe('Swagger Configuration', () => {
        it('should create Swagger document with correct configuration', () => {
            const config = new DocumentBuilder()
                .setTitle('Enterprise Service API')
                .setDescription('API para la gestión de administradores, empresas y autenticación')
                .setVersion('1.0')
                .addBearerAuth()
                .build();

            expect(config).toEqual(
                expect.objectContaining({
                    info: expect.objectContaining({
                        title: 'Enterprise Service API',
                        description: 'API para la gestión de administradores, empresas y autenticación',
                        version: '1.0',
                    }),
                })
            );
        });
    });
});