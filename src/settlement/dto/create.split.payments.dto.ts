import { IsArray, IsNotEmpty } from 'class-validator';
import { CreateSplitPaymentDto } from './create.split.payment.dto';

export class CreateSplitPaymentsDto {
  @IsArray()
  @IsNotEmpty()
  splitPayments: Array<CreateSplitPaymentDto>;
}
