import BN from 'bignumber.js';
import {
  assets as cryptoassets,
  unitToCurrency,
} from '@liquality/cryptoassets';

const VALUE_DECIMALS = 6;

export const dp = (amount, coin) => {
  if (!amount) return amount;
  return new BN(amount).dp(cryptoassets[coin].decimals);
};

export const dpUI = (amount, dp = VALUE_DECIMALS) => {
  if (!amount) return amount;

  return new BN(amount).dp(dp, BN.ROUND_FLOOR);
};

export const prettyBalance = (amount, coin, dp = VALUE_DECIMALS) => {
  if (!amount || !coin) return amount;

  amount = unitToCurrency(cryptoassets[coin], amount);

  return dpUI(amount, dp);
};

export const prettyFiatBalance = (amount, rate) => {
  if (!amount || !rate) return amount;
  const fiatAmount = new BN(amount).times(rate);
  if (fiatAmount) {
    return fiatAmount.toFormat(2, BN.ROUND_CEIL);
  }
  return new BN(0);
};

export const cryptoToFiat = (amount, rate) => {
  if (!rate) return new BN(amount);
  return new BN(amount).times(rate);
};

export const fiatToCrypto = (amount, rate) => {
  if (!rate) return amount;
  return new BN(amount).dividedBy(rate).dp(VALUE_DECIMALS, BN.ROUND_FLOOR);
};

export const formatFiat = (amount, dp = 2) => {
  if (amount) {
    return new BN(amount).toFormat(dp, BN.ROUND_CEIL).toString();
  }
  return new BN(0);
};

export const stringToNumber = (amountStr) => {
  if (amountStr) {
    return parseFloat(
      amountStr.toString().replace(/,/i, '').replace(/\D/g, ''),
    );
  }
  return 0;
};
