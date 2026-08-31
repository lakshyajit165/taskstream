CREATE TABLE oauth_credentials (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL,
    server_url VARCHAR(1000) NOT NULL,
    client_secret VARCHAR(1000) NOT NULL,
    oauth_enabled BOOLEAN NOT NULL DEFAULT FALSE
);