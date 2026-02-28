export interface BondCalculationInput {
  faceValue: number;
  couponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  frequency: number;
}

// Domain layer assumes inputs are validated at the application boundary.

export type BondPriceClassification = 'discount' | 'par' | 'premium';

export interface BondCashFlowEntry {
  periodNumber: number;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export function classifyBondPrice(input: BondCalculationInput): BondPriceClassification {
  const { faceValue, marketPrice } = input;

  if (marketPrice > faceValue) {
    return 'premium';
  }

  if (marketPrice < faceValue) {
    return 'discount';
  }

  return 'par';
}

export function getNumberOfPeriods(yearsToMaturity: number, frequency: number): number {
  const periods = yearsToMaturity * frequency;
  return Math.max(1, Math.round(periods));
}

export function priceFromYield(
  perPeriodYield: number,
  input: BondCalculationInput,
): number {
  const { faceValue, couponRate, yearsToMaturity, frequency } = input;
  const periods = getNumberOfPeriods(yearsToMaturity, frequency);
  const couponPerPeriod = (faceValue * couponRate) / frequency;

  let presentValue = 0;
  const discountFactorBase = 1 + perPeriodYield;

  for (let t = 1; t <= periods; t += 1) {
    presentValue += couponPerPeriod / discountFactorBase ** t;
  }

  presentValue += faceValue / discountFactorBase ** periods;

  return presentValue;
}

export function priceDifferenceFromYield(
  perPeriodYield: number,
  input: BondCalculationInput,
): number {
  const { marketPrice } = input;
  return priceFromYield(perPeriodYield, input) - marketPrice;
}

export function generateCashFlowSchedule(input: BondCalculationInput): BondCashFlowEntry[] {
  const { faceValue, couponRate, yearsToMaturity, frequency } = input;
  const periods = getNumberOfPeriods(yearsToMaturity, frequency);
  const couponPerPeriod = (faceValue * couponRate) / frequency;

  const schedule: BondCashFlowEntry[] = [];
  let cumulativeInterest = 0;

  for (let period = 1; period <= periods; period += 1) {
    cumulativeInterest += couponPerPeriod;

    const remainingPrincipal = period === periods ? 0 : faceValue;

    schedule.push({
      periodNumber: period,
      couponPayment: couponPerPeriod,
      cumulativeInterest,
      remainingPrincipal,
    });
  }

  return schedule;
}

export function approximateYieldToMaturity(input: BondCalculationInput): number {
  const { faceValue, couponRate, marketPrice, yearsToMaturity } = input;
  const annualCoupon = faceValue * couponRate;
  const avgPrice = (faceValue + marketPrice) / 2;
  const capitalGainPerYear = (faceValue - marketPrice) / yearsToMaturity;

  if (avgPrice <= 0) {
    return 0;
  }

  return (annualCoupon + capitalGainPerYear) / avgPrice;
}

export function calculateCurrentYield(input: BondCalculationInput): number {
  const { faceValue, couponRate, marketPrice } = input;
  if (marketPrice <= 0) {
    return 0;
  }
  const annualCoupon = faceValue * couponRate;
  return annualCoupon / marketPrice;
}

export function calculateTotalInterest(input: BondCalculationInput): number {
  const { faceValue, couponRate, yearsToMaturity } = input;
  return faceValue * couponRate * yearsToMaturity;
}

export function solveByBisection(
  fn: (x: number) => number,
  low: number,
  high: number,
  tolerance = 1e-7,
  maxIterations = 100,
): number | null {
  let fLow = fn(low);
  let fHigh = fn(high);

  if (Number.isNaN(fLow) || Number.isNaN(fHigh)) {
    return null;
  }

  if (fLow * fHigh > 0) {
    return null;
  }

  let mid = 0;

  for (let i = 0; i < maxIterations; i += 1) {
    mid = (low + high) / 2;
    const fMid = fn(mid);

    if (Math.abs(fMid) < tolerance) {
      return mid;
    }

    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return mid;
}

export function solveYieldToMaturity(input: BondCalculationInput): number {
  const { frequency } = input;

  const root = solveByBisection(
    (perPeriodYield) => priceDifferenceFromYield(perPeriodYield, input),
    -0.9999,
    1.0,
  );

  if (root === null || !Number.isFinite(root)) {
    return approximateYieldToMaturity(input);
  }

  return root * frequency;
}

export function calculateYieldToMaturity(input: BondCalculationInput): number {
  return solveYieldToMaturity(input);
}


