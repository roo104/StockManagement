# Yahoo Finance API Authentication Issue

## Problem

Yahoo Finance's `quoteSummary` API endpoint now requires authentication tokens (crumb/cookie mechanism) and returns `401 Unauthorized` errors when accessed without proper authentication.

## Error Message

```
401 Unauthorized from GET https://query2.finance.yahoo.com/v10/finance/quoteSummary/AAPL
{"finance":{"result":null,"error":{"code":"Unauthorized","description":"Invalid Crumb"}}}
```

## Current Status

The "Fetch from Yahoo Finance" button in the UI will show an error message explaining the issue.

## Workaround Options

### Option 1: Use Manual Data Entry (Recommended for Testing)

Use the provided sample data script to populate data for AAPL:

```bash
./sample-data-aapl.sh
```

Or manually post data via the API endpoints:

```bash
# Company Overview
POST /api/fundamental/{symbol}/overview

# Income Statement
POST /api/fundamental/{symbol}/income-statement

# Balance Sheet
POST /api/fundamental/{symbol}/balance-sheet

# Cash Flow Statement
POST /api/fundamental/{symbol}/cash-flow-statement
```

See `FUNDAMENTAL_ANALYSIS_USAGE.md` for detailed API documentation.

### Option 2: Integrate a Paid Financial Data Provider

Replace Yahoo Finance with one of these alternatives:

1. **Alpha Vantage** (Free tier: 25 requests/day)
   - Website: https://www.alphavantage.co/
   - Endpoints: Fundamental data, income statements, balance sheets, cash flow

2. **Financial Modeling Prep** (Free tier: 250 requests/day)
   - Website: https://financialmodelingprep.com/
   - Comprehensive fundamental data API

3. **Polygon.io** (Free tier: Limited)
   - Website: https://polygon.io/
   - Real-time and historical financial data

4. **IEX Cloud** (Free tier available)
   - Website: https://iexcloud.io/
   - Financial statements and company data

### Option 3: Implement Yahoo Finance Cookie/Crumb Authentication

This is more complex but allows continued use of Yahoo Finance:

1. First request to get cookie and crumb token
2. Use tokens in subsequent requests
3. Tokens expire periodically and need refresh

Example implementation would require:
- Initial request to Yahoo Finance homepage to get cookie
- Parse crumb from response
- Include cookie and crumb in all API requests

## Code Locations

- Backend service: `src/main/kotlin/jp/stocks/service/FundamentalDataFetchService.kt`
- Frontend UI: `frontend/src/pages/FundamentalAnalysisPage/FundamentalAnalysisPage.tsx`
- API endpoints: `src/main/kotlin/jp/stocks/controller/FundamentalAnalysisController.kt`

## Sample Data Script

The `sample-data-aapl.sh` script creates sample data for Apple (AAPL) including:
- Company overview with sector, industry, market cap
- Income statement with revenue, expenses, net income
- Balance sheet with assets, liabilities, equity
- Cash flow statement with operating, investing, financing cash flows

Run it with:
```bash
./sample-data-aapl.sh
```

Then view the data at: http://localhost:3000/fundamental

## Recommendation

For production use, integrate with a paid financial data provider. For development/testing, use the manual data entry endpoints or the sample data script.

## Alternative: Use chart/quote API (Limited Data)

The chart API (`/v8/finance/chart/{symbol}`) still works without authentication but only provides:
- Historical price data (OHLC)
- Volume
- Limited metrics

It does NOT provide:
- Financial statements
- Balance sheet
- Cash flow statements
- Detailed company information

This is why we need an alternative data source for fundamental analysis.
