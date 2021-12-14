import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AuthDocument = Auth & mongoose.Document;

@Schema()
export class Auth {
  @Prop({ required: true, lowercase: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isActivated: boolean;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
