// src/enterprises/enterprises.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterprisesController } from './enterprises.controller';
import { EnterprisesService } from './enterprises.service';
import { EnterpriseSettings } from './entities/enterprise-settings.entity';
import { Enterprise } from './entities/enterprise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enterprise, EnterpriseSettings])
  ],
  controllers: [EnterprisesController],
  providers: [EnterprisesService]
})
export class EnterprisesModule { }