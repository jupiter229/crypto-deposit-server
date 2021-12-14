import { Module } from '@nestjs/common';
import { BlockSchedulerService } from './block-scheduler.service';
import { BitcoinModule } from '../bitcoin/bitcoin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './schema/block.schema';
import { EthereumModule } from '../ethereum/ethereum.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BitcoinModule,
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
    EthereumModule,
    BullModule.registerQueue({
      name: 'ethereum_scrapper',
    }),
    BullModule.registerQueue({
      name: 'bitcoin_scrapper',
    }),
  ],
  providers: [BlockSchedulerService],
})
export class BlockSchedulerModule {}
