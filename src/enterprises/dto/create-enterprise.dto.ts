import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { EnterpriseSettingsDto } from './enterprise-settings.dto';

export class CreateEnterpriseDto {
    @ApiProperty({
        description: 'Nombre de la empresa',
        example: 'TechCorp Inc.',
        required: true,
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Descripción de la empresa',
        example: 'Empresa líder en soluciones tecnológicas',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'URL del sitio web de la empresa',
        example: 'https://techcorp.com',
        required: false,
    })
    @IsUrl()
    @IsOptional()
    website?: string;

    @ApiProperty({
        description: 'Tipo de industria de la empresa',
        example: 'Medical',
        required: false,
    })
    @IsString()
    @IsOptional()
    industry?: string;

    @ApiProperty({
        description: 'Email de contacto principal de la empresa',
        example: 'contact@techcorp.com',
        required: true,
    })
    @IsEmail()
    contact_email: string;

    @ApiProperty({
        description: 'Configuración de la empresa',
        type: () => EnterpriseSettingsDto,
        required: false,
    })
    @ValidateNested()
    @Type(() => EnterpriseSettingsDto)
    @IsOptional()
    settings?: EnterpriseSettingsDto;
}