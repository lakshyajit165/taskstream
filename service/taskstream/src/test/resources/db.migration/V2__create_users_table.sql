-- src/main/resources/db/migration/V2__create_users_table.sql

CREATE TABLE users (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Basic Fields
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL,

    -- Unique and Not Null Constraints
    email VARCHAR(255) NOT NULL UNIQUE,

    -- Auditing Fields (TIMESTAMP WITHOUT TIME ZONE for java.time.Instant)
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);