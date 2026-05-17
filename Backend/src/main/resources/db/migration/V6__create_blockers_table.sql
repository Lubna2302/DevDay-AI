-- Migration V6: Blockers Table
-- Creates the blockers table for tracking impediments

-- Blocker status enum
CREATE TYPE blocker_status AS ENUM (
    'ACTIVE',
    'RESOLVED',
    'ESCALATED'
);

-- Blocker type enum
CREATE TYPE blocker_type AS ENUM (
    'TECHNICAL',
    'DEPENDENCY',
    'RESOURCE',
    'CLARIFICATION',
    'ENVIRONMENT',
    'OTHER'
);

CREATE TABLE blockers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
    focus_session_id BIGINT REFERENCES focus_sessions(id) ON DELETE SET NULL,
    blocker_type blocker_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status blocker_status NOT NULL DEFAULT 'ACTIVE',
    resolution TEXT,
    blocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for blockers
CREATE INDEX idx_blockers_user_id ON blockers(user_id);
CREATE INDEX idx_blockers_task_id ON blockers(task_id);
CREATE INDEX idx_blockers_focus_session_id ON blockers(focus_session_id);
CREATE INDEX idx_blockers_status ON blockers(status);
CREATE INDEX idx_blockers_blocker_type ON blockers(blocker_type);
CREATE INDEX idx_blockers_blocked_at ON blockers(blocked_at);
CREATE INDEX idx_blockers_resolved_at ON blockers(resolved_at);

-- Index for active blockers (most common query)
CREATE INDEX idx_blockers_active ON blockers(user_id, blocked_at) 
WHERE status = 'ACTIVE';

-- Comments
COMMENT ON TABLE blockers IS 'Tracks impediments that block progress on tasks';
COMMENT ON COLUMN blockers.task_id IS 'Optional: associated task. NULL if general blocker.';
COMMENT ON COLUMN blockers.focus_session_id IS 'Optional: focus session where blocker was encountered';
COMMENT ON COLUMN blockers.resolution IS 'How the blocker was resolved';

-- Made with Bob