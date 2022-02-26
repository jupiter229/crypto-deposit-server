import { ChainId } from '@liquality/cryptoassets';
import { ChainNetworks } from './networks';
import { BTC_ADDRESS_TYPE_TO_PREFIX } from './address';
import { bitcoin } from '@liquality/types';

const getBitcoinDerivationPath = (accountType, coinType, index) => {
  return `${
    BTC_ADDRESS_TYPE_TO_PREFIX[bitcoin.AddressType.BECH32]
  }'/${coinType}'/${index}'`;
};

const getEthereumBasedDerivationPath = (coinType, index) =>
  `m/44'/${coinType}'/${index}'/0/0`;

const derivationPaths = {
  [ChainId.Bitcoin]: (network, index, accountType = 'default') => {
    const bitcoinNetwork = ChainNetworks[ChainId.Bitcoin][network];
    return getBitcoinDerivationPath(
      accountType,
      bitcoinNetwork.coinType,
      index,
    );
  },
  [ChainId.Ethereum]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Ethereum][network];
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index);
  },
  [ChainId.Rootstock]: (network, index, accountType = 'default') => {
    let coinType;
    if (accountType === 'rsk_ledger') {
      coinType = network === 'mainnet' ? '137' : '37310';
    } else {
      const ethNetwork = ChainNetworks[ChainId.Rootstock][network];
      coinType = ethNetwork.coinType;
    }

    return getEthereumBasedDerivationPath(coinType, index);
  },
  [ChainId.BinanceSmartChain]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.BinanceSmartChain][network];
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index);
  },
  [ChainId.Near]: (network, index) => {
    const nearNetwork = ChainNetworks[ChainId.Near][network];
    return `m/44'/${nearNetwork.coinType}'/${index}'`;
  },
  [ChainId.Polygon]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Polygon][network];
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index);
  },
  [ChainId.Arbitrum]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Arbitrum][network];
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index);
  },
  [ChainId.Solana]: (network, index) => {
    const solanaNetwork = ChainNetworks[ChainId.Solana][network];
    return `m/44'/501'/${solanaNetwork.walletIndex}'/${index}'`;
  },
};

export const getDerivationPath = (chainId, network, index, accountType) => {
  return derivationPaths[chainId](network, index, accountType);
};
