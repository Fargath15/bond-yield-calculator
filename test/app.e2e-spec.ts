import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Bond Yield Calculator API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Test Case 1 - Par Bond', () => {
    it('Face 1000, Coupon 10%, Price 1000, Years 5, Freq 1', () => {
      return request(app.getHttpServer())
        .post('/bond/calculate')
        .send({
          faceValue: 1000,
          couponRate: 10,
          marketPrice: 1000,
          yearsToMaturity: 5,
          frequency: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.currentYield).toBe(0.1);
          expect(res.body.yieldToMaturity).toBe(0.1);
          expect(res.body.totalInterest).toBe(500);
          expect(res.body.priceClassification).toBe('par');
        });
    });
  });

  describe('Test Case 2 - Discount Bond', () => {
    it('Face 1000, Coupon 10%, Price 900, Years 5, Freq 1', () => {
      return request(app.getHttpServer())
        .post('/bond/calculate')
        .send({
          faceValue: 1000,
          couponRate: 10,
          marketPrice: 900,
          yearsToMaturity: 5,
          frequency: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.currentYield).toBeCloseTo(100 / 900, 5);
          expect(res.body.yieldToMaturity).toBeGreaterThan(0.1);
          expect(res.body.priceClassification).toBe('discount');
        });
    });
  });

  describe('Test Case 3 - Premium Bond', () => {
    it('Face 1000, Coupon 10%, Price 1100, Years 5, Freq 2', () => {
      return request(app.getHttpServer())
        .post('/bond/calculate')
        .send({
          faceValue: 1000,
          couponRate: 10,
          marketPrice: 1100,
          yearsToMaturity: 5,
          frequency: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.currentYield).toBeCloseTo(100 / 1100, 5);
          expect(res.body.yieldToMaturity).toBeLessThan(0.1);
          expect(res.body.priceClassification).toBe('premium');
        });
    });
  });
});
