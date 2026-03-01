import type { BondPriceClassification } from '../types/bond-yield.types';

export class BondCalculationDto {
  faceValue: number;
  /**
   * Annual coupon rate as a percentage (e.g. 5 for 5%).
   */
  couponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  /**
   * Number of coupon payments per year (e.g. 1, 2, 4).
   */
  frequency: number;
}

export class BondCashFlowEntryDto {
  periodNumber: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export class BondYieldResultDto {
  /**
   * Annualized yield to maturity as a decimal (e.g. 0.0525 for 5.25%).
   */
  yieldToMaturity: number;

  /**
   * Current yield as a decimal (e.g. 0.05 for 5%).
   */
  currentYield: number;

  /**
   * Total coupon interest paid over the bond's life.
   */
  totalInterest: number;

  priceClassification: BondPriceClassification;

  cashFlows: BondCashFlowEntryDto[];
}

