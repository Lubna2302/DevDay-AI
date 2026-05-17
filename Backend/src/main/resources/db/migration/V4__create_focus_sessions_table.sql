-- Migration V4: Focus Sessions Table
-- Creates the focus_sessions table for tracking focused work periods

-- Focus session status enum
CREATE TYPE focus_session_status AS ENUM (
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'ABANDONED'
);

CREATE TABLE focus_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    planned_duration_minutes INTEGER NOT NULL,
    actual_duration_minutes INTEGER,
    status focus_session_status NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP,
    resumed_at TIMESTAMP,
    completed_at TIMESTAMP,
    abandoned_at TIMESTAMP,
    outcome TEXT,
    pause_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for focus_sessions
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task_id ON focus_sessions(task_id);
CREATE INDEX idx_focus_sessions_status ON focus_sessions(status);
CREATE INDEX idx_focus_sessions_started_at ON focus_sessions(started_at);
CREATE INDEX idx_focus_sessions_completed_at ON focus_sessions(completed_at);

-- Index for active sessions (most common query)
CREATE INDEX idx_focus_sessions_active ON focus_sessions(user_id, started_at) 
WHERE status = 'ACTIVE';

-- Comments
COMMENT ON TABLE focus_sessions IS 'Tracks focused work sessions on specific tasks';
COMMENT ON COLUMN focus_sessions.goal IS 'What the developer aims to accomplish in this session';
COMMENT ON COLUMN focus_sessions.planned_duration_minutes IS 'How long the developer planned to work';
COMMENT ON COLUMN focus_sessions.actual_duration_minutes IS 'Actual time spent (calculated on completion)';

-- Made with Bob
