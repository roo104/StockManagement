# Growth Stock Screening UI - User Guide

## Overview

The Growth Stock Screening UI provides an intuitive interface to identify and analyze growth stocks using multi-factor fundamental analysis. The tool screens stocks from your watchlist and presents them with visual scores, metrics, and smart flags.

## Accessing the Tool

1. Start your application:
   ```bash
   # Terminal 1 - Backend (Spring Boot)
   ./gradlew bootRun

   # Terminal 2 - Frontend (React)
   cd frontend
   npm start
   ```

2. Navigate to **Growth Screening** in the top navigation menu
3. Or visit directly: `http://localhost:3000/growth-screening`

## UI Components

### 1. Filters Section

**Purpose**: Customize your screening criteria to find specific growth characteristics.

**Available Filters:**
- **Minimum Score** (0-100): Overall growth score threshold
  - Default: 60 (Strong Growth and above)
  - 80+ = High Growth
  - 60-79 = Strong Growth
  - 40-59 = Moderate Growth

- **Min Revenue Growth (%)**: Filter by minimum revenue CAGR
  - Example: Enter "15" for 15% minimum revenue growth

- **Min Earnings Growth (%)**: Filter by minimum earnings CAGR
  - Example: Enter "20" for 20% minimum earnings growth

- **Max P/E Ratio**: Filter by maximum price-to-earnings ratio
  - Example: Enter "35" to exclude expensive valuations

**Actions:**
- **Apply Filters**: Run screening with current filter settings
- **Reset**: Clear all filters and return to defaults

### 2. Summary Stats

Four key metrics displayed at the top:

- **Total Analyzed**: Number of stocks in your watchlist that were screened
- **Results Found**: Number of stocks matching your filter criteria
- **High Growth**: Count of stocks with score ≥ 80 (green)
- **Strong Growth**: Count of stocks with score ≥ 60 (blue)

### 3. Growth Stock Cards

Each card displays comprehensive growth analysis for a stock:

#### Header Section
- **Symbol & Name**: Stock ticker and company name
- **Sector**: Industry classification
- **Overall Score**: Large number (0-100) with color coding:
  - Green (80-100): High Growth
  - Blue (60-79): Strong Growth
  - Yellow (40-59): Moderate Growth
  - Red (<40): Low/No Growth
- **Category Badge**: HIGH_GROWTH, STRONG_GROWTH, etc.

#### Score Breakdown
Five individual component scores (0-100):
- **Revenue**: Revenue growth score
- **Earnings**: Earnings growth score
- **Cash Flow**: Free cash flow and valuation score
- **Profit**: Profitability and margin score
- **Efficiency**: ROE and ROA score

Color-coded to show strength in each dimension.

#### Growth Metrics
Key financial metrics with actual values:
- **Revenue Growth**: CAGR percentage
- **Earnings Growth**: Net income CAGR
- **FCF Growth**: Free cash flow CAGR
- **Gross Margin**: Latest gross margin with trend indicator
  - 📈 IMPROVING
  - ➡️ STABLE
  - 📉 DECLINING
- **P/E Ratio**: Price-to-earnings valuation
- **PEG Ratio**: P/E relative to growth (< 1.5 is attractive)
- **ROE**: Return on equity
- **Market Cap**: Company size (T = Trillion, B = Billion, M = Million)

#### Smart Flags
Automatically generated insights:
- 🚀 Exceptional revenue growth (25%+)
- 💰 Exceptional earnings growth (25%+)
- 📈 Improving margins
- ⚡ High ROE (20%+)
- 💎 Strong pricing power (50%+ gross margin)
- 💵 Reasonable valuation (PEG ≤ 1.5)
- 🏆 Top growth candidate (score ≥ 80)
- ⚠️ Warning flags for declining metrics or high valuations

## Example Use Cases

### 1. Find Top Growth Stocks
**Goal**: Find the best overall growth candidates

**Steps:**
1. Set **Minimum Score** to 80
2. Click **Apply Filters**
3. Review high-scoring stocks
4. Look for 🏆 "Top growth candidate" flag

### 2. Find Undervalued Growth Stocks
**Goal**: Growth stocks at reasonable valuations

**Steps:**
1. Set **Minimum Score** to 60
2. Set **Max P/E Ratio** to 25
3. Click **Apply Filters**
4. Look for 💵 "Reasonable valuation" flag

### 3. Find High Revenue Growth Companies
**Goal**: Companies with explosive sales growth

**Steps:**
1. Set **Min Revenue Growth** to 25
2. Leave other filters open
3. Click **Apply Filters**
4. Look for 🚀 "Exceptional revenue growth" flag

### 4. Screen for Quality Growth
**Goal**: Sustainable, profitable growth

**Steps:**
1. Set **Minimum Score** to 70
2. Set **Min Revenue Growth** to 15
3. Set **Min Earnings Growth** to 15
4. Click **Apply Filters**
5. Look for stocks with:
   - 📈 Improving margins
   - 💎 Strong pricing power
   - High profitability scores

## Interpreting Results

### Score Analysis

**Overall Score 90+**: Exceptional across all dimensions
- Very strong revenue and earnings growth
- Healthy cash flow generation
- Improving or high margins
- Efficient capital use
- Often marked with 🏆 flag

**Overall Score 70-89**: Strong growth profile
- Good growth in most areas
- Solid fundamentals
- May have one weaker dimension
- Good investment candidates

**Overall Score 50-69**: Moderate growth
- Mixed results across dimensions
- Some growth but not exceptional
- Requires deeper analysis
- May be improving or declining

**Overall Score < 50**: Limited growth characteristics
- Weak or negative growth
- Consider other strategies
- May be value or turnaround play

### Component Score Analysis

Look at the breakdown to understand strengths:
- **High Revenue + High Earnings**: Core growth story
- **High Cash Flow + Low Valuation**: Undervalued gem
- **High Profitability**: Quality business
- **High Efficiency**: Well-managed company

### Flag Interpretation

**Multiple Positive Flags**: Strong conviction candidate
- 🚀 + 💰 + 💵 = Fast growth at fair price
- 💎 + 📈 + ⚡ = High-quality business improving

**Mixed Flags**: Requires analysis
- Strong growth but ⚠️ high valuation = Proceed with caution
- Strong fundamentals but ⚠️ declining margins = Monitor closely

**Warning Flags**: Red flags to investigate
- ⚠️ Declining revenue/earnings = Growth stalling
- ⚠️ Declining margins = Competitive pressure
- ⚠️ High valuation (PEG > 3.0) = Expensive

## Tips for Best Results

1. **Start Broad, Then Narrow**:
   - Begin with default filters to see all candidates
   - Gradually increase requirements to find best fits

2. **Check Multiple Dimensions**:
   - Don't rely solely on overall score
   - Look at component scores for balanced growth
   - Review actual growth percentages

3. **Watch the Trends**:
   - Prefer 📈 IMPROVING margins over 📉 DECLINING
   - Look for consistent growth across multiple metrics

4. **Consider Valuation Context**:
   - High growth deserves premium valuation
   - But PEG > 3.0 may be too expensive
   - Compare similar companies in same sector

5. **Use Flags as Guides**:
   - 🏆 Top growth candidate = Start here
   - ⚠️ Warnings = Investigate before investing
   - Multiple positive flags = Higher conviction

6. **Combine with Other Analysis**:
   - Use with DCF analysis (in Fundamental Analysis page)
   - Review full financial statements
   - Check news and recent developments

## Data Refresh

- UI loads current data on page load
- Click **Apply Filters** to refresh after changes
- Backend data updates daily at 2 AM (configurable)
- Add stocks to watchlist first to include in screening

## Troubleshooting

**No results found:**
- Check if stocks are in watchlist (`/watchlist` page)
- Ensure stocks have been fetched (API: POST `/api/fundamental/{SYMBOL}/fetch`)
- Relax filter criteria (lower minimum score)
- Check that stocks have at least 2 years of financial data

**Errors loading:**
- Verify backend is running (port 8080)
- Check browser console for API errors
- Ensure database has financial data

**Missing metrics:**
- Some stocks may not have complete data
- "N/A" displayed when data unavailable
- Requires 2-5 years of financial statements for accurate scores

## Keyboard Shortcuts

- **Tab**: Navigate between filter fields
- **Enter**: Apply filters (when focused on input)

## Mobile Experience

The UI is responsive and works on mobile devices:
- Cards stack vertically
- Filters display in single column
- Metrics adapt to smaller screens
- Touch-friendly interface

## Next Steps After Screening

1. **Review Detailed Analysis**: Click through to Fundamental Analysis page
2. **Run DCF Valuation**: Calculate intrinsic value
3. **Add to Personal Watchlist**: Track over time
4. **Monitor Quarterly**: Re-screen after earnings
5. **Compare Peers**: Screen by sector to compare similar companies

---

**Pro Tip**: Bookmark specific filter combinations by saving the URL after applying filters (once query params are added in future version).

## Future Enhancements Coming Soon

- Export results to CSV/Excel
- Save filter presets
- Historical score tracking
- Score change alerts
- Comparison view (side-by-side)
- Sector heatmap visualization
- Custom scoring weights
- Integration with charting tools

Enjoy finding your next growth stock! 🚀
