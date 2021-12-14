import { AddressDocument } from '../address/schema/address.schema';

export interface CryptoDepositDto {
  amount: number;
  address: AddressDocument;
  txHash: string;
}
