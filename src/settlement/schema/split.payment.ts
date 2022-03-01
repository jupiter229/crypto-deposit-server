import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from '../../authentication/schemas/auth.schema';

export type SplitPaymentDocument = SplitPayment & mongoose.Document;

@Schema()
export class SplitPayment {
  @Prop({ required: true, lowercase: true })
  name: string;

  @Prop({ required: true, lowercase: true, type: Number })
  share: number;

  //map of settlement addresses

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth;
}

export const SplitPaymentSchema = SchemaFactory.createForClass(SplitPayment);

const reqObject = [
  {
    name: 'main',
    share: 90,
    addresses: {
      BTC: 'tb....',
      ETH: '0x....',
      BNB: 'bnb...',
    },
  },
  {
    name: 'fees',
    share: 10,
    addresses: {
      BTC: 'tb....',
      ETH: '0x....',
      BNB: 'bnb...',
    },
  },
];
