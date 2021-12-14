import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Asset } from '../../asset/schemas/asset.schema';
import { Address } from './address.schema';

export type DepositDocument = Deposit & mongoose.Document;

@Schema()
export class Deposit {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address' })
  address: Address;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' })
  asset: Asset;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, unique: true })
  txHash: string;
}

export const DepositSchema = SchemaFactory.createForClass(Deposit);
