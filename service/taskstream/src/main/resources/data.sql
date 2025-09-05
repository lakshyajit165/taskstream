-- create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- insert default roles
MERGE INTO roles (id, name, created_at, updated_at) KEY(id)
VALUES (1, 'ROLE_USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO roles (id, name, created_at, updated_at) KEY(id)
VALUES (2, 'ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);