import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
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
        description: 'La contraseña del administrador',
        example: 'Admin123!',
        minLength: 8,
        required: true,
        writeOnly: true // Indica que esta propiedad solo se usa para escritura
    })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;
}