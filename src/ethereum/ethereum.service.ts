import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@liquality/client';
import { InjectModel } from '@nestjs/mongoose';
import { Address, AddressDocument } from '../address/schema/address.schema';
import { Asset, AssetDocument } from '../asset/schemas/asset.schema';
import { Model } from 'mongoose';
import { erc20abi } from '../abis/erc20';
import { ConfigService } from '@nestjs/config';
import { unitToCurrency, assets } from '@liquality/cryptoassets';
import { EthereumRpcProvider } from '@liquality/ethereum-rpc-provider';
import { CryptoDepositDto } from '../dtos/crypto.deposit.dto';
import * as abiDecoder from 'abi-decoder';
import { Deposit, DepositDocument } from '../address/schema/deposit.schema';
import { Block, BlockDocument } from '../block-scheduler/schema/block.schema';

@Injectable()
export class EthereumService {
  ethClient = new Client();
  private readonly logger = new Logger(EthereumService.name);

  constructor(
    @InjectModel(Address.name)
    private addressDocumentModel: Model<AddressDocument>,
    @InjectModel(Block.name) private blockDocumentModel: Model<BlockDocument>,
    @InjectModel(Asset.name) private assetDocumentModel: Model<AssetDocument>,
    @InjectModel(Deposit.name)
    private depositDocumentModel: Model<DepositDocument>,
    private configService: ConfigService,
  ) {
    this.ethClient.addProvider(
      new EthereumRpcProvider({ uri: this.configService.get('ETH_RPC_URL') }),
    );
  }
  private async getAmountDeposited(
    transaction: any,
  ): Promise<CryptoDepositDto> {
    const to = transaction._raw?.to?.toLowerCase();

    if (to && transaction.status === 'SUCCESS') {
      if (transaction._raw.input === '0x' && transaction.value > 0) {
        const asset = await this.assetDocumentModel.findOne({
          code: 'ETH',
          chain: 'ethereum',
          type: 'native',
        });

        const address = await this.addressDocumentModel.findOne({
          address: to,
          asset: asset?.id,
        });

        if (address) {
          return {
            amount: unitToCurrency(assets['ETH'], transaction.value).toNumber(),
            address: address,
            txHash: transaction.hash,
          };
        }
        return {
          amount: 0,
          address: null,
          txHash: transaction.hash,
        };
      } else {
        abiDecoder.addABI(erc20abi);

        const depositedAsset: AssetDocument | any =
          this.configService.get('APP_NETWORK') === 'testnet'
            ? await this.getTestAssets(to)
            : await this.assetDocumentModel.findOne({
                contractAddress: to,
                chain: 'ethereum',
                type: 'erc20',
              });

        const decodedData = abiDecoder.decodeMethod(transaction._raw.input);

        if (
          transaction.hash ===
          '537d53ee930babffd8b3facf44a8b22e102e632ee4c553564dee4c502cabc59c'
        ) {
          console.log(decodedData, transaction._raw.input);
        }
        if (decodedData) {
          const receiveAddress = decodedData.params[0].value;
          const unitAmount = decodedData.params[1].value;

          const address = await this.addressDocumentModel.findOne({
            address: receiveAddress,
            asset: depositedAsset?.id,
          });

          if (address) {
            return {
              txHash: transaction.hash,
              amount: unitToCurrency(
                assets[depositedAsset.code],
                unitAmount,
              ).toNumber(),
              address: address,
            };
          }
        }
      }
    }

    return {
      amount: 0,
      address: null,
      txHash: transaction.hash,
    };
  }

  private getTransactionReceipt(txHash) {
    return this.ethClient.chain.getTransactionByHash(txHash);
  }
  async scrapeBlock(blockNumber: number) {
    const blockData = await this.ethClient.chain.getBlockByNumber(
      blockNumber,
      false,
    );
    const transactionHashes: Array<string> = blockData.transactions.map(
      (tx) => tx,
    );

    const hashesLength = transactionHashes.length;

    for (let i = 0; i < hashesLength; i++) {
      const transaction = await this.getTransactionReceipt(
        transactionHashes[i],
      );

      const cryptoDeposit = await this.getAmountDeposited(transaction);

      if (cryptoDeposit.amount > 0) {
        await this.broadcastDeposit(cryptoDeposit);
      }
      await this.blockDocumentModel.updateOne(
        {
          height: blockNumber,
          chain: 'ethereum',
        },
        {
          hasCompletedScan: true,
        },
      );
    }
  }
  getCurrentBlockHeight() {
    return this.ethClient.chain.getBlockHeight();
  }
  private async broadcastDeposit(cryptoDeposit: CryptoDepositDto) {
    const existingDeposit = await this.depositDocumentModel.findOne({
      txHash: cryptoDeposit.txHash,
    });
    if (!existingDeposit) {
      await this.depositDocumentModel.create({
        address: cryptoDeposit.address,
        amount: cryptoDeposit.amount,
        txHash: cryptoDeposit.txHash,
      });
    }
  }

  async getTestAssets(contractAddress: string) {
    const sampleAssetData: AssetDocument =
      await this.assetDocumentModel.findOne({
        chain: 'ethereum',
        type: 'erc20',
        contractAddress:
          '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),
      });
    if (sampleAssetData) {
      return {
        ...sampleAssetData.toJSON(),
        contractAddress: contractAddress,
        // code: 'MONEY',
        // name: 'Money',
        id: sampleAssetData.id,
      };
    }
    return {};
  }
}
