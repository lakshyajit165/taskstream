-- src/main/resources/db/migration/V7__create_tasks_table.sql
-- Assumes 'projects' (V4) and 'users' (V2) tables exist

CREATE TABLE tasks (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Basic Fields
    title VARCHAR(255),
    description TEXT, -- Using TEXT for potentially longer descriptions
    target_version VARCHAR(50),
    restricted_edit BOOLEAN,

    -- Date Fields
    due_date TIMESTAMP WITHOUT TIME ZONE,

    -- Enum Fields: Uses the custom ENUM types created in V6
    state task_state,
    priority task_priority,
    type task_type,

    -- Foreign Keys (linking to Project and Users)
    project_id BIGINT,
    created_by BIGINT,
    updated_by BIGINT,
    assigned_to BIGINT,

    -- Auditing Fields
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    -- Foreign Key Constraints
    -- Link to the project this task belongs to
    CONSTRAINT fk_task_project
        FOREIGN KEY (project_id)
        REFERENCES projects (id)
        ON DELETE CASCADE,

    -- Link to the user who created the task
    CONSTRAINT fk_task_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL,

    -- Link to the user who last updated the task
    CONSTRAINT fk_task_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users (id)
        ON DELETE SET NULL,

    -- Link to the user currently assigned the task
    CONSTRAINT fk_task_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users (id)
        ON DELETE SET NULL
);