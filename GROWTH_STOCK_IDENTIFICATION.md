# Growth Stock Identification Tool

## Overview

This tool identifies upcoming growth stocks using a multi-factor scoring model that analyzes fundamental financial data. It calculates a comprehensive growth score (0-100) based on revenue growth, earnings growth, cash flow, profitability, and efficiency metrics.

## Quick Start

### Get Top Growth Stocks

```bash
# Get top 10 growth stocks
GET /api/growth-screening/top?limit=10

# Get only high growth stocks (score >= 80)
GET /api/growth-screening/high-growth

# Get all stocks with minimum score filter
GET /api/growth-screening?minScore=60
```

### Analyze a Specific Stock

```bash
GET /api/growth-screening/AAPL
```

### Screen with Custom Filters

```bash
POST /api/growth-screening
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "GOOGL"],
  "minScore": 60,
  "minRevenueGrowth": 0.15,
  "minEarningsGrowth": 0.20,
  "sectors": ["Technology"],
  "maxPeRatio": 35
}
```

## How It Works

### Multi-Factor Scoring Model

The tool analyzes stocks across 5 key dimensions:

1. **Revenue Growth Score (25% weight)**
   - Calculates CAGR from historical revenue data
   - 30%+ growth = 100 points
   - 20-30% growth = 85 points
   - 15-20% growth = 70 points
   - 10-15% growth = 55 points
   - 5-10% growth = 35 points

2. **Earnings Growth Score (25% weight)**
   - Calculates CAGR from net income
   - Same scoring thresholds as revenue growth

3. **Cash Flow Score (20% weight)**
   - Free cash flow growth rate
   - Price-to-FCF ratio for valuation context
   - Rewards strong cash generation with reasonable valuation

4. **Profitability Score (15% weight)**
   - Gross margin (>60% is excellent)
   - Profit margin (>25% is excellent)
   - Margin trend (improving, stable, declining)

5. **Efficiency Score (15% weight)**
   - Return on Equity (ROE > 25% is excellent)
   - Return on Assets (ROA > 15% is excellent)

### Growth Categories

- **HIGH_GROWTH**: Score >= 80
- **STRONG_GROWTH**: Score >= 60
- **MODERATE_GROWTH**: Score >= 40
- **LOW_GROWTH**: Score >= 20
- **NO_GROWTH**: Score < 20

### Smart Flags

The tool automatically generates flags to highlight key characteristics:

**Positive Flags:**
- 🚀 Exceptional revenue growth (25%+)
- 💰 Exceptional earnings growth (25%+)
- 📈 Improving margins
- ⚡ High ROE (20%+)
- 💎 Strong pricing power (50%+ gross margin)
- 💵 Reasonable valuation (PEG ≤ 1.5)
- 🏆 Top growth candidate (overall score >= 80)

**Warning Flags:**
- ⚠️ Declining revenue
- ⚠️ Declining earnings
- ⚠️ Declining margins
- ⚠️ High valuation (PEG > 3.0)

## API Reference

### Endpoints

#### 1. Screen All Active Stocks

```bash
GET /api/growth-screening
```

**Query Parameters:**
- `minScore` (optional): Minimum overall score (0-100)
- `minRevenueGrowth` (optional): Minimum revenue growth rate (e.g., 0.15 for 15%)
- `minEarningsGrowth` (optional): Minimum earnings growth rate
- `sectors` (optional): Filter by sectors (comma-separated)
- `maxPeRatio` (optional): Maximum P/E ratio

**Response:**
```json
{
  "totalAnalyzed": 50,
  "resultsCount": 12,
  "topGrowthStocks": [
    {
      "symbol": "NVDA",
      "name": "NVIDIA Corporation",
      "sector": "Technology",
      "industry": "Semiconductors",
      "growthMetrics": {
        "symbol": "NVDA",
        "revenueGrowthRate": 0.4521,
        "earningsGrowthRate": 0.5832,
        "freeCashFlowGrowthRate": 0.3912,
        "epsGrowthRate": 0.5945,
        "grossMargin": 0.6850,
        "grossMarginTrend": "IMPROVING",
        "operatingMarginTrend": "IMPROVING",
        "yearsOfData": 4
      },
      "currentPrice": 485.50,
      "marketCap": 1200000000000,
      "peRatio": 68.25,
      "pegRatio": 1.17,
      "profitMargin": 0.3250,
      "roe": 0.4521,
      "revenueGrowthScore": 100,
      "earningsGrowthScore": 100,
      "cashFlowScore": 85,
      "profitabilityScore": 100,
      "efficiencyScore": 100,
      "overallScore": 97,
      "growthCategory": "HIGH_GROWTH",
      "flags": [
        "🚀 Exceptional revenue growth (25%+)",
        "💰 Exceptional earnings growth (25%+)",
        "📈 Improving margins",
        "⚡ High ROE (20%+)",
        "💎 Strong pricing power (50%+ gross margin)",
        "💵 Reasonable valuation (PEG ≤ 1.5)",
        "🏆 Top growth candidate"
      ]
    }
  ]
}
```

#### 2. Screen Specific Stocks

```bash
POST /api/growth-screening
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "GOOGL", "AMZN"],
  "minScore": 60
}
```

#### 3. Get Growth Score for Single Stock

```bash
GET /api/growth-screening/{symbol}
```

Returns detailed growth analysis for a single stock.

#### 4. Get Top N Growth Stocks

```bash
GET /api/growth-screening/top?limit=10&minScore=60
```

Returns the top N stocks sorted by overall score.

#### 5. Get High Growth Stocks Only

```bash
GET /api/growth-screening/high-growth
```

Returns only stocks with score >= 80.

## Example Use Cases

### 1. Find All High-Growth Tech Stocks

```bash
POST /api/growth-screening
Content-Type: application/json

{
  "sectors": ["Technology"],
  "minScore": 70,
  "minRevenueGrowth": 0.20
}
```

### 2. Find Undervalued Growth Stocks

```bash
GET /api/growth-screening?minScore=65&maxPeRatio=25
```

### 3. Compare Multiple Stocks

```bash
POST /api/growth-screening
Content-Type: application/json

{
  "symbols": ["NVDA", "AMD", "INTC", "TSM"],
  "minScore": 0
}
```

## Integration with Existing Features

The growth screening tool leverages your existing fundamental analysis infrastructure:

- Uses data from `income_statements`, `balance_sheets`, and `cash_flow_statements` tables
- Integrates with `ValuationMetricsService` for P/E, ROE, ROA calculations
- Works with your existing watchlist for automatic screening
- Requires the same data that's already being fetched by your daily job

## Data Requirements

To calculate growth scores, the tool requires:

- **Minimum**: 2 years of financial statement data
- **Recommended**: 3-5 years for more accurate trend analysis
- Data must include:
  - Income statements (revenue, net income, EPS)
  - Balance sheets (for ROE, ROA calculations)
  - Cash flow statements (for FCF analysis)

## Limitations

- **Historical Data Only**: Based on past performance, not predictive
- **Data Availability**: Requires at least 2 years of financial data
- **Valuation Context**: PEG ratios and valuations provide context but aren't predictive
- **Sector Differences**: Different sectors naturally have different growth rates
- **Quality Metrics**: Doesn't account for qualitative factors (management, competitive moat, etc.)

## Future Enhancements

See [GROWTH_STOCK_FUTURE_IDEAS.md](GROWTH_STOCK_FUTURE_IDEAS.md) for planned improvements.

## Testing

### 1. Add Test Data

Make sure your watchlist has stocks with historical data:

```bash
POST /api/watchlist
{"symbol": "NVDA", "name": "NVIDIA Corporation"}

POST /api/fundamental/NVDA/fetch
```

### 2. Run Screening

```bash
GET /api/growth-screening/NVDA
```

### 3. Compare Results

```bash
GET /api/growth-screening/top?limit=10
```

## Interpreting Results

### High Score (80-100)
- Strong across all dimensions
- Consistent growth in revenue and earnings
- Healthy margins and improving trends
- Strong cash flow generation
- Good capital efficiency

### Strong Score (60-79)
- Good growth in most areas
- May have one weaker dimension
- Still attractive for growth investors
- Consider valuation context

### Moderate Score (40-59)
- Mixed results across dimensions
- May have declining metrics in some areas
- Requires deeper analysis
- Could be turnaround candidate

### Low Score (<40)
- Weak growth profile
- Multiple concerning metrics
- May not be suitable for growth investing
- Consider value or other strategies

## Best Practices

1. **Use Filters**: Combine multiple filters to narrow results
2. **Check Flags**: Pay attention to warning flags
3. **Validate Valuation**: High growth doesn't always justify high P/E
4. **Compare Peers**: Compare stocks within the same sector
5. **Track Over Time**: Monitor how scores change over quarters
6. **Combine Strategies**: Use with DCF analysis and other fundamental tools
7. **Consider Context**: Review the complete financial statements, not just the score

---

**Note**: This tool identifies characteristics of growth stocks based on historical financial performance. It should be used as one input among many in your investment research process. Always perform comprehensive due diligence before making investment decisions.
