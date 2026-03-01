import { Injectable } from '@nestjs/common';
import {
  BondCalculationDto,
  BondCashFlowEntryDto,
  BondYieldResultDto,
} from './dto/bond-calculation.dto';
import {
  BondYieldCalculator,
} from './domain/bond-yield';
import { BondPriceClassification } from './types/bond-yield.types';

@Injectable()
export class BondService {
  private readonly bondYieldCalculator = new BondYieldCalculator();

  public calculateYield(input: BondCalculationDto): BondYieldResultDto {
    const calculationInput = {
      faceValue: input.faceValue,
      couponRate: input.couponRate / 100,
      marketPrice: input.marketPrice,
      yearsToMaturity: input.yearsToMaturity,
      frequency: input.frequency,
    };

    const yieldToMaturityRaw = this.bondYieldCalculator.calculateYieldToMaturity(calculationInput);
    const yieldToMaturity = Number(yieldToMaturityRaw.toFixed(6));
    const currentYieldRaw = this.bondYieldCalculator.calculateCurrentYield(calculationInput);
    const currentYield = Number(currentYieldRaw.toFixed(6));
    const totalInterest = this.bondYieldCalculator.calculateTotalInterest(calculationInput);
    const priceClassification: BondPriceClassification = this.bondYieldCalculator.classifyBondPrice(calculationInput);
    const cashFlows: BondCashFlowEntryDto[] = this.bondYieldCalculator.generateCashFlowSchedule(calculationInput);

    return {
      yieldToMaturity,
      currentYield,
      totalInterest,
      priceClassification,
      cashFlows
    };
  }
}
