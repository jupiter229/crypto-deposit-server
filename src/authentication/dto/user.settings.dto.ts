import { IsNotEmpty, IsString } from 'class-validator';

export class UserSettingsDto {
  @IsNotEmpty()
  @IsString()
  readonly callbackUrl: string;
}
