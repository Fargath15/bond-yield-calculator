# Bond Yield Calculator API

NestJS API for bond yield calculations including yield to maturity (YTM), current yield, total interest, price classification, and cash flow schedules.

## Setup

```bash
npm install
```

## Run

```bash
npm run start:dev
```

Server runs at `http://localhost:3000` (or `PORT` env var).

## API

### Health check

```
GET /
```

Returns `{ "status": "ok", "service": "bond-yield-calculator" }`.

### Calculate bond yield

```
POST /bond/calculate
Content-Type: application/json
```

**Request body:**

| Field            | Type   | Description                                      |
|------------------|--------|--------------------------------------------------|
| faceValue        | number | Par value of the bond                            |
| couponRate       | number | Annual coupon rate as percentage (e.g. 10 for 10%)|
| marketPrice      | number | Current market price                             |
| yearsToMaturity  | number | Years until maturity                             |
| frequency        | number | Coupon payments per year (1=annual, 2=semi-annual)|

**Example:**

```json
{
  "faceValue": 1000,
  "couponRate": 10,
  "marketPrice": 950,
  "yearsToMaturity": 5,
  "frequency": 2
}
```

**Response:**

```json
{
  "yieldToMaturity": 0.112345,
  "currentYield": 0.105263,
  "totalInterest": 500,
  "priceClassification": "discount",
  "cashFlows": [
    {
      "periodNumber": 1,
      "paymentDate": "2026-02-28",
      "couponPayment": 50,
      "cumulativeInterest": 50,
      "remainingPrincipal": 1000
    },
    ...
  ]
}
```

- `yieldToMaturity` / `currentYield`: decimal (e.g. 0.05 = 5%)
- `priceClassification`: `"premium"` | `"par"` | `"discount"`
- `cashFlows`: schedule with period number, payment date, coupon payment, cumulative interest, remaining principal

## Tests

```bash
npm test
npm run test:e2e
```
