import { Test, TestingModule } from '@nestjs/testing';
import { NetworkClientService } from './network-client.service';

describe('NetworkClientService', () => {
  let service: NetworkClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetworkClientService],
    }).compile();

    service = module.get<NetworkClientService>(NetworkClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
