-- src/main/resources/db/migration/V8__update_enum_to_varchar.sql
-- Converts custom PostgreSQL ENUM types to standard VARCHAR and adds NOT NULL constraint.

-- 1. Alter the 'state' column
-- NOTE: If any existing rows have NULL in 'state', this will fail.
ALTER TABLE tasks
    ALTER COLUMN state TYPE VARCHAR(50),
    ALTER COLUMN state SET NOT NULL;

-- 2. Alter the 'priority' column
-- NOTE: If any existing rows have NULL in 'priority', this will fail.
ALTER TABLE tasks
    ALTER COLUMN priority TYPE VARCHAR(50),
    ALTER COLUMN priority SET NOT NULL;

-- 3. Alter the 'type' column
-- NOTE: If any existing rows have NULL in 'type', this will fail.
ALTER TABLE tasks
    ALTER COLUMN type TYPE VARCHAR(50),
    ALTER COLUMN type SET NOT NULL;


-- Optional: Remove the custom ENUM types from the database if no longer needed
-- WARNING: Do not run this if other tables still use these types.
DROP TYPE task_state;
DROP TYPE task_priority;
DROP TYPE task_type;