import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { Address, AddressDocument } from '../address/schema/address.schema';
import { Model } from 'mongoose';
import { values, forEach } from 'lodash';
import { assets } from '@liquality/cryptoassets';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private assetDocumentModel: Model<AssetDocument>,
    @InjectModel(Address.name)
    private addressDocumentModel: Model<AddressDocument>,
  ) {
    assetDocumentModel.find({}).then((results: Array<AssetDocument>) => {
      if (results.length === 0) {
        const assetsAsArr = values(assets);
        forEach(assetsAsArr, async function (singleAsset) {
          try {
            await assetDocumentModel.create({
              ...singleAsset,
              isEnable: false,
            });
          } catch (e) {
            console.log(e.message);
          }
        });
      }
    });
  }
}
