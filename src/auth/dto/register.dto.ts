import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'El correo electrónico del administrador',
        example: 'admin@empresa.com',
        format: 'email',
        uniqueItems: true,
        required: true
    })
    @IsEmail({}, { message: 'Por favor ingrese un correo electrónico válido' })
    email: string;

    @ApiProperty({
        description: 'Nombre(s) del administrador',
        example: 'Juan Carlos',
        minLength: 2,
        maxLength: 100,
        required: true
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
        message: 'El nombre solo puede contener letras y espacios'
    })
    first_name: string;

    @ApiProperty({
        description: 'Apellido(s) del administrador',
        example: 'Rodríguez Pérez',
        minLength: 2,
        maxLength: 100,
        required: true
    })
    @IsString()
    @IsNotEmpty({ message: 'El apellido es requerido' })
    @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
        message: 'El apellido solo puede contener letras y espacios'
    })
    last_name: string;

    @ApiProperty({
        description: 'Contraseña del administrador (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números)',
        example: 'Admin123!',
        minLength: 8,
        required: true,
        writeOnly: true
    })
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    })
    password: string;
}