import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDocument, Auth } from './schemas/auth.schema';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authDocumentModel: Model<AuthDocument>,
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
    await this.authDocumentModel.create({
      email: createUserDto.email,
      password: hash,
    });
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
}
