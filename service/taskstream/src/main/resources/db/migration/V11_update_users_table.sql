ALTER TABLE users
    ADD COLUMN oauth_provider VARCHAR(50);

ALTER TABLE users
    ADD COLUMN provider_id VARCHAR(255);

-- All existing users were created using local authentication.
UPDATE users
SET oauth_provider = 'LOCAL';

ALTER TABLE users
    ALTER COLUMN oauth_provider SET NOT NULL;

ALTER TABLE users
    ALTER COLUMN password DROP NOT NULL;