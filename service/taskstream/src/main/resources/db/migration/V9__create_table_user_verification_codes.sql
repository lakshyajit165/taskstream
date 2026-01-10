CREATE TABLE user_verification_codes (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,

    -- Email (NOT unique - allows multiple codes per email)
    email VARCHAR(255) NOT NULL,

    -- 6 digit verification code
    verification_code VARCHAR(6) NOT NULL,

    -- Expiration timestamp
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,

    -- Rate limiting
    attempts INT DEFAULT 0,

    -- Auditing Fields
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Unique constraint for email + code combination
    CONSTRAINT unique_email_code UNIQUE (email, verification_code)
);

-- Indexes for performance
--CREATE INDEX idx_user_verification_email ON user_verification_codes(email);
--CREATE INDEX idx_user_verification_expires ON user_verification_codes(expires_at);
--CREATE INDEX idx_user_verification_code ON user_verification_codes(verification_code);