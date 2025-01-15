import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export enum ReportGenerationType {
    IMMEDIATE = 'immediate',
    BATCH = 'batch',
}

export enum AccessType {
    FULL = 'full',
    LIMITED = 'limited',
    CUSTOM = 'custom',
}

export class EnterpriseSettingsDto {
    @PrimaryGeneratedColumn()
    id: string;

    @ApiProperty({
        description: 'Tipo de generación de reportes',
        enum: ReportGenerationType,
        example: ReportGenerationType.IMMEDIATE,
        required: false,
    })
    @IsEnum(ReportGenerationType)
    @IsOptional()
    report_generation_type?: ReportGenerationType;

    @ApiProperty({
        description: 'Tipo de acceso a la plataforma',
        enum: AccessType,
        example: AccessType.FULL,
        required: false,
    })
    @IsEnum(AccessType)
    @IsOptional()
    access_type?: AccessType;
}
