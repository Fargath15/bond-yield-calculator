export interface BondCalculationInput {
  faceValue: number;
  couponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  frequency: number;
}

export type BondPriceClassification = 'discount' | 'par' | 'premium';

export interface BondCashFlowEntry {
  periodNumber: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}
