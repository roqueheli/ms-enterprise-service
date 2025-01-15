// src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Admin } from '../../admin/entities/admin.entity';

export class AuthResponseDto {
    @ApiProperty({
        description: 'Token JWT de acceso',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    access_token: string;

    @ApiProperty({
        description: 'Información del administrador',
        type: () => Admin
    })
    admin: Admin;
}