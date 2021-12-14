import { Test, TestingModule } from '@nestjs/testing';
import { BlockSchedulerService } from './block-scheduler.service';

describe('BlockSchedulerService', () => {
  let service: BlockSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockSchedulerService],
    }).compile();

    service = module.get<BlockSchedulerService>(BlockSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
