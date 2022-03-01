import {
  Controller,
  Put,
  Request,
  Get,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset, AssetDocument } from '../asset/schemas/asset.schema';
import {
  SupportedAssets,
  SupportedAssetsDocument,
} from './schema/supported.assets';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { UpdateSupportedAssetDto } from './dto/update.supported.asset.dto';

@Controller('settlement')
export class SettlementController {
  constructor(
    @InjectModel(Asset.name) private assetDocumentModel: Model<AssetDocument>,
    @InjectModel(SupportedAssets.name)
    private supportedAssetsDocumentModel: Model<SupportedAssetsDocument>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('supported')
  async getSupportedCryptoCurrencies(@Request() req) {
    const allSupportedAssets = await this.assetDocumentModel.find();
    const responsePayLoad = [];
    for (let i = 0; i < allSupportedAssets.length; i++) {
      const singleAsset = allSupportedAssets[i];
      let singleSupported = await this.supportedAssetsDocumentModel.findOne({
        asset: singleAsset.id,
        user: req.user.id,
      });

      if (!singleSupported) {
        singleSupported = await this.supportedAssetsDocumentModel.create({
          asset: singleAsset.id,
          user: req.user.id,
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
  @Put('supported/:id')
  async updateSupportedCryptoCurrencies(
    @Body() updateSupportedAssetDto: UpdateSupportedAssetDto,
    @Param() params,
  ) {
    const supportedAssetId = params.id;
    await this.supportedAssetsDocumentModel.findByIdAndUpdate(
      supportedAssetId,
      {
        isEnable: updateSupportedAssetDto.isEnable,
      },
    );
  }
}
