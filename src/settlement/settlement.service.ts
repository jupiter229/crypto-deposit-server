import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset, AssetDocument } from '../asset/schemas/asset.schema';
import { Model } from 'mongoose';
import {
  SupportedAssets,
  SupportedAssetsDocument,
} from './schema/supported.assets';

import { SplitPayment, SplitPaymentDocument } from './schema/split.payment';
import { CreateSplitPaymentDto } from './dto/create.split.payment.dto';
import { CreateSplitPaymentsDto } from './dto/create.split.payments.dto';

@Injectable()
export class SettlementService {
  constructor(
    @InjectModel(Asset.name) private assetDocumentModel: Model<AssetDocument>,
    @InjectModel(SupportedAssets.name)
    private supportedAssetsDocumentModel: Model<SupportedAssetsDocument>,
    @InjectModel(SplitPayment.name)
    private splitPaymentDocumentModel: Model<SplitPaymentDocument>,
  ) {}
  async getSupportedCryptoCurrencies(userId) {
    const allSupportedAssets = await this.assetDocumentModel.find();
    const responsePayLoad = [];
    for (let i = 0; i < allSupportedAssets.length; i++) {
      const singleAsset = allSupportedAssets[i];
      let singleSupported = await this.supportedAssetsDocumentModel.findOne({
        asset: singleAsset.id,
        user: userId,
      });

      if (!singleSupported) {
        singleSupported = await this.supportedAssetsDocumentModel.create({
          asset: singleAsset.id,
          user: userId,
        });
      }
      responsePayLoad.push({
        id: singleSupported.id,
        assetCode: singleAsset.code,
        assetType: singleAsset.type,
        isEnable: !singleSupported ? false : singleSupported.isEnable,
      });
    }
    return responsePayLoad;
  }
  validateIsShareUpTo100(shares: Array<number>) {
    const totalShare = shares.reduce((sum, current) => {
      return sum + current;
    }, 0);

    if (!(totalShare === 0 || totalShare === 100)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Total Share is not equal to 100',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSplitPayment(
    userId,
    createSplitPaymentsDto: CreateSplitPaymentsDto,
  ) {
    const newShares = createSplitPaymentsDto.splitPayments.map((s) => {
      if (s.share > 0) {
        return s.share;
      }
      return 0;
    });

    const existingPayment = await this.splitPaymentDocumentModel.find({
      user: userId,
    });

    if (
      newShares.length === existingPayment.length ||
      existingPayment.length === 0
    ) {
      this.validateIsShareUpTo100(newShares);

      for (let i = 0; i < createSplitPaymentsDto.splitPayments.length; i++) {
        const createSplitPaymentDto = createSplitPaymentsDto.splitPayments[i];

        const existingSplit = await this.splitPaymentDocumentModel.findOne({
          name: createSplitPaymentDto.name.toLowerCase(),
          user: userId,
        });
        if (existingSplit) {
          const updateBody: any = {};
          if (createSplitPaymentDto.name) {
            updateBody.name = createSplitPaymentDto.name;
          }
          if (createSplitPaymentDto.share) {
            updateBody.share = createSplitPaymentDto.share;
          }
          await this.splitPaymentDocumentModel.findByIdAndUpdate(
            existingSplit.id,
            updateBody,
          );
        } else {
          await this.splitPaymentDocumentModel.create({
            name: createSplitPaymentDto.name,
            share: createSplitPaymentDto.share,
          });
        }
      }
    }
  }
}
