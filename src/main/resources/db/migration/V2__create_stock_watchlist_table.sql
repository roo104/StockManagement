-- Stock Watchlist Table
CREATE TABLE stock_watchlist (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_fetched_at TIMESTAMP,
    fetch_frequency_hours INT NOT NULL DEFAULT 24,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_watchlist_symbol ON stock_watchlist(symbol);
CREATE INDEX idx_stock_watchlist_active ON stock_watchlist(active);
CREATE INDEX idx_stock_watchlist_last_fetched ON stock_watchlist(last_fetched_at);

-- Insert some default stocks to track
INSERT INTO stock_watchlist (symbol, name, active) VALUES
    ('AAPL', 'Apple Inc.', true),
    ('MSFT', 'Microsoft Corporation', true),
    ('GOOGL', 'Alphabet Inc.', true),
    ('AMZN', 'Amazon.com Inc.', true),
    ('TSLA', 'Tesla Inc.', true),
    ('META', 'Meta Platforms Inc.', true),
    ('NVDA', 'NVIDIA Corporation', true),
    ('JPM', 'JPMorgan Chase & Co.', true),
    ('V', 'Visa Inc.', true),
    ('WMT', 'Walmart Inc.', true);
