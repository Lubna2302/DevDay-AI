-- Migration V7: Open Loops Table
-- Creates the open_loops table for tracking context switches

-- Open loop status enum
CREATE TYPE open_loop_status AS ENUM (
    'OPEN',
    'CLOSED',
    'ABANDONED'
);

CREATE TABLE open_loops (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    focus_session_id BIGINT NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
    from_task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    to_task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
    context TEXT NOT NULL,
    reason TEXT NOT NULL,
    status open_loop_status NOT NULL DEFAULT 'OPEN',
    opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for open_loops
CREATE INDEX idx_open_loops_user_id ON open_loops(user_id);
CREATE INDEX idx_open_loops_focus_session_id ON open_loops(focus_session_id);
CREATE INDEX idx_open_loops_from_task_id ON open_loops(from_task_id);
CREATE INDEX idx_open_loops_to_task_id ON open_loops(to_task_id);
CREATE INDEX idx_open_loops_status ON open_loops(status);
CREATE INDEX idx_open_loops_opened_at ON open_loops(opened_at);
CREATE INDEX idx_open_loops_closed_at ON open_loops(closed_at);

-- Index for open loops (most common query)
CREATE INDEX idx_open_loops_open ON open_loops(user_id, opened_at) 
WHERE status = 'OPEN';

-- Comments
COMMENT ON TABLE open_loops IS 'Tracks context switches when pausing focus sessions';
COMMENT ON COLUMN open_loops.from_task_id IS 'Task being paused';
COMMENT ON COLUMN open_loops.to_task_id IS 'Task being switched to (if known)';
COMMENT ON COLUMN open_loops.context IS 'Current state/context to resume later';
COMMENT ON COLUMN open_loops.reason IS 'Why the switch happened';

-- Made with Bob