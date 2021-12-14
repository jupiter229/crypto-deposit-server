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
  @Post('')
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Request() req,
  ) {
    const validAssetTypes = ['native', 'erc20'];
    const validAssetChains = ['ethereum', 'bitcoin'];
    if (validAssetChains.indexOf(createAddressDto.chain.toLowerCase()) === -1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Unsupported asset chain',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (validAssetTypes.indexOf(createAddressDto.type.toLowerCase()) === -1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Unsupported asset type',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAddressValid = chains[createAddressDto.chain].isValidAddress(
      createAddressDto.address,
    );

    if (!isAddressValid) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'InvalidAddress',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.addressService.saveNewAddress(req.user.id, createAddressDto);
  }
}
