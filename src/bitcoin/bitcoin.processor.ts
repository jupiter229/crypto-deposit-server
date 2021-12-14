import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Block, BlockDocument } from '../block-scheduler/schema/block.schema';
import { Model } from 'mongoose';
import { BitcoinService } from './bitcoin.service';
import { ScrapeJobDto } from '../dtos/scrape.job.dto';

@Processor('bitcoin_scrapper')
export class BitcoinProcessor {
  constructor(
    @InjectModel(Block.name) private blockDocumentModel: Model<BlockDocument>,
    private readonly bitcoinService: BitcoinService,
  ) {}

  @Process()
  async scrapeBlock(job: Job<ScrapeJobDto>) {
    await this.bitcoinService.scrapeBlock(job.data.blockHeight);
    // console.log('bitcoin_scrapper', job.data);
  }
}
