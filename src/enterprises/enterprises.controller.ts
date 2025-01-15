import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateEnterpriseDto } from './dto';
import { EnterprisesService } from './enterprises.service';
import { Enterprise } from './entities/enterprise.entity';

@ApiTags('Enterprises') // Agrupa los endpoints bajo la categoría "Enterprises" en Swagger
@ApiBearerAuth() // Indica que los endpoints requieren un token JWT
@Controller('enterprises')
@UseGuards(JwtAuthGuard) // Protege todos los endpoints con JWT
export class EnterprisesController {
    constructor(private readonly enterpriseService: EnterprisesService) { }

    @ApiOperation({ summary: 'Crear una nueva empresa' })
    @ApiResponse({
        status: 201,
        description: 'La empresa ha sido creada exitosamente.',
        type: Enterprise,
    })
    @Post()
    create(@Body() createEnterpriseDto: CreateEnterpriseDto) {
        return this.enterpriseService.create(createEnterpriseDto);
    }

    @ApiOperation({ summary: 'Obtener todas las empresas' })
    @ApiResponse({
        status: 200,
        description: 'Lista de todas las empresas.',
        type: [Enterprise],
    })
    @Get()
    findAll() {
        return this.enterpriseService.findAll();
    }

    @ApiOperation({ summary: 'Obtener una empresa por ID' })
    @ApiParam({
        name: 'id',
        description: 'ID de la empresa a buscar',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Detalles de la empresa encontrada.',
        type: Enterprise,
    })
    @ApiResponse({
        status: 404,
        description: 'Empresa no encontrada.',
    })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.enterpriseService.findOne(id);
    }

    @ApiOperation({ summary: 'Actualizar una empresa por ID' })
    @ApiParam({
        name: 'id',
        description: 'ID de la empresa a actualizar',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'La empresa ha sido actualizada exitosamente.',
        type: Enterprise,
    })
    @ApiResponse({
        status: 404,
        description: 'Empresa no encontrada.',
    })
    @Put(':id')
    update(@Body() createEnterpriseDto: CreateEnterpriseDto) {
        return this.enterpriseService.create(createEnterpriseDto);
    }

    @ApiOperation({ summary: 'Eliminar una empresa por ID' })
    @ApiParam({
        name: 'id',
        description: 'ID de la empresa a eliminar',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'La empresa ha sido eliminada exitosamente.',
    })
    @ApiResponse({
        status: 404,
        description: 'Empresa no encontrada.',
    })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.enterpriseService.remove(id);
    }
}