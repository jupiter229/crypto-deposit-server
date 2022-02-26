import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDto {
  address: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  chain: string;
}
