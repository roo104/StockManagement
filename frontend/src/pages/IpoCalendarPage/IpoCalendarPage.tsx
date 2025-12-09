import React, {useEffect, useState} from 'react';
import {IpoCalendar, IpoCalendarEntry, ipoCalendarService} from '../../api/ipoCalendarService';
import ErrorMessage from '../../components/common/ErrorMessage';
import './IpoCalendarPage.css';

const IpoCalendarPage: React.FC = () => {
  const [calendar, setCalendar] = useState<IpoCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    // Set current month as default
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
    fetchIpoCalendar();
  }, []);

  const fetchIpoCalendar = async (month?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = month
        ? await ipoCalendarService.getIpoCalendarForMonth(month)
        : await ipoCalendarService.getIpoCalendar();
      setCalendar(data);
    } catch (err) {
      setError('Failed to load IPO calendar. Please check your API key and try again.');
      console.error('Error fetching IPO calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (month) {
      fetchIpoCalendar(month);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPriceRange = (low: number | null, high: number | null, currency: string) => {
    if (low && high) {
      return `${currency} ${low.toFixed(2)} - ${high.toFixed(2)}`;
    }
    return 'TBA';
  };

  const groupIposByDate = () => {
    if (!calendar) return new Map<string, IpoCalendarEntry[]>();

    const grouped = new Map<string, IpoCalendarEntry[]>();
    calendar.ipos.forEach((ipo) => {
      const date = ipo.ipoDate;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(ipo);
    });

    // Convert to array, sort, then back to Map
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
  };

  const groupedIpos = groupIposByDate();
  const totalIpos = calendar?.ipos.length || 0;

  return (
    <div className="ipo-calendar-page">
      <div className="page-header">
        <h1>IPO Calendar</h1>
        <p className="subtitle">Upcoming and recently listed Initial Public Offerings</p>
      </div>

      <div className="calendar-controls">
        <div className="month-selector">
          <label htmlFor="month-input">Select Month:</label>
          <input
            id="month-input"
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            onFocus={(e) => e.stopPropagation()}
            className="month-input"
            autoComplete="off"
            data-form-type="other"
            min={`${new Date().getFullYear() - 1}-01`}
            max={`${new Date().getFullYear() + 1}-12`}
          />
        </div>
        <button onClick={() => fetchIpoCalendar(selectedMonth)} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading && <div className="loading">Loading IPO calendar...</div>}

      {!loading && calendar && (
        <>
          <div className="calendar-summary">
            <div className="summary-card">
              <div className="summary-label">Total IPOs</div>
              <div className="summary-value">{totalIpos}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Selected Month</div>
              <div className="summary-value">{selectedMonth}</div>
            </div>
          </div>

          {totalIpos === 0 ? (
            <div className="empty-state">
              <p>No IPOs found for the selected period.</p>
              <p className="hint">Try selecting a different month or check back later.</p>
            </div>
          ) : (
            <div className="ipo-calendar-content">
              {Array.from(groupedIpos.entries()).map(([date, ipos]) => (
                <div key={date} className="date-group">
                  <h2 className="date-header">{formatDate(date)}</h2>
                  <div className="ipo-cards">
                    {ipos.map((ipo: IpoCalendarEntry) => (
                      <div key={ipo.symbol} className="ipo-card">
                        <div className="ipo-card-header">
                          <h3 className="ipo-symbol">{ipo.symbol}</h3>
                          {ipo.exchange && <span className="ipo-exchange">{ipo.exchange}</span>}
                        </div>
                        <div className="ipo-name">{ipo.name}</div>
                        <div className="ipo-details">
                          <div className="ipo-detail-row">
                            <span className="detail-label">Price Range:</span>
                            <span className="detail-value">
                              {formatPriceRange(ipo.priceRangeLow, ipo.priceRangeHigh, ipo.currency)}
                            </span>
                          </div>
                          <div className="ipo-detail-row">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{formatDate(ipo.ipoDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IpoCalendarPage;
