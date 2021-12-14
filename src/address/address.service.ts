import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Address, AddressDocument } from './schema/address.schema';
import { Model } from 'mongoose';
import { CreateAddressDto } from './dto/create.address.dto';
import { Asset, AssetDocument } from '../asset/schemas/asset.schema';
import { AuthDocument, Auth } from '../authentication/schemas/auth.schema';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private addressDocumentModel: Model<AddressDocument>,
    @InjectModel(Asset.name) private assetDocumentModel: Model<AssetDocument>,
    @InjectModel(Auth.name) private authDocumentModel: Model<AuthDocument>,
  ) {}

  async saveNewAddress(userId: string, createAddressDto: CreateAddressDto) {
    const assetDocument = await this.assetDocumentModel.findOne({
      type: createAddressDto.type,
      code: createAddressDto.code,
      chain: createAddressDto.chain,
    });

    if (assetDocument) {
      const existingAddress = await this.addressDocumentModel.findOne({
        address: createAddressDto.address,
        asset: assetDocument,
      });
      if (existingAddress) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Address has been added already',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const user = await this.authDocumentModel.findOne({
          id: userId,
        });
        if (user) {
          await this.addressDocumentModel.create({
            address: createAddressDto.address,
            asset: assetDocument,
            user,
          });
          return;
        }
      }
    }
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error:
          'Asset is not supported, please check the asset parameters and try again',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
