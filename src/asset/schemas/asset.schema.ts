import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssetDocument = Asset & Document;

@Schema()
export class Asset {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  decimals: number;

  @Prop({ lowercase: true })
  contractAddress: string;

  @Prop({})
  matchingAsset: string;

  @Prop({})
  color: string;

  @Prop({})
  coinGeckoId: string;

  @Prop({ required: true })
  chain: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, default: false })
  isEnable: boolean;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
