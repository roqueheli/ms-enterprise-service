import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';

/**
 * Módulo que maneja todas las operaciones relacionadas con los administradores.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService] // Exportamos el servicio para que pueda ser usado por otros módulos
})
export class AdminModule { }