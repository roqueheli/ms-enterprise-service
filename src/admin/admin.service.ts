import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

/**
 * Servicio que maneja las operaciones relacionadas con los administradores.
 */
@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ) { }

    /**
     * Crea un nuevo administrador.
     * @param createAdminDto - DTO con los datos del nuevo administrador
     * @returns Promise<Admin> - El administrador creado
     * @throws ConflictException si el email ya está registrado
     */
    async create(createAdminDto: CreateAdminDto): Promise<Admin> {
        const existingAdmin = await this.findByEmail(createAdminDto.email);
        if (existingAdmin) {
            throw new ConflictException('El email ya está registrado');
        }

        const admin = this.adminRepository.create(createAdminDto);
        return this.adminRepository.save(admin);
    }

    /**
     * Obtiene todos los administradores.
     * @returns Promise<Admin[]> - Lista de administradores
     */
    async findAll(): Promise<Admin[]> {
        return this.adminRepository.find();
    }

    /**
     * Busca un administrador por su ID.
     * @param id - ID del administrador
     * @returns Promise<Admin> - El administrador encontrado
     * @throws NotFoundException si el administrador no existe
     */
    async findOne(id: string): Promise<Admin> {
        const admin = await this.adminRepository.findOne({
            where: { admin_id: id }
        });

        if (!admin) {
            throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
        }

        return admin;
    }

    /**
     * Busca un administrador por su email.
     * @param email - Email del administrador
     * @returns Promise<Admin | null> - El administrador encontrado o null
     */
    async findByEmail(email: string): Promise<Admin | null> {
        return this.adminRepository.findOne({
            where: { email }
        });
    }

    /**
     * Actualiza un administrador.
     * @param id - ID del administrador
     * @param updateAdminDto - DTO con los datos a actualizar
     * @returns Promise<Admin> - El administrador actualizado
     * @throws NotFoundException si el administrador no existe
     */
    async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
        const admin = await this.findOne(id);

        if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
            const existingAdmin = await this.findByEmail(updateAdminDto.email);
            if (existingAdmin) {
                throw new ConflictException('El email ya está registrado');
            }
        }

        Object.assign(admin, updateAdminDto);
        return this.adminRepository.save(admin);
    }

    /**
     * Elimina un administrador.
     * @param id - ID del administrador
     * @throws NotFoundException si el administrador no existe
     */
    async remove(id: string): Promise<void> {
        const admin = await this.findOne(id);
        await this.adminRepository.remove(admin);
    }
}
