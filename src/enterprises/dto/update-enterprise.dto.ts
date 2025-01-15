import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEnterpriseDto } from './create-enterprise.dto';
import { EnterpriseSettingsDto } from './enterprise-settings.dto';

export class UpdateEnterpriseDto extends PartialType(CreateEnterpriseDto) {
    @ApiProperty({ type: EnterpriseSettingsDto, required: false })
    settings?: EnterpriseSettingsDto;
}