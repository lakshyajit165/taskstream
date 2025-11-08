-- src/main/resources/db/migration/V6__create_task_enums.sql

-- TaskState (e.g., TODO, IN_PROGRESS, DONE, BLOCKED)
CREATE TYPE task_state AS ENUM (
    'NEW',
    'IN_PROGRESS',
    'COMPLETE',
    'BACKLOG'
);

-- TaskPriority (e.g., LOW, MEDIUM, HIGH, CRITICAL)
CREATE TYPE task_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

-- TaskType (e.g., FEATURE, BUG, CHORE, DOCUMENTATION)
CREATE TYPE task_type AS ENUM (
    'FEATURE',
    'DEFECT',
    'CUSTOMIZATION',
    'DOCUMENTATION',
    'BACKPORT',
    'FORWARDPORT'
);