import React, {useEffect, useState} from 'react';
import {fundamentalService} from '../../api/fundamentalService';
import {BalanceSheet, CashFlowStatement, CompanyOverview, FinancialStatements, IncomeStatement, ValuationMetrics,} from '../../types/FundamentalAnalysis';
import ErrorMessage from '../../components/common/ErrorMessage';
import './FundamentalAnalysisPage.css';

const FundamentalAnalysisPage: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'statements' | 'valuation' | 'history'>('overview');

  const [companyOverview, setCompanyOverview] = useState<CompanyOverview | null>(null);
  const [financialStatements, setFinancialStatements] = useState<FinancialStatements | null>(null);
  const [valuationMetrics, setValuationMetrics] = useState<ValuationMetrics | null>(null);
  const [incomeStatements, setIncomeStatements] = useState<IncomeStatement[]>([]);
  const [balanceSheets, setBalanceSheets] = useState<BalanceSheet[]>([]);
  const [cashFlowStatements, setCashFlowStatements] = useState<CashFlowStatement[]>([]);

  const fetchAllData = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch company overview
      const overview = await fundamentalService.getCompanyOverview(symbol);
      setCompanyOverview(overview);

      // Fetch latest financial statements
      const statements = await fundamentalService.getLatestFinancialStatements(symbol);
      setFinancialStatements(statements);

      // Fetch valuation metrics (using market cap as current price approximation)
      const currentPrice = overview.marketCap / overview.sharesOutstanding;
      const valuation = await fundamentalService.getValuationMetrics(symbol, currentPrice);
      setValuationMetrics(valuation);

      // Fetch historical data
      const incomeHistory = await fundamentalService.getIncomeStatements(symbol);
      setIncomeStatements(incomeHistory);

      const balanceHistory = await fundamentalService.getBalanceSheets(symbol);
      setBalanceSheets(balanceHistory);

      const cashFlowHistory = await fundamentalService.getCashFlowStatements(symbol);
      setCashFlowStatements(cashFlowHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      console.error('Error fetching fundamental data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataFromYahoo = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await fundamentalService.fetchFundamentalData(symbol);
      if (result.success) {
        // Refresh data after successful fetch
        await fetchAllData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data from Yahoo Finance';
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('authentication')) {
        setError('⚠️ Yahoo Finance API requires authentication tokens. The free API endpoint is restricted. You can: (1) Use the manual data entry endpoints in the API docs, or (2) Integrate a paid provider like Alpha Vantage, Financial Modeling Prep, or Polygon.io.');
      } else {
        setError(errorMsg);
      }
      console.error('Error fetching from Yahoo:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value: number | undefined, currency: string = 'USD') => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | undefined, decimals: number = 2) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fundamental-analysis-page">
      <h1>Fundamental Analysis</h1>

      <div className="controls">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol"
          className="symbol-input"
        />
        <button onClick={fetchAllData} disabled={loading} className="fetch-button">
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        <button onClick={fetchDataFromYahoo} disabled={loading} className="fetch-yahoo-button">
          Fetch from Yahoo Finance
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading && <div className="loading">Loading fundamental data...</div>}

      {!loading && companyOverview && (
        <>
          <div className="company-header">
            <h2>{companyOverview.name} ({companyOverview.symbol})</h2>
            <div className="company-info">
              {companyOverview.sector && <span className="badge">{companyOverview.sector}</span>}
              {companyOverview.industry && <span className="badge">{companyOverview.industry}</span>}
              {companyOverview.exchange && <span className="badge">{companyOverview.exchange}</span>}
            </div>
          </div>

          <div className="tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'statements' ? 'active' : ''}
              onClick={() => setActiveTab('statements')}
            >
              Financial Statements
            </button>
            <button
              className={activeTab === 'valuation' ? 'active' : ''}
              onClick={() => setActiveTab('valuation')}
            >
              Valuation Metrics
            </button>
            <button
              className={activeTab === 'history' ? 'active' : ''}
              onClick={() => setActiveTab('history')}
            >
              Historical Data
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="card">
                  <h3>Company Information</h3>
                  {companyOverview.description && (
                    <p className="description">{companyOverview.description}</p>
                  )}
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Market Cap:</span>
                      <span className="value">{formatCurrency(companyOverview.marketCap, companyOverview.currency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Shares Outstanding:</span>
                      <span className="value">{companyOverview.sharesOutstanding.toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Country:</span>
                      <span className="value">{companyOverview.country || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Currency:</span>
                      <span className="value">{companyOverview.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statements' && financialStatements && (
              <div className="statements-section">
                <div className="card">
                  <h3>Income Statement</h3>
                  <div className="statement-date">
                    As of {formatDate(financialStatements.incomeStatement.fiscalDateEnding)}
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Total Revenue:</span>
                      <span className="value">{formatCurrency(financialStatements.incomeStatement.totalRevenue, financialStatements.incomeStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Gross Profit:</span>
                      <span className="value">{formatCurrency(financialStatements.incomeStatement.grossProfit, financialStatements.incomeStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Operating Income:</span>
                      <span className="value">{formatCurrency(financialStatements.incomeStatement.operatingIncome, financialStatements.incomeStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Net Income:</span>
                      <span className="value">{formatCurrency(financialStatements.incomeStatement.netIncome, financialStatements.incomeStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">EBITDA:</span>
                      <span className="value">{formatCurrency(financialStatements.incomeStatement.ebitda, financialStatements.incomeStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">EPS:</span>
                      <span className="value">{formatNumber(financialStatements.incomeStatement.eps)}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Balance Sheet</h3>
                  <div className="statement-date">
                    As of {formatDate(financialStatements.balanceSheet.fiscalDateEnding)}
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Total Assets:</span>
                      <span className="value">{formatCurrency(financialStatements.balanceSheet.totalAssets, financialStatements.balanceSheet.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Total Liabilities:</span>
                      <span className="value">{formatCurrency(financialStatements.balanceSheet.totalLiabilities, financialStatements.balanceSheet.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Shareholder Equity:</span>
                      <span className="value">{formatCurrency(financialStatements.balanceSheet.totalShareholderEquity, financialStatements.balanceSheet.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Cash & Equivalents:</span>
                      <span className="value">{formatCurrency(financialStatements.balanceSheet.cashAndCashEquivalents, financialStatements.balanceSheet.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Long Term Debt:</span>
                      <span className="value">{formatCurrency(financialStatements.balanceSheet.longTermDebt, financialStatements.balanceSheet.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Short Term Debt:</span>
                      <span className="value">{formatCurrency(financialStatements.balanceSheet.shortTermDebt, financialStatements.balanceSheet.reportedCurrency)}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Cash Flow Statement</h3>
                  <div className="statement-date">
                    As of {formatDate(financialStatements.cashFlowStatement.fiscalDateEnding)}
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Operating Cash Flow:</span>
                      <span className="value">{formatCurrency(financialStatements.cashFlowStatement.operatingCashflow, financialStatements.cashFlowStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Capital Expenditures:</span>
                      <span className="value">{formatCurrency(financialStatements.cashFlowStatement.capitalExpenditures, financialStatements.cashFlowStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Free Cash Flow:</span>
                      <span className="value">{formatCurrency(financialStatements.cashFlowStatement.freeCashFlow, financialStatements.cashFlowStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Cash Flow from Investment:</span>
                      <span className="value">{formatCurrency(financialStatements.cashFlowStatement.cashflowFromInvestment, financialStatements.cashFlowStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Cash Flow from Financing:</span>
                      <span className="value">{formatCurrency(financialStatements.cashFlowStatement.cashflowFromFinancing, financialStatements.cashFlowStatement.reportedCurrency)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Net Change in Cash:</span>
                      <span className="value">{formatCurrency(financialStatements.cashFlowStatement.netChangeInCash, financialStatements.cashFlowStatement.reportedCurrency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'valuation' && valuationMetrics && (
              <div className="valuation-section">
                <div className="card">
                  <h3>Valuation Ratios</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Current Price:</span>
                      <span className="value">{formatCurrency(valuationMetrics.currentPrice)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Market Cap:</span>
                      <span className="value">{formatCurrency(valuationMetrics.marketCap)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Enterprise Value:</span>
                      <span className="value">{formatCurrency(valuationMetrics.enterpriseValue)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">P/E Ratio:</span>
                      <span className="value">{formatNumber(valuationMetrics.peRatio)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">P/B Ratio:</span>
                      <span className="value">{formatNumber(valuationMetrics.pbRatio)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">P/S Ratio:</span>
                      <span className="value">{formatNumber(valuationMetrics.psRatio)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">PEG Ratio:</span>
                      <span className="value">{formatNumber(valuationMetrics.pegRatio)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">EV/EBITDA:</span>
                      <span className="value">{formatNumber(valuationMetrics.evToEbitda)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Price to FCF:</span>
                      <span className="value">{formatNumber(valuationMetrics.priceToFreeCashFlow)}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Financial Health</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Debt to Equity:</span>
                      <span className="value">{formatNumber(valuationMetrics.debtToEquity)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Current Ratio:</span>
                      <span className="value">{formatNumber(valuationMetrics.currentRatio)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Quick Ratio:</span>
                      <span className="value">{formatNumber(valuationMetrics.quickRatio)}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Profitability</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">ROE:</span>
                      <span className="value">{formatPercent(valuationMetrics.returnOnEquity)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">ROA:</span>
                      <span className="value">{formatPercent(valuationMetrics.returnOnAssets)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Profit Margin:</span>
                      <span className="value">{formatPercent(valuationMetrics.profitMargin)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Operating Margin:</span>
                      <span className="value">{formatPercent(valuationMetrics.operatingMargin)}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Dividends</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Dividend Yield:</span>
                      <span className="value">{formatPercent(valuationMetrics.dividendYield)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Payout Ratio:</span>
                      <span className="value">{formatPercent(valuationMetrics.payoutRatio)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-section">
                {incomeStatements.length > 0 && (
                  <div className="card">
                    <h3>Income Statement History</h3>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Revenue</th>
                            <th>Gross Profit</th>
                            <th>Operating Income</th>
                            <th>Net Income</th>
                            <th>EPS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomeStatements.map((stmt, idx) => (
                            <tr key={idx}>
                              <td>{formatDate(stmt.fiscalDateEnding)}</td>
                              <td>{formatCurrency(stmt.totalRevenue, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.grossProfit, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.operatingIncome, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.netIncome, stmt.reportedCurrency)}</td>
                              <td>{formatNumber(stmt.eps)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {balanceSheets.length > 0 && (
                  <div className="card">
                    <h3>Balance Sheet History</h3>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Total Assets</th>
                            <th>Total Liabilities</th>
                            <th>Shareholder Equity</th>
                            <th>Cash</th>
                            <th>Long Term Debt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {balanceSheets.map((stmt, idx) => (
                            <tr key={idx}>
                              <td>{formatDate(stmt.fiscalDateEnding)}</td>
                              <td>{formatCurrency(stmt.totalAssets, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.totalLiabilities, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.totalShareholderEquity, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.cashAndCashEquivalents, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.longTermDebt, stmt.reportedCurrency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {cashFlowStatements.length > 0 && (
                  <div className="card">
                    <h3>Cash Flow Statement History</h3>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Operating Cash Flow</th>
                            <th>CapEx</th>
                            <th>Free Cash Flow</th>
                            <th>Cash from Investing</th>
                            <th>Cash from Financing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cashFlowStatements.map((stmt, idx) => (
                            <tr key={idx}>
                              <td>{formatDate(stmt.fiscalDateEnding)}</td>
                              <td>{formatCurrency(stmt.operatingCashflow, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.capitalExpenditures, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.freeCashFlow, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.cashflowFromInvestment, stmt.reportedCurrency)}</td>
                              <td>{formatCurrency(stmt.cashflowFromFinancing, stmt.reportedCurrency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FundamentalAnalysisPage;
