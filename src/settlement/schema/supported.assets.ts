import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from '../../authentication/schemas/auth.schema';
import { Asset } from '../../asset/schemas/asset.schema';

export type SupportedAssetsDocument = SupportedAssets & mongoose.Document;

@Schema()
export class SupportedAssets {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' })
  asset: Asset;

  @Prop({ required: true, default: false })
  isEnable: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' })
  user: Auth;
}

export const SupportedAssetsSchema =
  SchemaFactory.createForClass(SupportedAssets);

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
