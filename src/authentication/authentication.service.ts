import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDocument, Auth } from './schemas/auth.schema';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createCipheriv, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { generateMnemonic } from 'bip39';
import {
  UserSettings,
  UserSettingsDocument,
} from './schemas/user.settings.schema';
import { UserSettingsDto } from './dto/user.settings.dto';
import {
  CredentialSeedDocument,
  CredentialSeed,
} from './schemas/credential.seed';

@Injectable()
export class AuthenticationService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authDocumentModel: Model<AuthDocument>,
    @InjectModel(CredentialSeed.name)
    private credentialSeedDocumentModel: Model<CredentialSeedDocument>,
    @InjectModel(UserSettings.name)
    private userSettingsDocumentModel: Model<UserSettingsDocument>,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.authDocumentModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email has already been used',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hash = await bcryptjs.hash(
      createUserDto.password,
      parseInt(this.configService.get('PASSWORD_SALT')),
    );

    const user = await this.authDocumentModel.create({
      email: createUserDto.email,
      password: hash,
    });
    await this.credentialSeedDocumentModel.create({
      seedPhrase: await this.generateSeedPhrase(),
      user: user.id,
    });
  }

  public async decryptSeedPhrase(encryptedText: string): Promise<string> {
    const randomBytes = String(this.configService.get('IV_RANDOM_BYTES'));
    const iv = Buffer.from(randomBytes, 'hex');
    const password = String(this.configService.get('PASSWORD_GENERATE_KEY'));
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([
      decipher.update(encryptedText, 'hex'),
      decipher.final(),
    ]);
    return decryptedText.toString();
  }
  private async generateSeedPhrase() {
    // const seedPhrase = generateMnemonic();
    const seedPhrase =
      'zoo cotton detail parade inflict helmet ladder topple toilet invite garden online';
    const randomBytes = String(this.configService.get('IV_RANDOM_BYTES'));
    const iv = Buffer.from(randomBytes, 'hex');
    const password = String(this.configService.get('PASSWORD_GENERATE_KEY'));

    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encryptedText = Buffer.concat([
      cipher.update(seedPhrase),
      cipher.final(),
    ]);
    return encryptedText.toString('hex');
  }

  async login(user: AuthDocument) {
    const payload = { id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.authDocumentModel.findOne({
      email,
    });

    if (user) {
      const isMatch = await bcryptjs.compare(pass, user.password);
      if (isMatch) {
        return {
          id: user.id,
        };
      }
    }
    return null;
  }

  async saveUserSettings(user: AuthDocument, userSettings: UserSettingsDto) {
    const existingSettings = await this.userSettingsDocumentModel.findOne({
      user: user.id,
    });
    if (existingSettings) {
      return this.userSettingsDocumentModel.updateOne(
        { id: existingSettings.id },
        {
          callbackUrl: userSettings.callbackUrl,
        },
      );
    }
    return this.userSettingsDocumentModel.create({
      user: user.id,
      callbackUrl: userSettings.callbackUrl,
    });
  }
}
