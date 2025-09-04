-- create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- insert default roles
INSERT INTO roles (id, name, created_at, updated_at)
VALUES (1, 'ROLE_USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO roles (id, name, created_at, updated_at)
VALUES (2, 'ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);