import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {watchlistService} from '../../api/watchlistService';
import {StockWatchlist} from '../../types/Watchlist';
import ErrorMessage from '../../components/common/ErrorMessage';
import './WatchlistPage.css';

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<StockWatchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [addingStock, setAddingStock] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await watchlistService.getAllStocks();
      setStocks(data);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setAddingStock(true);
    setError('');
    try {
      await watchlistService.addStock({
        symbol: newSymbol.toUpperCase(),
        fetchFrequencyHours: 24,
      });
      setNewSymbol('');
      await fetchWatchlist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add stock');
      console.error('Error adding stock:', err);
    } finally {
      setAddingStock(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    if (!window.confirm(`Are you sure you want to remove ${symbol} from watchlist?`)) {
      return;
    }

    try {
      await watchlistService.removeStock(symbol);
      await fetchWatchlist();
    } catch (err) {
      setError(`Failed to remove ${symbol}`);
      console.error('Error removing stock:', err);
    }
  };

  const handleToggleActive = async (symbol: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await watchlistService.deactivateStock(symbol);
      } else {
        await watchlistService.activateStock(symbol);
      }
      await fetchWatchlist();
    } catch (err) {
      setError(`Failed to ${currentActive ? 'deactivate' : 'activate'} ${symbol}`);
      console.error('Error toggling stock status:', err);
    }
  };

  const handleStockClick = (symbol: string) => {
    navigate(`/fundamental?symbol=${symbol}`);
  };

  const handleFetchData = async (symbol: string) => {
    try {
      await watchlistService.fetchStock(symbol);
      await fetchWatchlist();
    } catch (err) {
      setError(`Failed to fetch data for ${symbol}`);
      console.error('Error fetching stock data:', err);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="watchlist-page">
      <h1>Stock Watchlist</h1>

      <div className="add-stock-form">
        <h2>Add Stock to Watchlist</h2>
        <form onSubmit={handleAddStock}>
          <div className="form-row">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g., AAPL)"
              className="symbol-input"
              disabled={addingStock}
            />
            <button type="submit" disabled={addingStock || !newSymbol.trim()} className="add-button">
              {addingStock ? 'Adding and resolving name...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>

      <ErrorMessage message={error} />

      {loading && <div className="loading">Loading watchlist...</div>}

      {!loading && stocks.length === 0 && (
        <div className="empty-state">
          <p>No stocks in watchlist. Add some stocks to get started!</p>
        </div>
      )}

      {!loading && stocks.length > 0 && (
        <div className="watchlist-table-container">
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Status</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className={`clickable-row ${!stock.active ? 'inactive' : ''}`}
                  onClick={() => handleStockClick(stock.symbol)}
                >
                  <td className="symbol-cell">
                    <strong>{stock.symbol}</strong>
                  </td>
                  <td>{stock.name || '-'}</td>
                  <td>
                    <span className={`status-badge ${stock.active ? 'active' : 'inactive'}`}>
                      {stock.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(stock.lastFetchedAt)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFetchData(stock.symbol);
                      }}
                      className="fetch-button"
                      title="Fetch data from provider"
                    >
                      🔄
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(stock.symbol, stock.active);
                      }}
                      className="toggle-button"
                      title={stock.active ? 'Deactivate' : 'Activate'}
                    >
                      {stock.active ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStock(stock.symbol);
                      }}
                      className="remove-button"
                      title="Remove from watchlist"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
