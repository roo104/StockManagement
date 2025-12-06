# Fundamental Analysis API - Usage Guide

## Overview

This system provides comprehensive fundamental analysis features for stocks, including:
- Financial statements (Income Statement, Balance Sheet, Cash Flow)
- Valuation metrics (P/E, P/B, EV/EBITDA, ROE, ROA, etc.)
- DCF (Discounted Cash Flow) valuation
- Automatic daily data fetching from Yahoo Finance

## Table of Contents

1. [Stock Watchlist Management](#stock-watchlist-management)
2. [Fetching Fundamental Data](#fetching-fundamental-data)
3. [Retrieving Financial Statements](#retrieving-financial-statements)
4. [Valuation Metrics](#valuation-metrics)
5. [DCF Analysis](#dcf-analysis)
6. [Scheduled Jobs](#scheduled-jobs)

---

## Stock Watchlist Management

The watchlist determines which stocks have their fundamental data automatically fetched daily.

### Get All Stocks in Watchlist

```bash
GET /api/watchlist
```

**Response:**
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "active": true,
    "lastFetchedAt": "2025-12-06T02:00:00",
    "fetchFrequencyHours": 24,
    "createdAt": "2025-12-06T00:00:00",
    "updatedAt": "2025-12-06T02:00:00"
  }
]
```

### Get Active Stocks Only

```bash
GET /api/watchlist/active
```

### Get Stocks Needing Update

```bash
GET /api/watchlist/needs-update
```

Returns stocks that haven't been fetched within their `fetchFrequencyHours` window.

### Add Stock to Watchlist

```bash
POST /api/watchlist
Content-Type: application/json

{
  "symbol": "NFLX",
  "name": "Netflix Inc.",
  "fetchFrequencyHours": 24
}
```

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `name` (optional): Company name
- `fetchFrequencyHours` (optional): How often to fetch data (default: 24)

### Remove Stock from Watchlist

```bash
DELETE /api/watchlist/NFLX
```

### Activate/Deactivate Stock

```bash
# Activate (resume fetching)
PUT /api/watchlist/NFLX/activate

# Deactivate (pause fetching)
PUT /api/watchlist/NFLX/deactivate
```

---

## Fetching Fundamental Data

### Manual Fetch and Save

Fetch fundamental data from Yahoo Finance and save to database:

```bash
POST /api/fundamental/AAPL/fetch
```

**Response:**
```json
{
  "success": true,
  "message": "Fundamental data fetched and saved successfully for AAPL"
}
```

### Preview Data Without Saving

```bash
GET /api/fundamental/AAPL/fetch-preview
```

Returns the raw data from Yahoo Finance without saving to database.

---

## Retrieving Financial Statements

### Get Latest Financial Statements

```bash
GET /api/fundamental/AAPL/statements/latest
```

**Response:**
```json
{
  "symbol": "AAPL",
  "incomeStatement": {
    "symbol": "AAPL",
    "fiscalDateEnding": "2024-09-30",
    "reportedCurrency": "USD",
    "totalRevenue": 391035000000,
    "costOfRevenue": 210352000000,
    "grossProfit": 180683000000,
    "operatingExpenses": 55433000000,
    "operatingIncome": 125250000000,
    "netIncome": 101956000000,
    "ebitda": 135564000000,
    "eps": 6.42,
    "weightedAverageShares": 15882752000
  },
  "balanceSheet": { ... },
  "cashFlowStatement": { ... }
}
```

### Get Income Statement History

```bash
GET /api/fundamental/AAPL/income-statements
```

Returns all historical income statements for the symbol.

### Get Balance Sheet History

```bash
GET /api/fundamental/AAPL/balance-sheets
```

### Get Cash Flow Statement History

```bash
GET /api/fundamental/AAPL/cash-flow-statements
```

### Get Company Overview

```bash
GET /api/fundamental/AAPL/overview
```

**Response:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "description": "Apple Inc. designs, manufactures, and markets...",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "marketCap": 3500000000000,
  "sharesOutstanding": 15882752000,
  "currency": "USD",
  "country": "United States",
  "exchange": "NASDAQ"
}
```

---

## Valuation Metrics

Calculate comprehensive valuation metrics for a stock.

```bash
GET /api/fundamental/AAPL/valuation?currentPrice=195.50
```

**Response:**
```json
{
  "symbol": "AAPL",
  "currentPrice": 195.50,
  "marketCap": 3105000000000,
  "enterpriseValue": 3150000000000,
  "peRatio": 30.44,
  "pbRatio": 45.32,
  "psRatio": 7.94,
  "pegRatio": null,
  "evToEbitda": 23.24,
  "evToSales": 8.05,
  "priceToFreeCashFlow": 28.50,
  "debtToEquity": 1.85,
  "currentRatio": 1.07,
  "quickRatio": 0.98,
  "returnOnEquity": 147.25,
  "returnOnAssets": 22.35,
  "profitMargin": 26.07,
  "operatingMargin": 32.03,
  "dividendYield": 0.45,
  "payoutRatio": 15.20
}
```

**Metrics Explained:**
- **P/E Ratio**: Price-to-Earnings ratio (valuation)
- **P/B Ratio**: Price-to-Book ratio (asset valuation)
- **P/S Ratio**: Price-to-Sales ratio (revenue valuation)
- **EV/EBITDA**: Enterprise Value to EBITDA (operational valuation)
- **ROE**: Return on Equity (profitability %)
- **ROA**: Return on Assets (asset efficiency %)
- **Current Ratio**: Liquidity measure (> 1 is good)
- **Quick Ratio**: Short-term liquidity (> 1 is good)
- **Profit Margin**: Net income / Revenue (%)
- **Operating Margin**: Operating income / Revenue (%)

---

## DCF Analysis

Discounted Cash Flow valuation to determine fair value.

### Calculate DCF

```bash
POST /api/fundamental/AAPL/dcf?currentPrice=195.50
Content-Type: application/json

{
  "symbol": "AAPL",
  "freeCashFlows": [92953000000, 99584000000, 111443000000, 106952000000, 110543000000],
  "projectedGrowthRate": 0.08,
  "terminalGrowthRate": 0.03,
  "discountRate": 0.10,
  "projectionYears": 5,
  "sharesOutstanding": 15882752000
}
```

**Parameters:**
- `freeCashFlows`: Historical FCF values (oldest to newest)
- `projectedGrowthRate`: Expected growth rate (e.g., 0.08 = 8%)
- `terminalGrowthRate`: Long-term growth rate (typically 2-3%)
- `discountRate`: WACC or required rate of return (e.g., 0.10 = 10%)
- `projectionYears`: Number of years to project (default: 5)
- `sharesOutstanding`: Current shares outstanding

**Response:**
```json
{
  "symbol": "AAPL",
  "projectedCashFlows": [119386240000, 128937219200, 139252076736, 150392242875, 162423502225],
  "terminalValue": 5577701576569,
  "presentValueOfCashFlows": 470523450000,
  "presentValueOfTerminalValue": 3462845000000,
  "enterpriseValue": 3933368450000,
  "equityValue": 3968123450000,
  "fairValuePerShare": 249.85,
  "currentPrice": 195.50,
  "upside": 27.81
}
```

**Result Explanation:**
- **Fair Value Per Share**: Calculated intrinsic value
- **Upside**: Percentage difference from current price (27.81% = undervalued)

### Get Historical Free Cash Flows

```bash
GET /api/fundamental/AAPL/free-cash-flows?years=5
```

Returns the last 5 years of free cash flow data.

### Get Historical Growth Rate

```bash
GET /api/fundamental/AAPL/growth-rate?years=5
```

**Response:**
```json
{
  "symbol": "AAPL",
  "years": 5,
  "growthRate": 0.0652,
  "historicalCashFlows": [92953000000, 99584000000, 111443000000, 106952000000, 110543000000]
}
```

The `growthRate` is the CAGR (Compound Annual Growth Rate) of free cash flows.

---

## Scheduled Jobs

### Daily Automatic Fetch Job

The system automatically fetches fundamental data for all active stocks in the watchlist.

**Schedule**: Daily at 2:00 AM

**Configuration:**
- Runs automatically via Spring `@Scheduled` annotation
- Fetches data for stocks where `active = true`
- Only updates stocks that haven't been fetched within their `fetchFrequencyHours` window
- Includes 2-second delay between requests to avoid rate limiting
- Logs success/failure counts

**Job File**: `src/main/kotlin/jp/stocks/job/FundamentalDataFetchJob.kt`

### Testing the Job

To test the job without waiting for 2 AM, uncomment one of these methods in `FundamentalDataFetchJob.kt`:

```kotlin
// Run on startup (30 seconds after application starts)
@Scheduled(initialDelay = 30000, fixedDelay = Long.MAX_VALUE)
fun fetchOnStartup() {
    logger.info("Running initial fundamental data fetch on startup")
    fetchDailyFundamentalData()
}

// Run every hour (for testing)
@Scheduled(cron = "0 0 * * * *")
fun fetchHourly() {
    logger.info("Running hourly fundamental data fetch (test mode)")
    fetchDailyFundamentalData()
}
```

---

## Example Workflow

### 1. Add Stocks to Watchlist

```bash
# Add Apple
POST /api/watchlist
{"symbol": "AAPL", "name": "Apple Inc."}

# Add Microsoft
POST /api/watchlist
{"symbol": "MSFT", "name": "Microsoft Corporation"}
```

### 2. Manually Fetch Data (Optional)

```bash
# Fetch data immediately instead of waiting for scheduled job
POST /api/fundamental/AAPL/fetch
POST /api/fundamental/MSFT/fetch
```

### 3. Retrieve Financial Data

```bash
# Get latest statements
GET /api/fundamental/AAPL/statements/latest

# Get valuation metrics
GET /api/fundamental/AAPL/valuation?currentPrice=195.50
```

### 4. Perform DCF Analysis

```bash
# Get historical cash flows first
GET /api/fundamental/AAPL/free-cash-flows?years=5

# Calculate DCF
POST /api/fundamental/AAPL/dcf?currentPrice=195.50
{
  "symbol": "AAPL",
  "freeCashFlows": [92953000000, 99584000000, 111443000000, 106952000000, 110543000000],
  "projectedGrowthRate": 0.08,
  "terminalGrowthRate": 0.03,
  "discountRate": 0.10,
  "projectionYears": 5,
  "sharesOutstanding": 15882752000
}
```

### 5. Let Scheduled Job Handle Updates

After initial setup, the scheduled job will automatically update all active stocks daily at 2 AM.

---

## Database Schema

### Stock Watchlist Table

```sql
CREATE TABLE stock_watchlist (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_fetched_at TIMESTAMP,
    fetch_frequency_hours INT NOT NULL DEFAULT 24,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Financial Data Tables

- `income_statements` - Revenue, expenses, profit data
- `balance_sheets` - Assets, liabilities, equity
- `cash_flow_statements` - Operating, investing, financing cash flows
- `company_overviews` - Company profile and metadata

---

## Notes

- **Data Source**: Yahoo Finance (free, no API key required)
- **Rate Limiting**: 2-second delay between requests to avoid blocking
- **Default Stocks**: Pre-populated with AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, JPM, V, WMT
- **Frequency**: Default fetch frequency is 24 hours (configurable per stock)
- **Currency**: All financial data is in USD
- **Historical Data**: Yahoo Finance typically provides 3-4 years of annual data

---

## Troubleshooting

### Stock Not Updating

Check if stock is active:
```bash
GET /api/watchlist/AAPL
```

If `active = false`, activate it:
```bash
PUT /api/watchlist/AAPL/activate
```

### No Data Available

Manually fetch data:
```bash
POST /api/fundamental/AAPL/fetch
```

Check application logs for errors.

### Rate Limiting Issues

If Yahoo Finance blocks requests:
- Increase delay in `FundamentalDataFetchJob.kt` (default: 2000ms)
- Reduce number of stocks in watchlist
- Increase `fetchFrequencyHours` to fetch less frequently

---

## Future Enhancements

Potential additions from the [professional investment methods list](professional-investment-methods.md):

- ✅ Fundamental analysis (completed)
- ⏳ Technical analysis (charts, indicators, RSI, MACD)
- ⏳ Quantitative analysis (statistical models, backtesting)
- ⏳ Portfolio management (diversification, asset allocation)
- ⏳ Macro analysis (economic indicators, sector rotation)
- ⏳ ESG analysis (Environmental, Social, Governance scoring)
