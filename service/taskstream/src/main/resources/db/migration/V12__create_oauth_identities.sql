CREATE TABLE oauth_identities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,

    CONSTRAINT fk_oauth_identity_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_oauth_identity_provider_id
        UNIQUE (provider, provider_id),

    CONSTRAINT uk_oauth_identity_user_provider
        UNIQUE (user_id, provider)
);

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS uk_users_oauth_provider_id;
