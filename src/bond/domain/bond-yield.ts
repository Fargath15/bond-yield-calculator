import { BondCalculationInput, BondPriceClassification, BondCashFlowEntry } from "../types/bond-yield.types";

export class BondYieldCalculator {

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addMonths(baseDate: Date, months: number): Date {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + months);
    return date;
  }

  public classifyBondPrice(input: BondCalculationInput): BondPriceClassification {
    const { faceValue, marketPrice } = input;

    if (marketPrice > faceValue) {
      return 'premium';
    }

    if (marketPrice < faceValue) {
      return 'discount';
    }

    return 'par';
  }

  private getNumberOfPeriods(yearsToMaturity: number, frequency: number): number {
    const periods = yearsToMaturity * frequency;
    return Math.max(1, Math.round(periods));
  }

  private priceFromYield(perPeriodYield: number, input: BondCalculationInput): number {
    const { faceValue, couponRate, yearsToMaturity, frequency } = input;
    const periods = this.getNumberOfPeriods(yearsToMaturity, frequency);
    const couponPerPeriod = (faceValue * couponRate) / frequency;

    let presentValue = 0;
    const discountFactorBase = 1 + perPeriodYield;

    for (let t = 1; t <= periods; t += 1) {
      presentValue += couponPerPeriod / discountFactorBase ** t;
    }

    presentValue += faceValue / discountFactorBase ** periods;

    return presentValue;
  }

  private priceDifferenceFromYield(perPeriodYield: number, input: BondCalculationInput): number {
    const { marketPrice } = input;
    return this.priceFromYield(perPeriodYield, input) - marketPrice;
  }

  public generateCashFlowSchedule(input: BondCalculationInput, startDate: Date = new Date()): BondCashFlowEntry[] {
    const { faceValue, couponRate, yearsToMaturity, frequency } = input;
    const periods = this.getNumberOfPeriods(yearsToMaturity, frequency);
    const couponPerPeriod = (faceValue * couponRate) / frequency;
    const monthsPerPeriod = 12 / frequency;

    const schedule: BondCashFlowEntry[] = [];
    let cumulativeInterest = 0;

    for (let period = 1; period <= periods; period += 1) {
      cumulativeInterest += couponPerPeriod;

      const periodIndex = period - 1;
      const paymentDate = this.addMonths(startDate, periodIndex * monthsPerPeriod);
      const remainingPrincipal = period === periods ? 0 : faceValue;

      schedule.push({
        periodNumber: period,
        paymentDate: this.formatDate(paymentDate),
        couponPayment: couponPerPeriod,
        cumulativeInterest,
        remainingPrincipal,
      });
    }

    return schedule;
  }

  private approximateYieldToMaturity(input: BondCalculationInput): number {
    const { faceValue, couponRate, marketPrice, yearsToMaturity } = input;
    const annualCoupon = faceValue * couponRate;
    const avgPrice = (faceValue + marketPrice) / 2;
    const capitalGainPerYear = (faceValue - marketPrice) / yearsToMaturity;

    if (avgPrice <= 0) {
      return 0;
    }

    return (annualCoupon + capitalGainPerYear) / avgPrice;
  }

  public calculateCurrentYield(input: BondCalculationInput): number {
    const { faceValue, couponRate, marketPrice } = input;
    if (marketPrice <= 0) {
      return 0;
    }
    const annualCoupon = faceValue * couponRate;
    return annualCoupon / marketPrice;
  }

  public calculateTotalInterest(input: BondCalculationInput): number {
    const { faceValue, couponRate, yearsToMaturity } = input;
    return faceValue * couponRate * yearsToMaturity;
  }

  private solveByBisection(
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

  private solveYieldToMaturity(input: BondCalculationInput): number {
    const { frequency } = input;

    const root = this.solveByBisection(
      (perPeriodYield) => this.priceDifferenceFromYield(perPeriodYield, input),
      -0.9999,
      1.0,
    );

    if (root === null || !Number.isFinite(root)) {
      return this.approximateYieldToMaturity(input);
    }

    return root * frequency;
  }

  public calculateYieldToMaturity(input: BondCalculationInput): number {
    return this.solveYieldToMaturity(input);
  }
}


