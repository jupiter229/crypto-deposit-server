import { IsNumber, IsString, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateSplitPaymentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  share: number;
}
