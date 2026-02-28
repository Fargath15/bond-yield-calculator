import { Test, TestingModule } from '@nestjs/testing';
import { BondController } from './bond.controller';
import { BondService } from './bond.service';

describe('BondController', () => {
  let controller: BondController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BondController],
      providers: [BondService],
    }).compile();

    controller = module.get<BondController>(BondController);
  });

  describe('Test Case 1 - Par Bond', () => {
    it('Face 1000, Coupon 10%, Price 1000, Years 5, Freq 1', () => {
      const result = controller.calculate({
        faceValue: 1000,
        couponRate: 10,
        marketPrice: 1000,
        yearsToMaturity: 5,
        frequency: 1,
      });
      expect(result.currentYield).toBe(0.1);
      expect(result.yieldToMaturity).toBe(0.1);
      expect(result.totalInterest).toBe(500);
      expect(result.priceClassification).toBe('par');
    });
  });

  describe('Test Case 2 - Discount Bond', () => {
    it('Face 1000, Coupon 10%, Price 900, Years 5, Freq 1', () => {
      const result = controller.calculate({
        faceValue: 1000,
        couponRate: 10,
        marketPrice: 900,
        yearsToMaturity: 5,
        frequency: 1,
      });
      expect(result.currentYield).toBeCloseTo(100 / 900, 5);
      expect(result.yieldToMaturity).toBeGreaterThan(0.1);
      expect(result.priceClassification).toBe('discount');
    });
  });

  describe('Test Case 3 - Premium Bond', () => {
    it('Face 1000, Coupon 10%, Price 1100, Years 5, Freq 2', () => {
      const result = controller.calculate({
        faceValue: 1000,
        couponRate: 10,
        marketPrice: 1100,
        yearsToMaturity: 5,
        frequency: 2,
      });
      expect(result.currentYield).toBeCloseTo(100 / 1100, 5);
      expect(result.yieldToMaturity).toBeLessThan(0.1);
      expect(result.priceClassification).toBe('premium');
    });
  });
});
