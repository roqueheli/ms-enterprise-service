// src/enterprises/enterprises.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { EnterpriseSettings } from './entities/enterprise-settings.entity';
import { Enterprise } from './entities/enterprise.entity';

/**
 * Servicio para la gestión de empresas y sus configuraciones.
 * 
 * Este servicio maneja todas las operaciones CRUD relacionadas con las empresas,
 * incluyendo la gestión de sus configuraciones específicas.
 */
@Injectable()
export class EnterprisesService {
    /**
     * Constructor del servicio de empresas.
     * 
     * @param enterpriseRepository - Repositorio para la entidad Enterprise
     * @param settingsRepository - Repositorio para la entidad EnterpriseSettings
     */
    constructor(
        @InjectRepository(Enterprise)
        private readonly enterpriseRepository: Repository<Enterprise>,
        @InjectRepository(EnterpriseSettings)
        private readonly settingsRepository: Repository<EnterpriseSettings>
    ) { }

    /**
     * Crea una nueva empresa con sus configuraciones opcionales.
     * 
     * @param createEnterpriseDto - DTO con los datos de la empresa a crear
     * @returns Promise con la empresa creada y sus configuraciones
     * 
     * @example
     * ```typescript
     * const newEnterprise = await service.create({
     *   name: 'TechCorp',
     *   contact_email: 'contact@techcorp.com',
     *   settings: {
     *     report_generation_type: ReportGenerationType.IMMEDIATE
     *   }
     * });
     * ```
     */
    async create(createEnterpriseDto: CreateEnterpriseDto): Promise<Enterprise> {
        const enterprise = new Enterprise();
        Object.assign(enterprise, createEnterpriseDto);

        if (createEnterpriseDto.settings) {
            const settings = new EnterpriseSettings();
            Object.assign(settings, createEnterpriseDto.settings);

            // Establecer la relación bidireccional
            settings.enterprise = enterprise;
            enterprise.settings = settings;
        }

        // Guardar la empresa con sus settings
        return this.enterpriseRepository.save(enterprise);
    }

    /**
     * Obtiene todas las empresas registradas con sus configuraciones.
     * 
     * @returns Promise con un array de todas las empresas y sus configuraciones
     * 
     * @example
     * ```typescript
     * const allEnterprises = await service.findAll();
     * console.log(allEnterprises.length); // Número total de empresas
     * ```
     */
    async findAll(): Promise<Enterprise[]> {
        return this.enterpriseRepository.find({
            relations: ['settings']
        });
    }

    /**
     * Busca una empresa específica por su ID.
     * 
     * @param id - UUID de la empresa a buscar
     * @returns Promise con la empresa encontrada y sus configuraciones
     * @throws NotFoundException si la empresa no existe
     * 
     * @example
     * ```typescript
     * try {
     *   const enterprise = await service.findOne('123e4567-e89b-12d3-a456-426614174000');
     *   console.log(enterprise.name);
     * } catch (error) {
     *   console.error('Empresa no encontrada');
     * }
     * ```
     */
    async findOne(id: string): Promise<Enterprise> {
        const enterprise = await this.enterpriseRepository.findOne({
            where: { enterprise_id: id },
            relations: ['settings']
        });

        if (!enterprise) {
            throw new NotFoundException(`Enterprise with ID ${id} not found`);
        }

        return enterprise;
    }

    /**
     * Actualiza una empresa existente y sus configuraciones.
     * 
     * @param id - UUID de la empresa a actualizar
     * @param updateEnterpriseDto - DTO con los datos a actualizar
     * @returns Promise con la empresa actualizada
     * @throws NotFoundException si la empresa no existe
     * 
     * @example
     * ```typescript
     * const updatedEnterprise = await service.update('123e4567-e89b-12d3-a456-426614174000', {
     *   name: 'TechCorp Updated',
     *   settings: {
     *     access_type: AccessType.FULL
     *   }
     * });
     * ```
     */
    async update(id: string, updateEnterpriseDto: UpdateEnterpriseDto): Promise<Enterprise> {
        // Carga la empresa con sus relaciones
        const enterprise = await this.enterpriseRepository.findOne({
            where: { enterprise_id: id },
            relations: ['settings'], // Asegúrate de cargar la relación
        });

        if (!enterprise) {
            throw new NotFoundException(`Enterprise with ID ${id} not found`);
        }

        // Actualiza los datos de la empresa
        Object.assign(enterprise, updateEnterpriseDto);

        // Si hay datos para settings, actualízalos también
        if (updateEnterpriseDto.settings) {
            Object.assign(enterprise.settings, updateEnterpriseDto.settings);
        }

        // Guarda los cambios
        return this.enterpriseRepository.save(enterprise);
    }

    /**
     * Elimina una empresa y sus configuraciones asociadas.
     * 
     * @param id - UUID de la empresa a eliminar
     * @throws NotFoundException si la empresa no existe
     * 
     * @example
     * ```typescript
     * try {
     *   await service.remove('123e4567-e89b-12d3-a456-426614174000');
     *   console.log('Empresa eliminada exitosamente');
     * } catch (error) {
     *   console.error('Error al eliminar la empresa');
     * }
     * ```
     */
    async remove(id: string): Promise<void> {
        const enterprise = await this.findOne(id);
        await this.enterpriseRepository.remove(enterprise);
    }
}