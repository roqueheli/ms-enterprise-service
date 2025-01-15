import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppModule } from './app.module';

describe('AppModule - TypeORM Configuration', () => {
    let configService: ConfigService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot(), AppModule],
        }).compile();

        configService = module.get<ConfigService>(ConfigService);
    });

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
});