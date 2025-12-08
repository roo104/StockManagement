import React from 'react';
import {GrowthCategory, GrowthStockScore} from '../../types/GrowthScreening';

interface GrowthStockCardProps {
  stock: GrowthStockScore;
}

const GrowthStockCard: React.FC<GrowthStockCardProps> = ({ stock }) => {
  const getScoreClass = (score: number): string => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-strong';
    if (score >= 40) return 'score-moderate';
    return 'score-low';
  };

  const getCategoryBadgeClass = (category: GrowthCategory): string => {
    switch (category) {
      case GrowthCategory.HIGH_GROWTH:
        return 'badge-high';
      case GrowthCategory.STRONG_GROWTH:
        return 'badge-strong';
      case GrowthCategory.MODERATE_GROWTH:
        return 'badge-moderate';
      default:
        return 'badge-low';
    }
  };

  const getCategoryLabel = (category: GrowthCategory): string => {
    return category.replace('_', ' ');
  };

  const formatPercentage = (value: number | null, decimals: number = 1): string => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(decimals)}%`;
  };

  const formatNumber = (value: number | null, decimals: number = 2): string => {
    if (value === null) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatMarketCap = (value: number | null): string => {
    if (value === null) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const getTrendClass = (trend: string | null): string => {
    if (trend === 'IMPROVING') return 'trend-improving';
    if (trend === 'DECLINING') return 'trend-declining';
    return 'trend-stable';
  };

  const getTrendIcon = (trend: string | null): string => {
    if (trend === 'IMPROVING') return '📈';
    if (trend === 'DECLINING') return '📉';
    return '➡️';
  };

  const isPositive = (value: number | null): boolean => {
    return value !== null && value > 0;
  };

  return (
    <div className="growth-stock-card">
      {/* Header with Symbol and Overall Score */}
      <div className="stock-header">
        <div className="stock-info">
          <h3>{stock.symbol}</h3>
          <div className="stock-meta">
            {stock.name && <span>{stock.name}</span>}
            {stock.sector && <span>• {stock.sector}</span>}
          </div>
          <span className={`category-badge ${getCategoryBadgeClass(stock.growthCategory)}`}>
            {getCategoryLabel(stock.growthCategory)}
          </span>
        </div>
        <div className="overall-score">
          <div className="score-label">Overall Score</div>
          <div className={`score-value ${getScoreClass(stock.overallScore)}`}>
            {stock.overallScore}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="score-breakdown">
        <div className="score-item">
          <span className="score-item-label">Revenue</span>
          <span className={`score-item-value ${getScoreClass(stock.revenueGrowthScore)}`}>
            {stock.revenueGrowthScore}
          </span>
        </div>
        <div className="score-item">
          <span className="score-item-label">Earnings</span>
          <span className={`score-item-value ${getScoreClass(stock.earningsGrowthScore)}`}>
            {stock.earningsGrowthScore}
          </span>
        </div>
        <div className="score-item">
          <span className="score-item-label">Cash Flow</span>
          <span className={`score-item-value ${getScoreClass(stock.cashFlowScore)}`}>
            {stock.cashFlowScore}
          </span>
        </div>
        <div className="score-item">
          <span className="score-item-label">Profit</span>
          <span className={`score-item-value ${getScoreClass(stock.profitabilityScore)}`}>
            {stock.profitabilityScore}
          </span>
        </div>
        <div className="score-item">
          <span className="score-item-label">Efficiency</span>
          <span className={`score-item-value ${getScoreClass(stock.efficiencyScore)}`}>
            {stock.efficiencyScore}
          </span>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="growth-metrics">
        <div className="metric-item">
          <span className="metric-label">Revenue Growth</span>
          <span className={`metric-value ${isPositive(stock.growthMetrics.revenueGrowthRate) ? 'positive' : 'negative'}`}>
            {formatPercentage(stock.growthMetrics.revenueGrowthRate)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Earnings Growth</span>
          <span className={`metric-value ${isPositive(stock.growthMetrics.earningsGrowthRate) ? 'positive' : 'negative'}`}>
            {formatPercentage(stock.growthMetrics.earningsGrowthRate)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">FCF Growth</span>
          <span className={`metric-value ${isPositive(stock.growthMetrics.freeCashFlowGrowthRate) ? 'positive' : 'negative'}`}>
            {formatPercentage(stock.growthMetrics.freeCashFlowGrowthRate)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Gross Margin</span>
          <span className="metric-value">
            {formatPercentage(stock.growthMetrics.grossMargin)}
          </span>
          {stock.growthMetrics.grossMarginTrend && (
            <span className={`metric-trend ${getTrendClass(stock.growthMetrics.grossMarginTrend)}`}>
              {getTrendIcon(stock.growthMetrics.grossMarginTrend)} {stock.growthMetrics.grossMarginTrend}
            </span>
          )}
        </div>
        <div className="metric-item">
          <span className="metric-label">P/E Ratio</span>
          <span className="metric-value">{formatNumber(stock.peRatio)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">PEG Ratio</span>
          <span className="metric-value">{formatNumber(stock.pegRatio)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">ROE</span>
          <span className="metric-value">{formatPercentage(stock.roe)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Market Cap</span>
          <span className="metric-value">{formatMarketCap(stock.marketCap)}</span>
        </div>
      </div>

      {/* Flags */}
      {stock.flags.length > 0 && (
        <div className="flags-section">
          {stock.flags.map((flag, index) => (
            <div key={index} className="flag">
              {flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrowthStockCard;
