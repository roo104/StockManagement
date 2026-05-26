import * as React from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {Download, RefreshCw, Search, AlertTriangle} from 'lucide-react';
import {fundamentalService} from '@/api/fundamentalService';
import {stockService} from '@/api/stockService';
import {
    BalanceSheet,
    CashFlowStatement,
    CompanyOverview,
    FinancialStatements,
    IncomeStatement,
    ValuationMetrics,
} from '@/types/FundamentalAnalysis';
import {OhlcData} from '@/types/OhlcData';
import StockChart from '@/components/charts/StockChart';
import {formatCurrency, formatDate, formatNumber, formatPercent} from '@/utils/formatters';
import {pushRecentSymbol} from '@/lib/recent-symbols';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Skeleton} from '@/components/ui/skeleton';
import {EmptyState} from '@/components/ui/empty-state';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {toast} from '@/components/ui/toaster';

interface MetricRowProps {
    label: string;
    value: React.ReactNode;
}

function MetricRow({label, value}: MetricRowProps) {
    return (
        <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--color-border-soft)] py-2 last:border-0">
            <span className="text-sm text-[color:var(--color-fg-muted)]">{label}</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-[color:var(--color-fg)]">
        {value}
      </span>
        </div>
    );
}

const PERIODS = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'];
const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo'];

export default function FundamentalAnalysisPage() {
    const {symbol: pathSymbol} = useParams<{ symbol?: string }>();
  const [searchParams] = useSearchParams();
    const querySymbol = searchParams.get('symbol');
    const navigate = useNavigate();

    const initialSymbol = (pathSymbol ?? querySymbol ?? 'AAPL').toUpperCase();
    const [symbol, setSymbol] = React.useState(initialSymbol);
    const [input, setInput] = React.useState(initialSymbol);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const [companyOverview, setCompanyOverview] = React.useState<CompanyOverview | null>(null);
    const [financialStatements, setFinancialStatements] = React.useState<FinancialStatements | null>(null);
    const [valuationMetrics, setValuationMetrics] = React.useState<ValuationMetrics | null>(null);
    const [incomeStatements, setIncomeStatements] = React.useState<IncomeStatement[]>([]);
    const [balanceSheets, setBalanceSheets] = React.useState<BalanceSheet[]>([]);
    const [cashFlowStatements, setCashFlowStatements] = React.useState<CashFlowStatement[]>([]);

    const [tab, setTab] = React.useState<'overview' | 'statements' | 'valuation' | 'history' | 'chart'>('overview');
    const [ohlcData, setOhlcData] = React.useState<OhlcData[]>([]);
    const [chartLoaded, setChartLoaded] = React.useState(false);
    const [chartLoading, setChartLoading] = React.useState(false);
    const [chartPeriod, setChartPeriod] = React.useState('1y');
    const [chartInterval, setChartInterval] = React.useState('1d');

    React.useEffect(() => {
        const next = (pathSymbol ?? querySymbol ?? '').toUpperCase();
        if (next && next !== symbol) {
            setSymbol(next);
            setInput(next);
    }
    }, [pathSymbol, querySymbol]);

    const fetchAllData = React.useCallback(async (sym: string) => {
        if (!sym.trim()) return;
    setLoading(true);
    setError('');
    try {
        const overview = await fundamentalService.getCompanyOverview(sym);
      setCompanyOverview(overview);
        const statements = await fundamentalService.getLatestFinancialStatements(sym);
      setFinancialStatements(statements);
      const currentPrice = overview.marketCap / overview.sharesOutstanding;
        const valuation = await fundamentalService.getValuationMetrics(sym, currentPrice);
      setValuationMetrics(valuation);
        const incomeHistory = await fundamentalService.getIncomeStatements(sym);
      setIncomeStatements(incomeHistory);
        const balanceHistory = await fundamentalService.getBalanceSheets(sym);
      setBalanceSheets(balanceHistory);
        const cashFlowHistory = await fundamentalService.getCashFlowStatements(sym);
      setCashFlowStatements(cashFlowHistory);
        pushRecentSymbol(sym);
    } catch (err) {
        setError(`No data found for ${sym}. Try "Fetch from provider" below.`);
        console.error(err);
        setCompanyOverview(null);
        setFinancialStatements(null);
        setValuationMetrics(null);
        setIncomeStatements([]);
        setBalanceSheets([]);
        setCashFlowStatements([]);
    } finally {
      setLoading(false);
    }
    }, []);

    React.useEffect(() => {
        void fetchAllData(symbol);
        setChartLoaded(false);
        setOhlcData([]);
    }, [symbol, fetchAllData]);

    const fetchChartData = React.useCallback(async () => {
        if (!symbol) return;
        setChartLoading(true);
        try {
            const data = await stockService.getOhlcData({symbol, period: chartPeriod, interval: chartInterval});
            setOhlcData(data);
            setChartLoaded(true);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load chart data');
        } finally {
            setChartLoading(false);
    }
    }, [symbol, chartPeriod, chartInterval]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const next = input.trim().toUpperCase();
        if (!next) return;
        navigate(`/analysis/${encodeURIComponent(next)}`);
    };

    const handleProviderFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fundamentalService.fetchFundamentalData(symbol);
      if (result.success) {
          toast.success(`Fetched ${symbol} from provider`);
          await fetchAllData(symbol);
      } else {
        setError(result.message);
      }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch from provider';
        setError(
            msg.includes('401') || msg.toLowerCase().includes('unauthorized')
                ? 'Provider requires authentication. Configure a paid provider (Alpha Vantage, FMP, Polygon).'
                : msg
        );
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const onTabChange = (value: string) => {
        setTab(value as typeof tab);
        if (value === 'chart' && !chartLoaded) void fetchChartData();
  };

  return (
      <div className="space-y-6">
          <header className="space-y-4">
              <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Fundamental Analysis</h1>
                  <p className="text-sm text-[color:var(--color-fg-muted)]">
                      Company overview, financial statements, valuation, and price history.
                  </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative sm:max-w-xs flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-subtle)]"/>
                      <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value.toUpperCase())}
                          placeholder="Symbol (e.g. AAPL)"
                          className="pl-9 font-mono"
                          aria-label="Stock symbol"
                      />
                  </div>
                  <Button type="submit" disabled={loading || !input.trim()}>
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                      Load
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleProviderFetch} disabled={loading}>
                      <Download className="h-4 w-4"/>
                      Fetch from provider
                  </Button>
              </form>
          </header>

          {error && (
              <Card className="border-[rgba(244,63,94,0.4)] bg-[rgba(244,63,94,0.06)]">
                  <CardContent className="flex items-start gap-3 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-danger)]"/>
                      <p className="text-sm text-[color:var(--color-fg)]">{error}</p>
                  </CardContent>
              </Card>
          )}

          {loading && !companyOverview ? (
              <div className="space-y-4">
                  <Skeleton className="h-20 w-full"/>
                  <Skeleton className="h-10 w-64"/>
                  <div className="grid gap-4 md:grid-cols-2">
                      <Skeleton className="h-64 w-full"/>
                      <Skeleton className="h-64 w-full"/>
          </div>
              </div>
          ) : !companyOverview ? (
              <EmptyState
                  icon={<Search/>}
                  title="No data loaded"
                  description="Enter a ticker above or use the command palette (⌘K)."
              />
          ) : (
              <>
                  <Card>
                      <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                              <div className="flex items-baseline gap-3">
                                  <h2 className="font-mono text-2xl font-bold tracking-tight">
                                      {companyOverview.symbol}
                                  </h2>
                                  <span className="text-base text-[color:var(--color-fg-muted)]">
                    {companyOverview.name}
                  </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                  {companyOverview.sector && <Badge variant="outline">{companyOverview.sector}</Badge>}
                                  {companyOverview.industry && <Badge variant="outline">{companyOverview.industry}</Badge>}
                                  {companyOverview.exchange && <Badge variant="gradient">{companyOverview.exchange}</Badge>}
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:text-right">
                              <div>
                                  <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                                      Market cap
                                  </div>
                                  <div className="font-mono font-semibold tabular-nums">
                                      {formatCurrency(companyOverview.marketCap, companyOverview.currency)}
                                  </div>
                              </div>
                              <div>
                                  <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                                      Currency
                                  </div>
                                  <div className="font-mono font-semibold">{companyOverview.currency}</div>
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  <Tabs value={tab} onValueChange={onTabChange}>
                      <TabsList className="flex flex-wrap">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="statements">Statements</TabsTrigger>
                          <TabsTrigger value="valuation">Valuation</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                          <TabsTrigger value="chart">Chart</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-base">Company</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-1">
                                  {companyOverview.description && (
                                      <p className="mb-3 text-sm text-[color:var(--color-fg-muted)] line-clamp-6">
                                          {companyOverview.description}
                                      </p>
                                  )}
                                  <MetricRow label="Shares outstanding" value={companyOverview.sharesOutstanding.toLocaleString()}/>
                                  <MetricRow label="Country" value={companyOverview.country || '—'}/>
                                  {companyOverview.lastReportedQuarter && (
                                      <MetricRow label="Last reported quarter" value={formatDate(companyOverview.lastReportedQuarter)}/>
                                  )}
                                  {companyOverview.nextEarningsDate && (
                                      <MetricRow label="Next earnings" value={formatDate(companyOverview.nextEarningsDate)}/>
                                  )}
                              </CardContent>
                          </Card>

                          {(companyOverview.yearlyRevenue ||
                              companyOverview.yearlyNetIncome ||
                              companyOverview.yearlyEbitda ||
                              companyOverview.yearlyEps) && (
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="text-base">Yearly fiscal</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-1">
                                      {companyOverview.yearlyRevenue && (
                                          <MetricRow label="Annual revenue" value={formatCurrency(companyOverview.yearlyRevenue, companyOverview.currency)}/>
                                      )}
                                      {companyOverview.yearlyNetIncome && (
                                          <MetricRow label="Annual net income" value={formatCurrency(companyOverview.yearlyNetIncome, companyOverview.currency)}/>
                                      )}
                                      {companyOverview.yearlyEbitda && (
                                          <MetricRow label="Annual EBITDA" value={formatCurrency(companyOverview.yearlyEbitda, companyOverview.currency)}/>
                                      )}
                                      {companyOverview.yearlyEps && (
                                          <MetricRow label="Annual EPS" value={formatNumber(companyOverview.yearlyEps)}/>
                                      )}
                                  </CardContent>
                              </Card>
                          )}
                      </TabsContent>

                      <TabsContent value="statements">
                          {financialStatements && (
                              <div className="grid gap-4 lg:grid-cols-3">
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Income statement</CardTitle>
                                          <CardDescription>
                                              As of {formatDate(financialStatements.incomeStatement.fiscalDateEnding)}
                                          </CardDescription>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="Total revenue"
                                                     value={formatCurrency(financialStatements.incomeStatement.totalRevenue, financialStatements.incomeStatement.reportedCurrency)}/>
                                          <MetricRow label="Gross profit"
                                                     value={formatCurrency(financialStatements.incomeStatement.grossProfit, financialStatements.incomeStatement.reportedCurrency)}/>
                                          <MetricRow label="Operating income"
                                                     value={formatCurrency(financialStatements.incomeStatement.operatingIncome, financialStatements.incomeStatement.reportedCurrency)}/>
                                          <MetricRow label="Net income" value={formatCurrency(financialStatements.incomeStatement.netIncome, financialStatements.incomeStatement.reportedCurrency)}/>
                                          <MetricRow label="EBITDA" value={formatCurrency(financialStatements.incomeStatement.ebitda, financialStatements.incomeStatement.reportedCurrency)}/>
                                          <MetricRow label="EPS" value={formatNumber(financialStatements.incomeStatement.eps)}/>
                                      </CardContent>
                                  </Card>

                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Balance sheet</CardTitle>
                                          <CardDescription>
                                              As of {formatDate(financialStatements.balanceSheet.fiscalDateEnding)}
                                          </CardDescription>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="Total assets" value={formatCurrency(financialStatements.balanceSheet.totalAssets, financialStatements.balanceSheet.reportedCurrency)}/>
                                          <MetricRow label="Total liabilities"
                                                     value={formatCurrency(financialStatements.balanceSheet.totalLiabilities, financialStatements.balanceSheet.reportedCurrency)}/>
                                          <MetricRow label="Shareholder equity"
                                                     value={formatCurrency(financialStatements.balanceSheet.totalShareholderEquity, financialStatements.balanceSheet.reportedCurrency)}/>
                                          <MetricRow label="Cash & equivalents"
                                                     value={formatCurrency(financialStatements.balanceSheet.cashAndCashEquivalents, financialStatements.balanceSheet.reportedCurrency)}/>
                                          <MetricRow label="Long-term debt" value={formatCurrency(financialStatements.balanceSheet.longTermDebt, financialStatements.balanceSheet.reportedCurrency)}/>
                                          <MetricRow label="Short-term debt" value={formatCurrency(financialStatements.balanceSheet.shortTermDebt, financialStatements.balanceSheet.reportedCurrency)}/>
                                      </CardContent>
                                  </Card>

                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Cash flow</CardTitle>
                                          <CardDescription>
                                              As of {formatDate(financialStatements.cashFlowStatement.fiscalDateEnding)}
                                          </CardDescription>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="Operating cash flow"
                                                     value={formatCurrency(financialStatements.cashFlowStatement.operatingCashflow, financialStatements.cashFlowStatement.reportedCurrency)}/>
                                          <MetricRow label="Capital expenditures"
                                                     value={formatCurrency(financialStatements.cashFlowStatement.capitalExpenditures, financialStatements.cashFlowStatement.reportedCurrency)}/>
                                          <MetricRow label="Free cash flow"
                                                     value={formatCurrency(financialStatements.cashFlowStatement.freeCashFlow, financialStatements.cashFlowStatement.reportedCurrency)}/>
                                          <MetricRow label="Cash from investing"
                                                     value={formatCurrency(financialStatements.cashFlowStatement.cashflowFromInvestment, financialStatements.cashFlowStatement.reportedCurrency)}/>
                                          <MetricRow label="Cash from financing"
                                                     value={formatCurrency(financialStatements.cashFlowStatement.cashflowFromFinancing, financialStatements.cashFlowStatement.reportedCurrency)}/>
                                          <MetricRow label="Net change in cash"
                                                     value={formatCurrency(financialStatements.cashFlowStatement.netChangeInCash, financialStatements.cashFlowStatement.reportedCurrency)}/>
                                      </CardContent>
                                  </Card>
                              </div>
                          )}
                      </TabsContent>

                      <TabsContent value="valuation">
                          {valuationMetrics && (
                              <div className="grid gap-4 md:grid-cols-2">
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Valuation ratios</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="Current price" value={formatCurrency(valuationMetrics.currentPrice)}/>
                                          <MetricRow label="Market cap" value={formatCurrency(valuationMetrics.marketCap)}/>
                                          <MetricRow label="Enterprise value" value={formatCurrency(valuationMetrics.enterpriseValue)}/>
                                          <MetricRow label="P/E ratio" value={formatNumber(valuationMetrics.peRatio)}/>
                                          <MetricRow label="P/B ratio" value={formatNumber(valuationMetrics.pbRatio)}/>
                                          <MetricRow label="P/S ratio" value={formatNumber(valuationMetrics.psRatio)}/>
                                          <MetricRow label="PEG ratio" value={formatNumber(valuationMetrics.pegRatio)}/>
                                          <MetricRow label="EV / EBITDA" value={formatNumber(valuationMetrics.evToEbitda)}/>
                                          <MetricRow label="Price to FCF" value={formatNumber(valuationMetrics.priceToFreeCashFlow)}/>
                                      </CardContent>
                                  </Card>
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Financial health</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="Debt to equity" value={formatNumber(valuationMetrics.debtToEquity)}/>
                                          <MetricRow label="Current ratio" value={formatNumber(valuationMetrics.currentRatio)}/>
                                          <MetricRow label="Quick ratio" value={formatNumber(valuationMetrics.quickRatio)}/>
                                      </CardContent>
                                  </Card>
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Profitability</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="ROE" value={formatPercent(valuationMetrics.returnOnEquity)}/>
                                          <MetricRow label="ROA" value={formatPercent(valuationMetrics.returnOnAssets)}/>
                                          <MetricRow label="Profit margin" value={formatPercent(valuationMetrics.profitMargin)}/>
                                          <MetricRow label="Operating margin" value={formatPercent(valuationMetrics.operatingMargin)}/>
                                      </CardContent>
                                  </Card>
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="text-base">Dividends</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-1">
                                          <MetricRow label="Dividend yield" value={formatPercent(valuationMetrics.dividendYield)}/>
                                          <MetricRow label="Payout ratio" value={formatPercent(valuationMetrics.payoutRatio)}/>
                                      </CardContent>
                                  </Card>
                              </div>
                          )}
                      </TabsContent>

                      <TabsContent value="history" className="space-y-4">
                          {incomeStatements.length > 0 && (
                              <Card className="overflow-hidden">
                                  <CardHeader>
                                      <CardTitle className="text-base">Income statement history</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-0">
                                      <Table>
                                          <TableHeader>
                                              <TableRow>
                                                  <TableHead>Date</TableHead>
                                                  <TableHead className="text-right">Revenue</TableHead>
                                                  <TableHead className="text-right">Gross profit</TableHead>
                                                  <TableHead className="text-right">Operating income</TableHead>
                                                  <TableHead className="text-right">Net income</TableHead>
                                                  <TableHead className="text-right">EPS</TableHead>
                                              </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                              {incomeStatements.map((stmt, idx) => (
                                                  <TableRow key={idx}>
                                                      <TableCell className="font-mono">{formatDate(stmt.fiscalDateEnding)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.totalRevenue, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.grossProfit, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.operatingIncome, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.netIncome, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatNumber(stmt.eps)}</TableCell>
                                                  </TableRow>
                                              ))}
                                          </TableBody>
                                      </Table>
                                  </CardContent>
                              </Card>
                          )}

                          {balanceSheets.length > 0 && (
                              <Card className="overflow-hidden">
                                  <CardHeader>
                                      <CardTitle className="text-base">Balance sheet history</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-0">
                                      <Table>
                                          <TableHeader>
                                              <TableRow>
                                                  <TableHead>Date</TableHead>
                                                  <TableHead className="text-right">Total assets</TableHead>
                                                  <TableHead className="text-right">Total liabilities</TableHead>
                                                  <TableHead className="text-right">Shareholder equity</TableHead>
                                                  <TableHead className="text-right">Cash</TableHead>
                                                  <TableHead className="text-right">Long-term debt</TableHead>
                                              </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                              {balanceSheets.map((stmt, idx) => (
                                                  <TableRow key={idx}>
                                                      <TableCell className="font-mono">{formatDate(stmt.fiscalDateEnding)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.totalAssets, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.totalLiabilities, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.totalShareholderEquity, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.cashAndCashEquivalents, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.longTermDebt, stmt.reportedCurrency)}</TableCell>
                                                  </TableRow>
                                              ))}
                                          </TableBody>
                                      </Table>
                                  </CardContent>
                              </Card>
                          )}

                          {cashFlowStatements.length > 0 && (
                              <Card className="overflow-hidden">
                                  <CardHeader>
                                      <CardTitle className="text-base">Cash flow history</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-0">
                                      <Table>
                                          <TableHeader>
                                              <TableRow>
                                                  <TableHead>Date</TableHead>
                                                  <TableHead className="text-right">Operating CF</TableHead>
                                                  <TableHead className="text-right">CapEx</TableHead>
                                                  <TableHead className="text-right">Free CF</TableHead>
                                                  <TableHead className="text-right">Investing</TableHead>
                                                  <TableHead className="text-right">Financing</TableHead>
                                              </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                              {cashFlowStatements.map((stmt, idx) => (
                                                  <TableRow key={idx}>
                                                      <TableCell className="font-mono">{formatDate(stmt.fiscalDateEnding)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.operatingCashflow, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.capitalExpenditures, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.freeCashFlow, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.cashflowFromInvestment, stmt.reportedCurrency)}</TableCell>
                                                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(stmt.cashflowFromFinancing, stmt.reportedCurrency)}</TableCell>
                                                  </TableRow>
                                              ))}
                                          </TableBody>
                                      </Table>
                                  </CardContent>
                              </Card>
                          )}
                      </TabsContent>

                      <TabsContent value="chart">
                          <Card>
                              <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
                                  <div>
                                      <CardTitle className="text-base">Price chart</CardTitle>
                                      <CardDescription>Period and interval are passed through to the data provider.</CardDescription>
                                  </div>
                                  <div className="flex flex-wrap items-end gap-2">
                                      <div className="space-y-1">
                                          <label className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">Period</label>
                                          <Select value={chartPeriod} onValueChange={(v) => {
                                              setChartPeriod(v);
                                              setChartLoaded(false);
                                          }}>
                                              <SelectTrigger className="w-28"><SelectValue/></SelectTrigger>
                                              <SelectContent>
                                                  {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                              </SelectContent>
                                          </Select>
                    </div>
                                      <div className="space-y-1">
                                          <label className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">Interval</label>
                                          <Select value={chartInterval} onValueChange={(v) => {
                                              setChartInterval(v);
                                              setChartLoaded(false);
                                          }}>
                                              <SelectTrigger className="w-28"><SelectValue/></SelectTrigger>
                                              <SelectContent>
                                                  {INTERVALS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                                              </SelectContent>
                                          </Select>
                    </div>
                                      <Button onClick={fetchChartData} disabled={chartLoading}>
                                          {chartLoading ? <RefreshCw className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}
                                          Update
                                      </Button>
                  </div>
                              </CardHeader>
                              <CardContent>
                                  {chartLoading ? (
                                      <Skeleton className="h-96 w-full"/>
                                  ) : ohlcData.length > 0 ? (
                    <StockChart data={ohlcData} symbol={symbol} />
                                  ) : chartLoaded ? (
                                      <EmptyState title="No data" description="No chart data for the selected period."/>
                                  ) : (
                                      <EmptyState title="Ready to load" description="Click Update to fetch chart data."/>
                  )}
                              </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>
        </>
      )}
    </div>
  );
}
