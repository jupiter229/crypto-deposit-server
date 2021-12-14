import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Block, BlockDocument } from '../block-scheduler/schema/block.schema';
import { Model } from 'mongoose';
import { ScrapeJobDto } from '../dtos/scrape.job.dto';
import { EthereumService } from './ethereum.service';

@Processor('ethereum_scrapper')
export class EthereumProcessor {
  constructor(
    @InjectModel(Block.name) private blockDocumentModel: Model<BlockDocument>,
    private readonly ethereumService: EthereumService,
  ) {}

  @Process()
  async scrapeBlock(job: Job<ScrapeJobDto>) {
    await this.ethereumService.scrapeBlock(job.data.blockHeight);
    // console.log('ethereum_scrapper', job.data);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log(
      `Completed job ${job.id} of type ${job.name} with data}...`,
      job.data,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    console.log(
      `Failed job ${job.id} of type ${job.name} with data}...`,
      job.data,
    );
  }
}
