import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from './schema/address.schema';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { AuthSchema, Auth } from '../authentication/schemas/auth.schema';
import {
  CredentialSeed,
  CredentialSeedSchema,
} from '../authentication/schemas/credential.seed';
import { AuthenticationModule } from '../authentication/authentication.module';
import { NetworkClientModule } from '../network-client/network-client.module';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [
    AuthenticationModule,
    NetworkClientModule,
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: CredentialSeed.name, schema: CredentialSeedSchema },
    ]),
  ],
})
export class AddressModule {}
