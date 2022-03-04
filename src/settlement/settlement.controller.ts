import {
  Controller,
  Put,
  Request,
  Get,
  UseGuards,
  Body,
  Param,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SupportedAssets,
  SupportedAssetsDocument,
} from './schema/supported.assets';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { UpdateSupportedAssetDto } from './dto/update.supported.asset.dto';
import { SettlementService } from './settlement.service';
import { CreateSplitPaymentsDto } from './dto/create.split.payments.dto';

@Controller('settlement')
export class SettlementController {
  constructor(
    @InjectModel(SupportedAssets.name)
    private supportedAssetsDocumentModel: Model<SupportedAssetsDocument>,
    private readonly settlementService: SettlementService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('supported')
  async getSupportedCryptoCurrencies(@Request() req) {
    return this.settlementService.getSupportedCryptoCurrencies(req.user.id);
  }
  @Put('supported/:id')
  async updateSupportedCryptoCurrencies(
    @Body() updateSupportedAssetDto: UpdateSupportedAssetDto,
    @Param() params,
  ) {
    await this.supportedAssetsDocumentModel.findByIdAndUpdate(params.id, {
      isEnable: updateSupportedAssetDto.isEnable,
    });
  }

  @Put('split-payment/')
  async updateSplitPayment(
    @Request() req,
    @Body() createSplitPaymentsDto: CreateSplitPaymentsDto,
  ) {
    await this.settlementService.updateSplitPayment(
      req.user.id,
      createSplitPaymentsDto,
    );
  }
}
