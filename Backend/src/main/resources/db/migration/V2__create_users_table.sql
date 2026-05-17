-- Migration V2: Users Table
-- Creates the users table for authentication

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bob_user_id VARCHAR(255) UNIQUE,
    team_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_bob_user_id ON users(bob_user_id);
CREATE INDEX idx_users_team_id ON users(team_id);

-- Comments
COMMENT ON TABLE users IS 'Developer user accounts';
COMMENT ON COLUMN users.bob_user_id IS 'IBM BOB user ID mapping for webhook integration';
COMMENT ON COLUMN users.team_id IS 'Future: FK to teams table (not in MVP scope)';

-- Made with Bob
