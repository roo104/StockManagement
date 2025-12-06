-- Income Statements Table
CREATE TABLE income_statements (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    fiscal_date_ending DATE NOT NULL,
    reported_currency VARCHAR(3) NOT NULL,
    total_revenue NUMERIC(20, 2) NOT NULL,
    cost_of_revenue NUMERIC(20, 2) NOT NULL,
    gross_profit NUMERIC(20, 2) NOT NULL,
    operating_expenses NUMERIC(20, 2) NOT NULL,
    operating_income NUMERIC(20, 2) NOT NULL,
    interest_expense NUMERIC(20, 2),
    income_before_tax NUMERIC(20, 2) NOT NULL,
    income_tax_expense NUMERIC(20, 2) NOT NULL,
    net_income NUMERIC(20, 2) NOT NULL,
    ebitda NUMERIC(20, 2) NOT NULL,
    eps NUMERIC(20, 4) NOT NULL,
    weighted_average_shares BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_income_statement UNIQUE (symbol, fiscal_date_ending)
);

CREATE INDEX idx_income_statements_symbol ON income_statements(symbol);
CREATE INDEX idx_income_statements_date ON income_statements(fiscal_date_ending);

-- Balance Sheets Table
CREATE TABLE balance_sheets (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    fiscal_date_ending DATE NOT NULL,
    reported_currency VARCHAR(3) NOT NULL,
    total_assets NUMERIC(20, 2) NOT NULL,
    total_current_assets NUMERIC(20, 2) NOT NULL,
    cash_and_cash_equivalents NUMERIC(20, 2) NOT NULL,
    inventory NUMERIC(20, 2),
    total_non_current_assets NUMERIC(20, 2) NOT NULL,
    property_plant_equipment NUMERIC(20, 2) NOT NULL,
    total_liabilities NUMERIC(20, 2) NOT NULL,
    total_current_liabilities NUMERIC(20, 2) NOT NULL,
    total_non_current_liabilities NUMERIC(20, 2) NOT NULL,
    long_term_debt NUMERIC(20, 2) NOT NULL,
    short_term_debt NUMERIC(20, 2) NOT NULL,
    total_shareholder_equity NUMERIC(20, 2) NOT NULL,
    retained_earnings NUMERIC(20, 2) NOT NULL,
    common_stock NUMERIC(20, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_balance_sheet UNIQUE (symbol, fiscal_date_ending)
);

CREATE INDEX idx_balance_sheets_symbol ON balance_sheets(symbol);
CREATE INDEX idx_balance_sheets_date ON balance_sheets(fiscal_date_ending);

-- Cash Flow Statements Table
CREATE TABLE cash_flow_statements (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    fiscal_date_ending DATE NOT NULL,
    reported_currency VARCHAR(3) NOT NULL,
    operating_cashflow NUMERIC(20, 2) NOT NULL,
    capital_expenditures NUMERIC(20, 2) NOT NULL,
    free_cash_flow NUMERIC(20, 2) NOT NULL,
    cashflow_from_investment NUMERIC(20, 2) NOT NULL,
    cashflow_from_financing NUMERIC(20, 2) NOT NULL,
    dividend_payout NUMERIC(20, 2),
    net_change_in_cash NUMERIC(20, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cash_flow_statement UNIQUE (symbol, fiscal_date_ending)
);

CREATE INDEX idx_cash_flow_statements_symbol ON cash_flow_statements(symbol);
CREATE INDEX idx_cash_flow_statements_date ON cash_flow_statements(fiscal_date_ending);

-- Company Overviews Table
CREATE TABLE company_overviews (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap NUMERIC(20, 2) NOT NULL,
    shares_outstanding BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    country VARCHAR(100),
    exchange VARCHAR(50),
    yearly_eps NUMERIC(20, 4),
    last_reported_quarter DATE,
    next_earnings_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_overviews_symbol ON company_overviews(symbol);
CREATE INDEX idx_company_overviews_sector ON company_overviews(sector);
CREATE INDEX idx_company_overviews_industry ON company_overviews(industry);

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
