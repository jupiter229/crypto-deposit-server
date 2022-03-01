import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Address, AddressDocument } from './schema/address.schema';
import { Model } from 'mongoose';
import { CreateAddressDto } from './dto/create.address.dto';
import { Asset, AssetDocument } from '../asset/schemas/asset.schema';
import { AuthDocument, Auth } from '../authentication/schemas/auth.schema';
import { assets as cryptoassets, chains } from '@liquality/cryptoassets';
import { isEthereumChain } from '../network-client/utils/asset';
import {
  CredentialSeed,
  CredentialSeedDocument,
} from '../authentication/schemas/credential.seed';
import { AuthenticationService } from '../authentication/authentication.service';
import { NetworkClientService } from '../network-client/network-client.service';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private addressDocumentModel: Model<AddressDocument>,
    @InjectModel(Asset.name) private assetDocumentModel: Model<AssetDocument>,
    @InjectModel(Auth.name) private authDocumentModel: Model<AuthDocument>,
    @InjectModel(CredentialSeed.name)
    private credentialSeedDocumentModel: Model<CredentialSeedDocument>,
    private readonly authenticationService: AuthenticationService,
    private readonly networkClientService: NetworkClientService,
  ) {}

  async generateAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressDocument> {
    const credential = await this.credentialSeedDocumentModel.findOne({
      user: userId,
    });

    if (credential) {
      const seedPhrase = await this.authenticationService.decryptSeedPhrase(
        credential.seedPhrase,
      );
      const networkClient = this.networkClientService.createClient(
        createAddressDto.code,
        seedPhrase,
        Number(credential.currentDerivationIndex) + 1,
      );

      const rawAddresses = await networkClient.wallet.getAddresses();
      const result = rawAddresses[0];

      const rawAddress = isEthereumChain(createAddressDto.code)
        ? result.address.replace('0x', '')
        : result.address;

      const formattedAddress =
        chains[cryptoassets[createAddressDto.code]?.chain]?.formatAddress(
          rawAddress,
        );

      const address = await this.saveNewAddress(userId, {
        ...createAddressDto,
        address: formattedAddress,
      });

      if (address) {
        await this.addressDocumentModel.findByIdAndUpdate(address.id, {
          seedPhrase: credential.seedPhrase,
          derivationIndex: Number(credential.currentDerivationIndex) + 1,
        });

        await this.credentialSeedDocumentModel.findByIdAndUpdate(
          credential.id,
          {
            currentDerivationIndex:
              Number(credential.currentDerivationIndex) + 1,
          },
        );
        return address;
      }
    }
  }
  async saveNewAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressDocument> {
    const assetDocument = await this.assetDocumentModel.findOne({
      code: createAddressDto.code,
      chain: createAddressDto.chain,
    });

    if (assetDocument) {
      const existingAddress = await this.addressDocumentModel.findOne({
        // address: createAddressDto.address,
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
        const user = await this.authDocumentModel.findById(userId);
        if (user) {
          return this.addressDocumentModel.create({
            address: createAddressDto.address,
            asset: assetDocument,
            user,
          });
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

  validateNewAddressChain(chain: string) {
    const validAssetChains = ['ethereum', 'bitcoin'];
    if (validAssetChains.indexOf(chain.toLowerCase()) === -1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Unsupported asset chain',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  validateNewAddressType(type: string) {
    const validAssetTypes = ['native', 'erc20'];

    if (validAssetTypes.indexOf(type.toLowerCase()) === -1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Unsupported asset type',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  validateAddressNewAddress(chain: string, address: string) {
    const isAddressValid = chains[chain].isValidAddress(address);
    if (!isAddressValid) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'InvalidAddress',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
