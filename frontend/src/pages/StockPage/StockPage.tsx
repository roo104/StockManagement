import React, {useEffect, useState} from 'react';
import StockChart from '../../components/charts/StockChart';
import StockControls from '../../components/forms/StockControls';
import ErrorMessage from '../../components/common/ErrorMessage';
import {OhlcData} from '../../types/OhlcData';
import {stockService} from '../../api/stockService';
import './StockPage.css';

const StockPage: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1mo');
  const [interval, setInterval] = useState('1d');
  const [data, setData] = useState<OhlcData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOhlcData = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await stockService.getOhlcData({ symbol, period, interval });

      if (!result || result.length === 0) {
        setError('No data available for this symbol and period');
        setData([]);
        return;
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOhlcData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stock-page">
      <h1>Stock OHLC Chart</h1>

      <ErrorMessage message={error} />

      <StockControls
        symbol={symbol}
        period={period}
        interval={interval}
        onSymbolChange={setSymbol}
        onPeriodChange={setPeriod}
        onIntervalChange={setInterval}
        onFetchData={fetchOhlcData}
        loading={loading}
      />

      {loading && <div className="loading">Loading data...</div>}

      {!loading && data.length > 0 && (
        <StockChart data={data} symbol={symbol} />
      )}
    </div>
  );
};

export default StockPage;
