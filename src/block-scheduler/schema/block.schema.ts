import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema()
export class Block {
  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  chain: string;

  @Prop({ required: true, default: false })
  hasCompletedScan: boolean;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
