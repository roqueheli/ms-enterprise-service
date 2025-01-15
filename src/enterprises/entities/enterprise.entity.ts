import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EnterpriseSettings } from './enterprise-settings.entity';

@Entity('enterprises')
export class Enterprise {
    @ApiProperty({
        description: 'Identificador único de la empresa',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    @PrimaryGeneratedColumn('uuid')
    enterprise_id: string;

    @ApiProperty({
        description: 'Nombre de la empresa',
        example: 'TechCorp Solutions',
        minLength: 2,
        maxLength: 255
    })
    @Column({
        length: 255,
        comment: 'Nombre de la empresa'
    })
    name: string;

    @ApiProperty({
        description: 'Descripción de la empresa',
        example: 'Empresa líder en soluciones tecnológicas empresariales',
        required: false,
        nullable: true
    })
    @Column({ 
        nullable: true,
        length: 1000,
        comment: 'Descripción detallada de la empresa'
    })
    description: string;

    @ApiProperty({
        description: 'Sitio web de la empresa',
        example: 'https://techcorp.com',
        required: false,
        nullable: true
    })
    @Column({ 
        nullable: true,
        length: 255,
        comment: 'URL del sitio web de la empresa'
    })
    website: string;

    @ApiProperty({
        description: 'Industria o sector de la empresa',
        example: 'Tecnología',
        required: false,
        nullable: true
    })
    @Column({ 
        nullable: true,
        length: 100,
        comment: 'Sector o industria principal de la empresa'
    })
    industry: string;

    @ApiProperty({
        description: 'Configuraciones específicas de la empresa',
        type: () => EnterpriseSettings
    })
    @OneToOne(() => EnterpriseSettings, settings => settings.enterprise, {
        cascade: true
    })
    settings: EnterpriseSettings;

    @ApiProperty({
        description: 'Fecha de creación del registro',
        example: '2024-01-14T12:00:00Z',
        type: 'string',
        format: 'date-time'
    })
    @CreateDateColumn({
        type: 'timestamp with time zone',
        comment: 'Fecha y hora de creación del registro'
    })
    created_at: Date;

    @ApiProperty({
        description: 'Fecha de última actualización del registro',
        example: '2024-01-14T12:00:00Z',
        type: 'string',
        format: 'date-time'
    })
    @UpdateDateColumn({
        type: 'timestamp with time zone',
        comment: 'Fecha y hora de última actualización del registro'
    })
    updated_at: Date;

    // Método de utilidad para obtener la URL formateada
    getFormattedWebsite(): string {
        if (!this.website) return '';
        return this.website.startsWith('http') ? this.website : `https://${this.website}`;
    }
}