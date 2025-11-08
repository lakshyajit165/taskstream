-- src/main/resources/db/migration/V4__create_projects_table.sql
-- Assumes the 'users' table was created in V2

CREATE TABLE projects (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Basic Fields and Constraints
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),

    -- Date Fields
    due_date TIMESTAMP WITHOUT TIME ZONE,

    -- Foreign Key Column
    author_id BIGINT NOT NULL,

    -- Auditing Fields
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    -- Foreign Key Constraint: Links projects to the users table
    CONSTRAINT fk_project_author
        FOREIGN KEY (author_id)
        REFERENCES users (id)
        ON DELETE RESTRICT -- Prevents a user from being deleted if they own a project
);