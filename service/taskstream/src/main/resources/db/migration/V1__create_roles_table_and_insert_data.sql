-- src/main/resources/db/migration/V1__create_roles_table_and_insert_data.sql

-- 1. Create the roles table (Schema Migration)
CREATE TABLE roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 2. Insert default roles (Data Baseline)
-- Use standard PostgreSQL INSERT INTO with ON CONFLICT for idempotent behavior
INSERT INTO roles (id, name, created_at, updated_at)
VALUES (1, 'ROLE_USER', now(), now())
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = EXCLUDED.updated_at;

INSERT INTO roles (id, name, created_at, updated_at)
VALUES (2, 'ROLE_ADMIN', now(), now())
ON CONFLICT (id)
DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = EXCLUDED.updated_at;