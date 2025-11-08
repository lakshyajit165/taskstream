-- H2-Specific Script

-- 1. Create the roles table (H2 compatible)
-- Taken care by JPA
-- 2. Insert default roles (Simple INSERT is sufficient for H2 which is clean before every test)
MERGE INTO roles (id, name, created_at, updated_at)
VALUES (1, 'ROLE_USER', now(), now());

MERGE INTO roles (id, name, created_at, updated_at)
VALUES (2, 'ROLE_ADMIN', now(), now());