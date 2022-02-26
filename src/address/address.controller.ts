import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create.address.dto';
import { AddressService } from './address.service';
import { chains } from '@liquality/cryptoassets';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';

@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateNewAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Request() req,
  ) {
    this.addressService.validateNewAddressChain(createAddressDto.chain);

    const address = await this.addressService.generateAddress(
      req.user.id,
      createAddressDto,
    );

    return {
      address: address.address,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Request() req,
  ) {
    this.addressService.validateNewAddressChain(createAddressDto.chain);
    this.addressService.validateAddressNewAddress(
      createAddressDto.chain,
      createAddressDto.address,
    );
    const address = await this.addressService.saveNewAddress(
      req.user.id,
      createAddressDto,
    );
    return {
      address: address.address,
    };
  }
}
