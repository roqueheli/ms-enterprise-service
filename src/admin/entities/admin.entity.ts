import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('admins')
export class Admin {
    @ApiProperty({
        description: 'Identificador único del administrador',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    @PrimaryGeneratedColumn('uuid')
    admin_id: string;

    @ApiProperty({
        description: 'Correo electrónico del administrador',
        example: 'admin@empresa.com',
        format: 'email',
        uniqueItems: true
    })
    @Column({
        unique: true,
        length: 255,
        comment: 'Correo electrónico único del administrador'
    })
    email: string;

    @ApiProperty({
        description: 'Nombre(s) del administrador',
        example: 'Juan Carlos',
        minLength: 2,
        maxLength: 100
    })
    @Column({
        length: 100,
        comment: 'Nombre(s) del administrador'
    })
    first_name: string;

    @ApiProperty({
        description: 'Apellido(s) del administrador',
        example: 'Rodríguez Pérez',
        minLength: 2,
        maxLength: 100
    })
    @Column({
        length: 100,
        comment: 'Apellido(s) del administrador'
    })
    last_name: string;

    @ApiHideProperty() // Oculta esta propiedad en la documentación de Swagger
    @Column({
        length: 255,
        comment: 'Hash de la contraseña del administrador'
    })
    @Exclude() // Excluye esta propiedad de la serialización
    password_hash: string;

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

    // Método opcional para obtener el nombre completo
    get fullName(): string {
        return `${this.first_name} ${this.last_name}`;
    }
}