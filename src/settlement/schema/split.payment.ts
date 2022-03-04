import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from '../../authentication/schemas/auth.schema';

export type SplitPaymentDocument = SplitPayment & mongoose.Document;

@Schema()
export class SplitPayment {
  @Prop({ required: true, lowercase: true, type: String })
  name: string;

  @Prop({ required: true, lowercase: true, type: Number })
  share: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth;
}

export const SplitPaymentSchema = SchemaFactory.createForClass(SplitPayment);
