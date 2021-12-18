import { Test, TestingModule } from '@nestjs/testing';
import { BroadcasterService } from './broadcaster.service';

describe('BroadcasterService', () => {
  let service: BroadcasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BroadcasterService],
    }).compile();

    service = module.get<BroadcasterService>(BroadcasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
