-- News source URLs attached to a watchlist entry
CREATE TABLE stock_news_url
(
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    stock_watchlist_id BIGINT       NOT NULL,
    url                VARCHAR(500) NOT NULL,
    active             BOOLEAN      NOT NULL DEFAULT TRUE,
    last_scraped_at    TIMESTAMP NULL,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_news_url_stock FOREIGN KEY (stock_watchlist_id)
        REFERENCES stock_watchlist (id) ON DELETE CASCADE,
    CONSTRAINT uk_news_url_stock_url UNIQUE (stock_watchlist_id, url)
);

CREATE INDEX idx_news_url_stock ON stock_news_url (stock_watchlist_id);
CREATE INDEX idx_news_url_active ON stock_news_url (active);

-- Individual scraped news articles
CREATE TABLE news_item
(
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    stock_watchlist_id BIGINT        NOT NULL,
    source_url_id      BIGINT        NOT NULL,
    article_url        VARCHAR(500)  NOT NULL,
    headline           VARCHAR(1024) NOT NULL,
    summary            TEXT,
    published_at       TIMESTAMP NULL,
    scraped_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_news_item_stock FOREIGN KEY (stock_watchlist_id)
        REFERENCES stock_watchlist (id) ON DELETE CASCADE,
    CONSTRAINT fk_news_item_source FOREIGN KEY (source_url_id)
        REFERENCES stock_news_url (id) ON DELETE CASCADE,
    CONSTRAINT uk_news_item_article UNIQUE (stock_watchlist_id, article_url)
);

CREATE INDEX idx_news_item_stock_date ON news_item (stock_watchlist_id, published_at);
CREATE INDEX idx_news_item_source ON news_item (source_url_id);
