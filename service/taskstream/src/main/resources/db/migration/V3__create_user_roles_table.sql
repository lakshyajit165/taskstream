-- src/main/resources/db/migration/V3__create_user_roles_table.sql
-- Assumes the 'roles' table was created in V1

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    -- Composite Primary Key
    PRIMARY KEY (user_id, role_id),

    -- Foreign Key Constraint for User
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    -- Foreign Key Constraint for Role
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE
);