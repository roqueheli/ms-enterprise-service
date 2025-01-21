import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { redisConfig } from './config/redis.config';
import { EnterprisesModule } from './enterprises/enterprises.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.DB_SYNC === 'true',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    // Configuración de Redis
    ClientsModule.registerAsync([
      {
        name: 'ENTERPRISE_SERVICE', // Nombre del servicio Redis
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6380),
            retryAttempts: 5,
            retryDelay: 1000,
            tls: configService.get('NODE_ENV') === 'production' ? {
              rejectUnauthorized: false
            } : undefined,
            reconnectOnError: (err) => {
              console.log('Redis reconnection error:', err);
              return true;
            },
            retryStrategy: (times) => {
              const delay = Math.min(times * 1000, 5000);
              console.log(`Redis retry attempt ${times} with delay ${delay}ms`);
              return delay;
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
    EnterprisesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }