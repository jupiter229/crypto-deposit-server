import { Module } from '@nestjs/common';
import { NetworkClientService } from './network-client.service';

@Module({
  providers: [NetworkClientService],
  exports: [NetworkClientService],
})
export class NetworkClientModule {}
