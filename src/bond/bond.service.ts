import { Injectable } from '@nestjs/common';
import {
  BondCalculationDto,
  BondCashFlowEntryDto,
  BondPriceClassification,
  BondYieldResultDto,
} from './dto/bond-calculation.dto';
import {
  calculateYieldToMaturity,
  classifyBondPrice,
  calculateCurrentYield,
  calculateTotalInterest,
  generateCashFlowSchedule,
} from './domain/bond-yield';

@Injectable()
export class BondService {
  calculateYield(input: BondCalculationDto): BondYieldResultDto {
    const calculationInput = {
      faceValue: input.faceValue,
      couponRate: input.couponRate / 100,
      marketPrice: input.marketPrice,
      yearsToMaturity: input.yearsToMaturity,
      frequency: input.frequency,
    };

    const yieldToMaturityRaw = calculateYieldToMaturity(calculationInput);
    const yieldToMaturity = Number(yieldToMaturityRaw.toFixed(6));
    const currentYieldRaw = calculateCurrentYield(calculationInput);
    const currentYield = Number(currentYieldRaw.toFixed(6));
    const totalInterest = calculateTotalInterest(calculationInput);
    const priceClassification: BondPriceClassification = classifyBondPrice(calculationInput);
    const cashFlows: BondCashFlowEntryDto[] = generateCashFlowSchedule(calculationInput);

    return {
      yieldToMaturity,
      currentYield,
      totalInterest,
      priceClassification,
      cashFlows
    };
  }
}
