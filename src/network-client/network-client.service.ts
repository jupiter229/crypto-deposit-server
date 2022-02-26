import { Injectable } from '@nestjs/common';
import { assets as cryptoassets } from '@liquality/cryptoassets';
import { ChainNetworks } from './utils/networks';
import { EthereumRpcFeeProvider } from '@liquality/ethereum-rpc-fee-provider';
import { Client } from '@liquality/client';
import { NearRpcProvider } from '@liquality/near-rpc-provider';
import { NearJsWalletProvider } from '@liquality/near-js-wallet-provider';
import { NearSwapProvider } from '@liquality/near-swap-provider';
import { NearSwapFindProvider } from '@liquality/near-swap-find-provider';
import { SolanaRpcProvider } from '@liquality/solana-rpc-provider';
import { SolanaWalletProvider } from '@liquality/solana-wallet-provider';
import { SolanaSwapProvider } from '@liquality/solana-swap-provider';
import { SolanaSwapFindProvider } from '@liquality/solana-swap-find-provider';
import buildConfig from './build.config';
import { EthereumGasNowFeeProvider } from '@liquality/ethereum-gas-now-fee-provider';
import { EthereumRpcProvider } from '@liquality/ethereum-rpc-provider';
import { EthereumJsWalletProvider } from '@liquality/ethereum-js-wallet-provider';
import { isERC20 } from './utils/asset';
import { EthereumErc20Provider } from '@liquality/ethereum-erc20-provider';
import { EthereumErc20SwapProvider } from '@liquality/ethereum-erc20-swap-provider';
import { EthereumErc20ScraperSwapFindProvider } from '@liquality/ethereum-erc20-scraper-swap-find-provider';
import { EthereumSwapProvider } from '@liquality/ethereum-swap-provider';
import { EthereumScraperSwapFindProvider } from '@liquality/ethereum-scraper-swap-find-provider';
import { BitcoinEsploraBatchApiProvider } from '@liquality/bitcoin-esplora-batch-api-provider';
import { BitcoinJsWalletProvider } from '@liquality/bitcoin-js-wallet-provider';
import { BitcoinSwapProvider } from '@liquality/bitcoin-swap-provider';
import { BitcoinEsploraSwapFindProvider } from '@liquality/bitcoin-esplora-swap-find-provider';
import { BitcoinRpcFeeProvider } from '@liquality/bitcoin-rpc-fee-provider';
import { BitcoinFeeApiProvider } from '@liquality/bitcoin-fee-api-provider';
import { ConfigService } from '@nestjs/config';
import { getDerivationPath } from './utils/derivationPath';

@Injectable()
export class NetworkClientService {
  constructor(private readonly configService: ConfigService) {}
  public createClient(asset: string, mnemonic?, index = 0) {
    const network = this.configService.get('APP_NETWORK');
    const { chain } = cryptoassets[asset];

    const derivationPath = getDerivationPath(chain, network, index, 'default');
    const accountType = 'default';
    const assetData = cryptoassets[asset];

    if (assetData.chain === 'bitcoin')
      return this.createBtcClient(
        network,
        mnemonic,
        accountType,
        derivationPath,
      );
    if (assetData.chain === 'rsk')
      return this.createRskClient(
        asset,
        network,
        mnemonic,
        accountType,
        derivationPath,
      );
    if (assetData.chain === 'bsc')
      return this.createBSCClient(asset, network, mnemonic, derivationPath);
    if (assetData.chain === 'polygon')
      return this.createPolygonClient(asset, network, mnemonic, derivationPath);
    if (assetData.chain === 'arbitrum')
      return this.createArbitrumClient(
        asset,
        network,
        mnemonic,
        derivationPath,
      );
    if (assetData.chain === 'near')
      return this.createNearClient(network, mnemonic, derivationPath);
    if (assetData?.chain === 'solana')
      return this.createSolanaClient(network, mnemonic, derivationPath);

    return this.createEthClient(
      asset,
      network,
      mnemonic,
      accountType,
      derivationPath,
    );
  }
  private createPolygonClient(asset, network, mnemonic, derivationPath) {
    const isTestnet = network === 'testnet';
    const polygonNetwork = ChainNetworks.polygon[network];
    const rpcApi = isTestnet
      ? 'https://rpc-mumbai.maticvigil.com'
      : 'https://rpc-mainnet.maticvigil.com';
    const scraperApi = isTestnet
      ? 'https://liquality.io/polygon-testnet-api'
      : 'https://liquality.io/polygon-mainnet-api';
    const feeProvider = new EthereumRpcFeeProvider({
      slowMultiplier: 1,
      averageMultiplier: 1,
      fastMultiplier: 1.25,
    });

    return this.createEthereumClient(
      asset,
      network,
      polygonNetwork,
      rpcApi,
      scraperApi,
      feeProvider,
      mnemonic,
      'default',
      derivationPath,
    );
  }
  private createNearClient(network, mnemonic, derivationPath) {
    const nearNetwork = ChainNetworks.near[network];
    const nearClient = new Client();
    nearClient.addProvider(new NearRpcProvider(nearNetwork));
    nearClient.addProvider(
      new NearJsWalletProvider({
        network: nearNetwork,
        mnemonic,
        derivationPath,
      }),
    );
    nearClient.addProvider(new NearSwapProvider());
    nearClient.addProvider(new NearSwapFindProvider(nearNetwork?.helperUrl));

    return nearClient;
  }

  private createSolanaClient(network, mnemonic, derivationPath) {
    const solanaNetwork = ChainNetworks.solana[network];
    const solanaClient = new Client();
    solanaClient.addProvider(new SolanaRpcProvider(solanaNetwork));
    solanaClient.addProvider(
      new SolanaWalletProvider({
        network: solanaNetwork,
        mnemonic,
        derivationPath,
      }),
    );
    solanaClient.addProvider(new SolanaSwapProvider(solanaNetwork));
    solanaClient.addProvider(new SolanaSwapFindProvider(solanaNetwork));

    return solanaClient;
  }
  private createArbitrumClient(asset, network, mnemonic, derivationPath) {
    const isTestnet = network === 'testnet';
    const arbitrumNetwork = ChainNetworks.arbitrum[network];
    const rpcApi = isTestnet
      ? 'https://rinkeby.arbitrum.io/rpc'
      : `https://arbitrum-mainnet.infura.io/v3/${buildConfig.infuraApiKey}`;
    const scraperApi = isTestnet
      ? 'https://liquality.io/arbitrum-testnet-api'
      : 'https://liquality.io/arbitrum-mainnet-api';
    const feeProvider = new EthereumRpcFeeProvider({
      slowMultiplier: 1,
      averageMultiplier: 1,
      fastMultiplier: 1.25,
    });

    return this.createEthereumClient(
      asset,
      network,
      arbitrumNetwork,
      rpcApi,
      scraperApi,
      feeProvider,
      mnemonic,
      'default',
      derivationPath,
    );
  }

  private createBSCClient(asset, network, mnemonic, derivationPath) {
    const isTestnet = network === 'testnet';
    const bnbNetwork = ChainNetworks.bsc[network];
    const rpcApi = isTestnet
      ? 'https://data-seed-prebsc-1-s1.binance.org:8545'
      : 'https://bsc-dataseed.binance.org';
    const scraperApi = isTestnet
      ? 'https://liquality.io/bsc-testnet-api'
      : 'https://liquality.io/bsc-mainnet-api';
    const feeProvider = new EthereumRpcFeeProvider({
      slowMultiplier: 1,
      averageMultiplier: 1,
      fastMultiplier: 1.25,
    });

    return this.createEthereumClient(
      asset,
      network,
      bnbNetwork,
      rpcApi,
      scraperApi,
      feeProvider,
      mnemonic,
      'default',
      derivationPath,
    );
  }

  private createEthClient(
    asset,
    network,
    mnemonic,
    accountType,
    derivationPath,
  ) {
    const isTestnet = network === 'testnet';
    const ethereumNetwork = ChainNetworks.ethereum[network];
    const infuraApi = isTestnet
      ? `https://ropsten.infura.io/v3/${buildConfig.infuraApiKey}`
      : `https://mainnet.infura.io/v3/${buildConfig.infuraApiKey}`;
    const scraperApi = isTestnet
      ? 'https://liquality.io/eth-ropsten-api'
      : 'https://liquality.io/eth-mainnet-api';
    const feeProvider = isTestnet
      ? new EthereumRpcFeeProvider()
      : new EthereumGasNowFeeProvider();

    return this.createEthereumClient(
      asset,
      network,
      ethereumNetwork,
      infuraApi,
      scraperApi,
      feeProvider,
      mnemonic,
      accountType,
      derivationPath,
    );
  }
  private createRskClient(
    asset,
    network,
    mnemonic,
    accountType,
    derivationPath,
  ) {
    const isTestnet = network === 'testnet';
    const rskNetwork = ChainNetworks.rsk[network];
    const rpcApi = isTestnet
      ? 'https://public-node.testnet.rsk.co'
      : 'https://public-node.rsk.co';
    const scraperApi = isTestnet
      ? 'https://liquality.io/rsk-testnet-api'
      : 'https://liquality.io/rsk-mainnet-api';
    const feeProvider = new EthereumRpcFeeProvider({
      slowMultiplier: 1,
      averageMultiplier: 1,
      fastMultiplier: 1.25,
    });

    return this.createEthereumClient(
      asset,
      network,
      rskNetwork,
      rpcApi,
      scraperApi,
      feeProvider,
      mnemonic,
      accountType,
      derivationPath,
    );
  }
  private createEthereumClient(
    asset,
    network,
    ethereumNetwork,
    rpcApi,
    scraperApi,
    feeProvider,
    mnemonic,
    accountType,
    derivationPath,
  ) {
    const ethClient = new Client();
    ethClient.addProvider(new EthereumRpcProvider({ uri: rpcApi }));

    ethClient.addProvider(
      new EthereumJsWalletProvider({
        network: ethereumNetwork,
        mnemonic,
        derivationPath,
      }),
    );

    if (isERC20(asset)) {
      const contractAddress = cryptoassets[asset].contractAddress;
      ethClient.addProvider(new EthereumErc20Provider(contractAddress));
      ethClient.addProvider(new EthereumErc20SwapProvider());
      if (scraperApi)
        ethClient.addProvider(
          new EthereumErc20ScraperSwapFindProvider(scraperApi),
        );
    } else {
      ethClient.addProvider(new EthereumSwapProvider());
      if (scraperApi)
        ethClient.addProvider(new EthereumScraperSwapFindProvider(scraperApi));
    }
    ethClient.addProvider(feeProvider);

    return ethClient;
  }
  private createBtcClient(
    network: string,
    mnemonic: string,
    accountType: string,
    derivationPath: string,
  ) {
    const isTestnet = network === 'testnet';
    const bitcoinNetwork = ChainNetworks.bitcoin[network];
    const esploraApi = buildConfig.exploraApis[network];
    const batchEsploraApi = buildConfig.batchEsploraApis[network];

    const btcClient = new Client();
    btcClient.addProvider(
      new BitcoinEsploraBatchApiProvider({
        batchUrl: batchEsploraApi,
        url: esploraApi,
        network: bitcoinNetwork,
        numberOfBlockConfirmation: 2,
      }),
    );

    if (mnemonic) {
      btcClient.addProvider(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new BitcoinJsWalletProvider({
          network: bitcoinNetwork,
          mnemonic,
          baseDerivationPath: derivationPath,
        }),
      );
    }

    btcClient.addProvider(new BitcoinSwapProvider({ network: bitcoinNetwork }));
    btcClient.addProvider(new BitcoinEsploraSwapFindProvider(esploraApi));
    if (isTestnet) btcClient.addProvider(new BitcoinRpcFeeProvider());
    else
      btcClient.addProvider(
        new BitcoinFeeApiProvider(
          'https://liquality.io/swap/mempool/v1/fees/recommended',
        ),
      );

    return btcClient;
  }
}
