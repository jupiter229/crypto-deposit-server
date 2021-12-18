import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitcoinModule } from './bitcoin/bitcoin.module';
import { EthereumModule } from './ethereum/ethereum.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockSchedulerModule } from './block-scheduler/block-scheduler.module';
import { AssetModule } from './asset/asset.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AddressModule } from './address/address.module';
import { BroadcasterModule } from './broadcaster/broadcaster.module';

@Module({
  imports: [
    BitcoinModule,
    EthereumModule,
    MongooseModule.forRoot('mongodb://localhost/crypto-deposit-server'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'deposit-scrapper',
    }),
    ScheduleModule.forRoot(),
    BlockSchedulerModule,
    AssetModule,
    AuthenticationModule,
    AddressModule,
    BroadcasterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
