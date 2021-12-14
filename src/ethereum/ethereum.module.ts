import { Module } from '@nestjs/common';
import { EthereumService } from './ethereum.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../address/schema/address.schema';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { Deposit, DepositSchema } from '../address/schema/deposit.schema';
import { EthereumProcessor } from './ethereum.processor';
import { Block, BlockSchema } from '../block-scheduler/schema/block.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: Block.name, schema: BlockSchema },
    ]),
  ],
  providers: [EthereumService, EthereumProcessor],
  exports: [EthereumService],
})
export class EthereumModule {}
