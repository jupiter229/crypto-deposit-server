import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema, Auth } from './schemas/auth.schema';
import {
  CredentialSeedSchema,
  CredentialSeed,
} from './schemas/credential.seed';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import {
  UserSettings,
  UserSettingsSchema,
} from './schemas/user.settings.schema';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  exports: [AuthenticationService],
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
      { name: CredentialSeed.name, schema: CredentialSeedSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRY'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AuthenticationModule {}
