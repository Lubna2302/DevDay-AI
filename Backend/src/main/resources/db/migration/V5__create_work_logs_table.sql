-- Migration V5: Work Logs Table
-- Creates the work_logs table for tracking non-task work

-- Work log type enum
CREATE TYPE work_log_type AS ENUM (
    'HELPED_TEAMMATE',
    'DEBUGGING',
    'RESEARCH',
    'DOCUMENTATION',
    'MEETING',
    'PRODUCTION_SUPPORT',
    'ARCHITECTURE',
    'OTHER'
);

CREATE TABLE work_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
    log_type work_log_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for work_logs
CREATE INDEX idx_work_logs_user_id ON work_logs(user_id);
CREATE INDEX idx_work_logs_task_id ON work_logs(task_id);
CREATE INDEX idx_work_logs_log_type ON work_logs(log_type);
CREATE INDEX idx_work_logs_logged_at ON work_logs(logged_at);
CREATE INDEX idx_work_logs_created_at ON work_logs(created_at);

-- Comments
COMMENT ON TABLE work_logs IS 'Tracks work activities that may not be tied to specific tasks';
COMMENT ON COLUMN work_logs.task_id IS 'Optional: associated task. NULL if general work.';
COMMENT ON COLUMN work_logs.duration_minutes IS 'How long this activity took';

-- Made with Bob
