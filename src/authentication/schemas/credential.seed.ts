import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from './auth.schema';

export type CredentialSeedDocument = CredentialSeed & mongoose.Document;

@Schema()
export class CredentialSeed {
  @Prop({})
  seedPhrase: string;

  @Prop({ type: Number, default: -1 })
  currentDerivationIndex: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth | string;
}

export const CredentialSeedSchema =
  SchemaFactory.createForClass(CredentialSeed);
