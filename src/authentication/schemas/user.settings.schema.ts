import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from './auth.schema';

export type UserSettingsDocument = UserSettings & mongoose.Document;

@Schema()
export class UserSettings {
  @Prop({})
  callbackUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
