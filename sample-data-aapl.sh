#!/bin/bash

# Sample data population script for AAPL
# Run this to populate the database with sample fundamental data

BASE_URL="http://localhost:8080/api/fundamental/AAPL"

echo "Populating sample fundamental data for AAPL..."

# Company Overview
echo "1. Creating company overview..."
curl -X POST "$BASE_URL/overview" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
    "sector": "Technology",
    "industry": "Consumer Electronics",
    "marketCap": 3500000000000,
    "sharesOutstanding": 15882752000,
    "currency": "USD",
    "country": "United States",
    "exchange": "NASDAQ"
  }'

echo -e "\n"

# Income Statement
echo "2. Creating income statement..."
curl -X POST "$BASE_URL/income-statement" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "fiscalDateEnding": "2024-09-30",
    "reportedCurrency": "USD",
    "totalRevenue": 391035000000,
    "costOfRevenue": 210352000000,
    "grossProfit": 180683000000,
    "operatingExpenses": 55433000000,
    "operatingIncome": 125250000000,
    "interestExpense": 3500000000,
    "incomeBeforeTax": 125150000000,
    "incomeTaxExpense": 23194000000,
    "netIncome": 101956000000,
    "ebitda": 135564000000,
    "eps": 6.42,
    "weightedAverageShares": 15882752000
  }'

echo -e "\n"

# Balance Sheet
echo "3. Creating balance sheet..."
curl -X POST "$BASE_URL/balance-sheet" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "fiscalDateEnding": "2024-09-30",
    "reportedCurrency": "USD",
    "totalAssets": 365725000000,
    "totalCurrentAssets": 143566000000,
    "cashAndCashEquivalents": 67150000000,
    "inventory": 6511000000,
    "totalNonCurrentAssets": 222159000000,
    "propertyPlantEquipment": 45680000000,
    "totalLiabilities": 308030000000,
    "totalCurrentLiabilities": 125481000000,
    "totalNonCurrentLiabilities": 182549000000,
    "longTermDebt": 106000000000,
    "shortTermDebt": 15000000000,
    "totalShareholderEquity": 57695000000,
    "retainedEarnings": 29000000000,
    "commonStock": 77000000000
  }'

echo -e "\n"

# Cash Flow Statement
echo "4. Creating cash flow statement..."
curl -X POST "$BASE_URL/cash-flow-statement" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "fiscalDateEnding": "2024-09-30",
    "reportedCurrency": "USD",
    "operatingCashflow": 122151000000,
    "capitalExpenditures": -11608000000,
    "freeCashFlow": 110543000000,
    "cashflowFromInvestment": -10000000000,
    "cashflowFromFinancing": -97000000000,
    "dividendPayout": 15000000000,
    "netChangeInCash": 15000000000
  }'

echo -e "\n\n=== Sample data created successfully! ==="
echo "You can now view fundamental analysis for AAPL in the UI"
echo "Visit: http://localhost:3000/fundamental"
