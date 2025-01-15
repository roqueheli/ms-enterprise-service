// src/admin/dto/create-admin.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateAdminDto {
    @ApiProperty({
        description: 'Correo electrónico del administrador',
        example: 'admin@empresa.com'
    })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    email: string;

    @ApiProperty({
        description: 'Nombre(s) del administrador',
        example: 'Juan Carlos',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    first_name: string;

    @ApiProperty({
        description: 'Apellido(s) del administrador',
        example: 'Rodríguez Pérez',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    last_name: string;

    @ApiProperty({
        description: 'Contraseña del administrador',
        example: 'password123',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password_hash: string;
}