import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterprisesController } from './enterprises.controller';
import { EnterprisesService } from './enterprises.service';
import { EnterpriseSettings } from './entities/enterprise-settings.entity';
import { Enterprise } from './entities/enterprise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enterprise, EnterpriseSettings]),
    ClientsModule.registerAsync([
      {
        name: 'ENTERPRISE_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6380),
            retryAttempts: 5,
            retryDelay: 1000,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EnterprisesController],
  providers: [EnterprisesService],
  exports: [EnterprisesService], // Exportamos el servicio por si necesitamos usarlo en otros módulos
})
export class EnterprisesModule { }