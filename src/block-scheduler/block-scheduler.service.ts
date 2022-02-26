import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BitcoinService } from '../bitcoin/bitcoin.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block, BlockDocument } from './schema/block.schema';
import { ConfigService } from '@nestjs/config';
import { EthereumService } from '../ethereum/ethereum.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class BlockSchedulerService {
  constructor(
    private readonly bitcoinService: BitcoinService,
    private readonly ethereumService: EthereumService,
    private readonly configService: ConfigService,
    @InjectModel(Block.name) private blockDocumentModel: Model<BlockDocument>,
    @InjectQueue('ethereum_scrapper')
    private readonly ethereumScrapperQueue: Queue,
    @InjectQueue('bitcoin_scrapper')
    private readonly bitcoinScrapperQueue: Queue,
  ) {
    bitcoinScrapperQueue.clean(0);
    ethereumScrapperQueue.clean(0);

    bitcoinScrapperQueue.empty();
    ethereumScrapperQueue.empty();
    // this.blockDocumentModel.create({
    //   height: Number(this.configService.get('BITCOIN_START_BLOCK')),
    //   chain: 'bitcoin',
    // });
    // this.blockDocumentModel.create({
    //   height: Number(this.configService.get('ETHEREUM_START_BLOCK')),
    //   chain: 'ethereum',
    // });
  }
  private readonly logger = new Logger(BlockSchedulerService.name);

  @Cron('* * * * *')
  async handleEthereumCron() {
    // this.logger.debug('handleEthereumCron');
    // const currentBlockHeight = await this.getChainService(
    //   'ethereum',
    // ).getCurrentBlockHeight();
    // const pendingBlocks = await this.initPendingBlocks(
    //   'ethereum',
    //   currentBlockHeight,
    // );
    // console.log(pendingBlocks.length, 'ethereum', currentBlockHeight);
    // pendingBlocks.forEach((blockDocument) => {
    //   this.ethereumScrapperQueue.add(
    //     {
    //       blockHeight: blockDocument.height,
    //     },
    //     {
    //       attempts: 3,
    //       backoff: 15 * 60 * 1000,
    //       delay: 2 * 1000,
    //     },
    //   );
    // });
  }
  private getChainService(chain: string) {
    if (chain === 'bitcoin') {
      return this.bitcoinService;
    } else if (chain === 'ethereum') {
      return this.ethereumService;
    }
    throw new Error('getChainService: Unknown Chain service required');
  }

  private async initPendingBlocks(
    chain: string,
    currentBlockHeight: number,
  ): Promise<Array<BlockDocument>> {
    const currentStartBlock: BlockDocument = await this.blockDocumentModel
      .findOne({
        chain,
      })
      .sort({ height: 'desc' });

    if (currentStartBlock) {
      for (let i = currentStartBlock.height + 1; i <= currentBlockHeight; i++) {
        const isExisting = await this.blockDocumentModel.findOne({
          chain,
          height: i,
        });
        if (!isExisting) {
          await this.blockDocumentModel.create({
            chain,
            height: i,
          });
        }
      }
      return this.blockDocumentModel
        .find({
          chain,
          hasCompletedScan: false,
        })
        .sort({ height: 'desc' });
    } else {
      await this.blockDocumentModel.create({
        chain,
        height: currentBlockHeight,
      });
      return this.blockDocumentModel
        .find({
          chain,
          hasCompletedScan: false,
        })
        .sort({ height: 'desc' });
    }
  }

  @Cron('*/10 * * * *')
  // @Cron('* * * * *')
  async handleBitcoinCron() {
    this.logger.debug('handleBitcoinCron');
    const currentBlockHeight = await this.getChainService(
      'bitcoin',
    ).getCurrentBlockHeight();
    const pendingBlocks = await this.initPendingBlocks(
      'bitcoin',
      currentBlockHeight,
    );
    console.log(pendingBlocks.length, 'pendingBlocks.length bitcoin');
    pendingBlocks.forEach((blockDocument) => {
      this.bitcoinScrapperQueue.add(
        {
          blockHeight: blockDocument.height,
        },
        {
          attempts: 3,
          backoff: 15 * 60 * 1000,
          delay: 60 * 1000,
        },
      );
    });
  }
}
