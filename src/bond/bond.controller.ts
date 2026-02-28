import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { BondService } from './bond.service';
import { BondCalculationDto, BondYieldResultDto } from './dto/bond-calculation.dto';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { bondCalculationSchema } from './validation/bond-calculation.schema';

@Controller('bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}

  @Post('calculate')
  @UsePipes(new JoiValidationPipe(bondCalculationSchema))
  calculate(@Body() payload: BondCalculationDto): BondYieldResultDto {
    return this.bondService.calculateYield(payload);
  }
}
