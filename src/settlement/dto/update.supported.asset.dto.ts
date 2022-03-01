import { IsBoolean } from 'class-validator';

export class UpdateSupportedAssetDto {
  @IsBoolean()
  isEnable: boolean;
}
