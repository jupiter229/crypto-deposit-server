import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { Address, AddressSchema } from '../address/schema/address.schema';
import { Auth, AuthSchema } from '../authentication/schemas/auth.schema';
import {
  SupportedAssets,
  SupportedAssetsSchema,
} from './schema/supported.assets';

import { SplitPayment, SplitPaymentSchema } from './schema/split.payment';

import { SettlementService } from './settlement.service';

@Module({
  controllers: [SettlementController],
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: SupportedAssets.name, schema: SupportedAssetsSchema },
      { name: SplitPayment.name, schema: SplitPaymentSchema },
    ]),
  ],
  providers: [SettlementService],
})
export class SettlementModule {}
