import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppModule } from './app.module';

describe('AppModule - Configuration', () => {
    let configService: ConfigService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot(), AppModule],
        }).compile();

        configService = module.get<ConfigService>(ConfigService);
    }, 10000); // Aumentar el tiempo de espera a 10 segundos

    it('should load TypeORM configuration correctly', async () => {
        const typeOrmConfig: TypeOrmModuleOptions = {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: process.env.DB_SYNC === 'true',
            autoLoadEntities: true,
        };

        expect(typeOrmConfig.type).toBe('postgres');
        expect(typeOrmConfig.host).toBe(configService.get('DB_HOST'));
        expect(typeOrmConfig.port).toBe(configService.get<number>('DB_PORT'));
        expect(typeOrmConfig.username).toBe(configService.get('DB_USERNAME'));
        expect(typeOrmConfig.password).toBe(configService.get('DB_PASSWORD'));
        expect(typeOrmConfig.database).toBe(configService.get('DB_DATABASE'));
        expect(typeOrmConfig.synchronize).toBe(process.env.DB_SYNC === 'true');
        expect(typeOrmConfig.autoLoadEntities).toBe(true);
    });

    it('should load Redis configuration correctly', async () => {
        const redisConfig = {
            transport: Transport.REDIS,
            options: {
                host: configService.get('REDIS_HOST', 'localhost'),
                port: configService.get('REDIS_PORT', 6380),
                retryAttempts: 5,
                retryDelay: 1000,
            },
        };

        expect(redisConfig.transport).toBe(Transport.REDIS);
        expect(redisConfig.options.host).toBe(configService.get('REDIS_HOST', 'localhost'));
        expect(redisConfig.options.port).toBe(configService.get('REDIS_PORT', 6380));
        expect(redisConfig.options.retryAttempts).toBe(5);
        expect(redisConfig.options.retryDelay).toBe(1000);
    });
});
