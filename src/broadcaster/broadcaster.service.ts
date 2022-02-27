import { Injectable } from '@nestjs/common';
import { CryptoDepositDto } from '../dtos/crypto.deposit.dto';
import { HttpService } from '@nestjs/axios';
import { Queue, RepeatOptions } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserSettings,
  UserSettingsDocument,
} from '../authentication/schemas/user.settings.schema';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from '../asset/schemas/asset.schema';

@Injectable()
export class BroadcasterService {
  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('broadcaster') private broadcasterQueue: Queue,
    @InjectModel(UserSettings.name)
    private userSettingsDocumentModel: Model<UserSettingsDocument>,
    @InjectModel(Asset.name)
    private assetDocumentModel: Model<AssetDocument>,
  ) {}
  async broadcastDeposit(cryptoDeposit: CryptoDepositDto) {
    const user = cryptoDeposit.address.user;

    const existingSettings = await this.userSettingsDocumentModel.findOne({
      user: user,
    });

    if (existingSettings) {
      // this.broadcasterQueue.add(
      //   {
      //     txHash: cryptoDeposit.txHash,
      //   },
      //   {
      //     attempts: 3,
      //     backoff: 15 * 60 * 1000,
      //     delay: 60 * 1000,
      //   },
      // );

      const asset = await this.assetDocumentModel.findById(
        cryptoDeposit.address?.asset,
      );
      console.log(asset);
      if (asset) {
        this.httpService
          .post(existingSettings.callbackUrl, {
            amount: cryptoDeposit.amount,
            address: cryptoDeposit.address.address,
            code: asset.code,
            txHash: cryptoDeposit.txHash,
            chain: asset.chain,
          })
          .toPromise();
      }
    }
  }
}
