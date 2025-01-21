import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEnterpriseDto } from './dto';
import { EnterprisesService } from './enterprises.service';
import { Enterprise } from './entities/enterprise.entity';

@ApiTags('Enterprises')
@ApiBearerAuth()
@Controller('enterprises')
@UseGuards(JwtAuthGuard)
export class EnterprisesController {
    constructor(
        private readonly enterpriseService: EnterprisesService,
        @Inject('ENTERPRISE_SERVICE') private readonly client: ClientProxy,
    ) { }

    @ApiOperation({ summary: 'Crear una nueva empresa' })
    @ApiResponse({
        status: 201,
        description: 'La empresa ha sido creada exitosamente.',
        type: Enterprise,
    })
    @Post()
    async create(@Body() createEnterpriseDto: CreateEnterpriseDto) {
        const enterprise = await this.enterpriseService.create(createEnterpriseDto);

        // Emitir evento de empresa creada
        this.client.emit('enterprise_created', {
            enterpriseId: enterprise.enterprise_id,
            name: enterprise.name,
            // Otros datos relevantes...
        });

        return enterprise;
    }

    @ApiOperation({ summary: 'Obtener todas las empresas' })
    @ApiResponse({
        status: 200,
        description: 'Lista de todas las empresas.',
        type: [Enterprise],
    })
    @Get()
    async findAll() {
        // Ejemplo de patrón de mensaje/respuesta con Redis
        const cachedEnterprises = await this.client.send('get_all_enterprises', {}).toPromise()
            .catch(() => null);

        if (cachedEnterprises) {
            return cachedEnterprises;
        }

        const enterprises = await this.enterpriseService.findAll();

        // Almacenar en caché a través de Redis
        this.client.emit('cache_enterprises', enterprises);

        return enterprises;
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
    async findOne(@Param('id') id: string) {
        // Intentar obtener de caché primero
        const cachedEnterprise = await this.client.send('get_enterprise', { id }).toPromise()
            .catch(() => null);

        if (cachedEnterprise) {
            return cachedEnterprise;
        }

        const enterprise = await this.enterpriseService.findOne(id);

        // Almacenar en caché
        if (enterprise) {
            this.client.emit('cache_enterprise', {
                id: enterprise.enterprise_id,
                data: enterprise,
            });
        }

        return enterprise;
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
    async update(@Param('id') id: string, @Body() createEnterpriseDto: CreateEnterpriseDto) {
        const updatedEnterprise = await this.enterpriseService.create(createEnterpriseDto);

        // Emitir evento de actualización
        this.client.emit('enterprise_updated', {
            enterpriseId: id,
            updates: createEnterpriseDto,
        });

        // Invalidar caché
        this.client.emit('invalidate_enterprise_cache', { id });

        return updatedEnterprise;
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
    async remove(@Param('id') id: string) {
        await this.enterpriseService.remove(id);

        // Emitir evento de eliminación
        this.client.emit('enterprise_deleted', { enterpriseId: id });

        // Invalidar caché
        this.client.emit('invalidate_enterprise_cache', { id });

        return { message: 'Enterprise deleted successfully' };
    }
}