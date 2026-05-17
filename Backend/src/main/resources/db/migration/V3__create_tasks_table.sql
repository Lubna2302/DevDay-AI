-- Migration V3: Tasks Table
-- Creates the tasks table for all work items

-- Task source enum
CREATE TYPE task_source AS ENUM (
    'JIRA',
    'GITHUB', 
    'CALENDAR',
    'TEAMS',
    'MANUAL'
);

-- Task status enum
CREATE TYPE task_status AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'BLOCKED',
    'COMPLETED',
    'CANCELLED'
);

-- Task priority enum
CREATE TYPE task_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    source task_source NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_source ON tasks(source);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Unique constraint: prevent duplicate external tasks per user
CREATE UNIQUE INDEX idx_tasks_unique_external 
ON tasks(user_id, source, external_id) 
WHERE external_id IS NOT NULL;

-- GIN index for JSONB metadata search
CREATE INDEX idx_tasks_metadata ON tasks USING GIN(metadata);

-- Comments
COMMENT ON TABLE tasks IS 'All work items from all sources (Jira, GitHub, Calendar, Teams, Manual)';
COMMENT ON COLUMN tasks.external_id IS 'External system ID (e.g., JIRA-123, PR-45). NULL for manual tasks.';
COMMENT ON COLUMN tasks.metadata IS 'Source-specific data stored as JSON (URLs, assignees, etc.)';
COMMENT ON COLUMN tasks.source IS 'Where the task came from: JIRA, GITHUB, CALENDAR, TEAMS, or MANUAL';

-- Made with Bob
