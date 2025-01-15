import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AccessType, ReportGenerationType } from '../dto';
import { Enterprise } from './enterprise.entity';

@Entity('enterprise_settings')
export class EnterpriseSettings {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    setting_id: string;

    @ApiProperty({ enum: ReportGenerationType })
    @Column({
        type: 'enum',
        enum: ReportGenerationType,
        default: ReportGenerationType.IMMEDIATE,
    })
    report_generation_type: ReportGenerationType;

    @ApiProperty({ enum: AccessType })
    @Column({
        type: 'enum',
        enum: AccessType,
        default: AccessType.FULL,
    })
    access_type: AccessType;

    @OneToOne(() => Enterprise, enterprise => enterprise.settings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'enterprise_id' })
    enterprise: Enterprise;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;

    // Personaliza la serialización
    toJSON() {
        const { enterprise, ...rest } = this;
        return rest; // Excluye la propiedad `enterprise`
    }
}