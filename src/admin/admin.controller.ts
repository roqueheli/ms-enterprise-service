import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

@ApiTags('Administradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @ApiOperation({ summary: 'Crear un nuevo administrador' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'El administrador ha sido creado exitosamente',
        type: Admin,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'El email ya está registrado',
    })
    @Post()
    create(@Body() createAdminDto: CreateAdminDto) {
        return this.adminService.create(createAdminDto);
    }

    @ApiOperation({ summary: 'Obtener todos los administradores' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Lista de todos los administradores',
        type: [Admin],
    })
    @Get()
    findAll() {
        return this.adminService.findAll();
    }

    @ApiOperation({ summary: 'Obtener un administrador por ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Administrador encontrado',
        type: Admin,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Administrador no encontrado',
    })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminService.findOne(id);
    }

    @ApiOperation({ summary: 'Actualizar un administrador' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Administrador actualizado exitosamente',
        type: Admin,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Administrador no encontrado',
    })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
        return this.adminService.update(id, updateAdminDto);
    }

    @ApiOperation({ summary: 'Eliminar un administrador' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Administrador eliminado exitosamente',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Administrador no encontrado',
    })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.remove(id);
    }
}