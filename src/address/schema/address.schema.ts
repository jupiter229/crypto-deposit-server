import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Asset } from '../../asset/schemas/asset.schema';
import { Auth } from '../../authentication/schemas/auth.schema';

export type AddressDocument = Address & mongoose.Document;

@Schema()
export class Address {
  @Prop({ required: true, lowercase: true })
  address: string;

  @Prop({})
  seedPhrase: string;

  @Prop({ type: Number, default: -1 })
  derivationIndex: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' })
  asset: Asset;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
