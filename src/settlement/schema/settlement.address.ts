import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from '../../authentication/schemas/auth.schema';

export type SettlementAddressDocument = SettlementAddress & mongoose.Document;

@Schema()
export class SettlementAddress {
  @Prop({ required: true, lowercase: true })
  address: string;

  @Prop({ required: true, lowercase: true })
  assetCode: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth;
}

export const SettlementAddressSchema =
  SchemaFactory.createForClass(SettlementAddress);
