import { Module } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BitcoinProcessor } from './bitcoin.processor';
import { Address, AddressSchema } from '../address/schema/address.schema';
import { BullModule } from '@nestjs/bull';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { Deposit, DepositSchema } from '../address/schema/deposit.schema';
import { Block, BlockSchema } from '../block-scheduler/schema/block.schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'btc_scrapper',
    }),
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: Block.name, schema: BlockSchema },
    ]),
  ],
  providers: [BitcoinService, BitcoinProcessor],
  exports: [BitcoinService],
})
export class BitcoinModule {}
