import React from 'react';
import './StockControls.css';

interface StockControlsProps {
  symbol: string;
  period: string;
  interval: string;
  onSymbolChange: (symbol: string) => void;
  onPeriodChange: (period: string) => void;
  onIntervalChange: (interval: string) => void;
  onFetchData: () => void;
  loading: boolean;
}

const StockControls: React.FC<StockControlsProps> = ({
  symbol,
  period,
  interval,
  onSymbolChange,
  onPeriodChange,
  onIntervalChange,
  onFetchData,
  loading,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFetchData();
    }
  };

  return (
    <div className="controls">
      <div className="control-group">
        <label htmlFor="symbol">Stock Symbol</label>
        <input
          type="text"
          id="symbol"
          placeholder="e.g., AAPL"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="control-group">
        <label htmlFor="period">Period</label>
        <select
          id="period"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
        >
          <option value="1d">1 Day</option>
          <option value="5d">5 Days</option>
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
          <option value="max">Max</option>
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="interval">Interval</label>
        <select
          id="interval"
          value={interval}
          onChange={(e) => onIntervalChange(e.target.value)}
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="1d">1 Day</option>
          <option value="1wk">1 Week</option>
          <option value="1mo">1 Month</option>
        </select>
      </div>

      <div className="control-group">
        <label>&nbsp;</label>
        <button onClick={onFetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>
    </div>
  );
};

export default StockControls;
