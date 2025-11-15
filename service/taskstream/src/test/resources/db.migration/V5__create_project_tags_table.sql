-- src/main/resources/db/migration/V5__create_project_tags_table.sql
-- Assumes the 'projects' table was created in V4

CREATE TABLE project_tags (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Basic Fields and Constraints
    name VARCHAR(255) NOT NULL,

    -- Foreign Key Column: Links to the Project table
    project_id BIGINT NOT NULL,

    -- Auditing Fields (TIMESTAMP WITHOUT TIME ZONE for LocalDateTime)
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    -- Foreign Key Constraint: Links project_tags to the projects table
    CONSTRAINT fk_project_tag_project
        FOREIGN KEY (project_id)
        REFERENCES projects (id)
        ON DELETE CASCADE -- If a project is deleted, all its tags are deleted
);