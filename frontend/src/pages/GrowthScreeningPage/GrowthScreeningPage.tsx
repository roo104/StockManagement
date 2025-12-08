import React, {useCallback, useEffect, useState} from 'react';
import {growthScreeningService} from '../../api/growthScreeningService';
import {GrowthCategory, GrowthScreeningResult} from '../../types/GrowthScreening';
import GrowthStockCard from '../../components/GrowthStockCard/GrowthStockCard';
import ErrorMessage from '../../components/common/ErrorMessage';
import './GrowthScreeningPage.css';

const GrowthScreeningPage: React.FC = () => {
  const [result, setResult] = useState<GrowthScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [minScore, setMinScore] = useState<number>(60);
  const [minRevenueGrowth, setMinRevenueGrowth] = useState<string>('');
  const [minEarningsGrowth, setMinEarningsGrowth] = useState<string>('');
  const [maxPeRatio, setMaxPeRatio] = useState<string>('');

  const fetchGrowthStocks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { minScore };
      if (minRevenueGrowth) params.minRevenueGrowth = parseFloat(minRevenueGrowth) / 100;
      if (minEarningsGrowth) params.minEarningsGrowth = parseFloat(minEarningsGrowth) / 100;
      if (maxPeRatio) params.maxPeRatio = parseFloat(maxPeRatio);

      const data = await growthScreeningService.screenAllStocks(params);
      setResult(data);
    } catch (err) {
      setError('Failed to load growth stocks');
      console.error('Error fetching growth stocks:', err);
    } finally {
      setLoading(false);
    }
  }, [minScore, minRevenueGrowth, minEarningsGrowth, maxPeRatio]);

  useEffect(() => {
    fetchGrowthStocks();
  }, [fetchGrowthStocks]);

  const handleApplyFilters = () => {
    fetchGrowthStocks();
  };

  const handleResetFilters = () => {
    setMinScore(60);
    setMinRevenueGrowth('');
    setMinEarningsGrowth('');
    setMaxPeRatio('');
  };

  const getCategoryStats = () => {
    if (!result) return { high: 0, strong: 0, moderate: 0 };
    const stocks = result.topGrowthStocks;
    return {
      high: stocks.filter(s => s.growthCategory === GrowthCategory.HIGH_GROWTH).length,
      strong: stocks.filter(s => s.growthCategory === GrowthCategory.STRONG_GROWTH).length,
      moderate: stocks.filter(s => s.growthCategory === GrowthCategory.MODERATE_GROWTH).length
    };
  };

  const stats = getCategoryStats();

  return (
    <div className="growth-screening-page">
      <div className="growth-screening-header">
        <h1>🚀 Growth Stock Screening</h1>
        <p>Identify upcoming growth stocks using multi-factor fundamental analysis</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-title">Filters</div>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="minScore">Minimum Score</label>
            <input
              id="minScore"
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="minRevenueGrowth">Min Revenue Growth (%)</label>
            <input
              id="minRevenueGrowth"
              type="number"
              placeholder="e.g., 15"
              value={minRevenueGrowth}
              onChange={(e) => setMinRevenueGrowth(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="minEarningsGrowth">Min Earnings Growth (%)</label>
            <input
              id="minEarningsGrowth"
              type="number"
              placeholder="e.g., 20"
              value={minEarningsGrowth}
              onChange={(e) => setMinEarningsGrowth(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="maxPeRatio">Max P/E Ratio</label>
            <input
              id="maxPeRatio"
              type="number"
              placeholder="e.g., 35"
              value={maxPeRatio}
              onChange={(e) => setMaxPeRatio(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn-filter btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className="btn-filter btn-secondary" onClick={handleResetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {result && !loading && (
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-label">Total Analyzed</div>
            <div className="stat-value">{result.totalAnalyzed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Results Found</div>
            <div className="stat-value primary">{result.resultsCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High Growth</div>
            <div className="stat-value" style={{ color: '#0f9d58' }}>{stats.high}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Strong Growth</div>
            <div className="stat-value" style={{ color: '#4285f4' }}>{stats.strong}</div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="results-section">
        <div className="results-header">
          <div className="results-title">Growth Candidates</div>
          {result && (
            <div className="results-count">
              Showing {result.resultsCount} of {result.totalAnalyzed} stocks
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-state">Loading growth stocks...</div>
        )}

        {error && <ErrorMessage message={error} />}

        {!loading && !error && result && result.topGrowthStocks.length === 0 && (
          <div className="empty-state">
            <h3>No Growth Stocks Found</h3>
            <p>Try adjusting your filters to see more results</p>
          </div>
        )}

        {!loading && !error && result && result.topGrowthStocks.length > 0 && (
          <div className="growth-stocks-grid">
            {result.topGrowthStocks.map((stock) => (
              <GrowthStockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowthScreeningPage;
