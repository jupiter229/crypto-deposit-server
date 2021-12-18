import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './local-auth.guard';
import { UserSettingsDto } from './dto/user.settings.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings')
  async saveUserSettings(
    @Request() req,
    @Body() userSettingsDto: UserSettingsDto,
  ) {
    await this.authService.saveUserSettings(req.user, userSettingsDto);
  }
}
