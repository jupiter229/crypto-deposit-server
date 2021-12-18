import { Module } from '@nestjs/common';
import { BroadcasterService } from './broadcaster.service';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from '../authentication/schemas/auth.schema';
import {
  UserSettings,
  UserSettingsSchema,
} from '../authentication/schemas/user.settings.schema';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';

@Module({
  providers: [BroadcasterService],
  exports: [BroadcasterService],
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    HttpModule,
    BullModule.registerQueue({
      name: 'broadcaster',
    }),
  ],
})
export class BroadcasterModule {}
