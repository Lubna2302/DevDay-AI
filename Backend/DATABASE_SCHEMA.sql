-- DevDay AI - Complete Database Schema
-- PostgreSQL 15+
-- DELIVERABLE C: Full Flyway SQL Migrations

-- ============================================================================
-- MIGRATION V1: Initial Schema Setup
-- File: src/main/resources/db/migration/V1__init_schema.sql
-- ============================================================================

-- Enable UUID extension (optional, using BIGSERIAL for simplicity)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MIGRATION V2: Users Table
-- File: src/main/resources/db/migration/V2__create_users_table.sql
-- ============================================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    team_id BIGINT,  -- Future: reference to teams table (not in MVP)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);

-- Comments
COMMENT ON TABLE users IS 'Developer user accounts';
COMMENT ON COLUMN users.team_id IS 'Future: FK to teams table (not in MVP scope)';

-- ============================================================================
-- MIGRATION V3: Tasks Table
-- File: src/main/resources/db/migration/V3__create_tasks_table.sql
-- ============================================================================

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
    external_id VARCHAR(255),  -- e.g., "AUTH-231", "PR-82", "CAL-001"
    source task_source NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB,  -- Source-specific data (jiraUrl, prUrl, meetingTime, etc.)
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

-- GIN index for JSONB metadata search (optional, for advanced search)
CREATE INDEX idx_tasks_metadata ON tasks USING GIN(metadata);

-- Comments
COMMENT ON TABLE tasks IS 'All work items from all sources (Jira, GitHub, Calendar, Teams, Manual)';
COMMENT ON COLUMN tasks.external_id IS 'External system ID (e.g., JIRA-123, PR-45). NULL for manual tasks.';
COMMENT ON COLUMN tasks.metadata IS 'Source-specific data stored as JSON (URLs, assignees, etc.)';
COMMENT ON COLUMN tasks.source IS 'Where the task came from: JIRA, GITHUB, CALENDAR, TEAMS, or MANUAL';

-- ============================================================================
-- MIGRATION V4: Blockers Table
-- File: src/main/resources/db/migration/V4__create_blockers_table.sql
-- ============================================================================

-- Blocker type enum
CREATE TYPE blocker_type AS ENUM (
    'WAITING_ON_TEAM',
    'TECHNICAL_ISSUE',
    'EXTERNAL_DEPENDENCY',
    'CLARIFICATION_NEEDED'
);

-- Blocker status enum
CREATE TYPE blocker_status AS ENUM (
    'ACTIVE',
    'RESOLVED',
    'ESCALATED'
);

CREATE TABLE blockers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,  -- NULL if task deleted
    title VARCHAR(500) NOT NULL,
    description TEXT,
    blocker_type blocker_type NOT NULL,
    status blocker_status NOT NULL DEFAULT 'ACTIVE',
    blocked_since TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for blockers
CREATE INDEX idx_blockers_user_id ON blockers(user_id);
CREATE INDEX idx_blockers_task_id ON blockers(task_id);
CREATE INDEX idx_blockers_status ON blockers(status);
CREATE INDEX idx_blockers_blocker_type ON blockers(blocker_type);
CREATE INDEX idx_blockers_blocked_since ON blockers(blocked_since);

-- Comments
COMMENT ON TABLE blockers IS 'Tracks issues blocking task progress';
COMMENT ON COLUMN blockers.task_id IS 'Optional: associated task. NULL if general blocker.';

-- ============================================================================
-- MIGRATION V5: Open Loops Table
-- File: src/main/resources/db/migration/V5__create_open_loops_table.sql
-- ============================================================================

-- Open loop priority enum
CREATE TYPE open_loop_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

CREATE TABLE open_loops (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    context TEXT,  -- What was happening when paused
    resume_note TEXT,  -- How to resume work
    priority open_loop_priority NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    closure_note TEXT
);

-- Indexes for open_loops
CREATE INDEX idx_open_loops_user_id ON open_loops(user_id);
CREATE INDEX idx_open_loops_task_id ON open_loops(task_id);
CREATE INDEX idx_open_loops_priority ON open_loops(priority);
CREATE INDEX idx_open_loops_created_at ON open_loops(created_at);
CREATE INDEX idx_open_loops_closed_at ON open_loops(closed_at);

-- Index for active open loops (most common query)
CREATE INDEX idx_open_loops_active ON open_loops(user_id, created_at) 
WHERE closed_at IS NULL;

-- Comments
COMMENT ON TABLE open_loops IS 'Tracks unfinished work that needs to be resumed';
COMMENT ON COLUMN open_loops.context IS 'What was happening when work was paused';
COMMENT ON COLUMN open_loops.resume_note IS 'Notes on how to resume this work';

-- ============================================================================
-- MIGRATION V6: Integration Sync Table
-- File: src/main/resources/db/migration/V6__create_integration_sync_table.sql
-- ============================================================================

-- Integration type enum
CREATE TYPE integration_type AS ENUM (
    'JIRA',
    'GITHUB',
    'CALENDAR',
    'TEAMS'
);

-- Sync status enum
CREATE TYPE sync_status AS ENUM (
    'SUCCESS',
    'FAILED',
    'IN_PROGRESS'
);

CREATE TABLE integration_sync (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    integration_type integration_type NOT NULL,
    last_sync_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status sync_status NOT NULL DEFAULT 'SUCCESS',
    error_message TEXT,
    items_synced INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for integration_sync
CREATE INDEX idx_integration_sync_user_id ON integration_sync(user_id);
CREATE INDEX idx_integration_sync_type ON integration_sync(integration_type);
CREATE INDEX idx_integration_sync_last_sync ON integration_sync(last_sync_at);

-- Unique constraint: one sync record per user per integration
CREATE UNIQUE INDEX idx_integration_sync_unique 
ON integration_sync(user_id, integration_type);

-- Comments
COMMENT ON TABLE integration_sync IS 'Tracks last sync time and status for each integration';

-- ============================================================================
-- MIGRATION V7: Focus Sessions Table
-- File: src/main/resources/db/migration/V7__create_focus_sessions_table.sql
-- ============================================================================

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
    goal TEXT NOT NULL,  -- What user wants to accomplish
    planned_duration_minutes INTEGER NOT NULL,  -- 25, 45, 90, etc.
    actual_duration_minutes INTEGER,  -- Calculated on completion
    status focus_session_status NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP,
    resumed_at TIMESTAMP,
    completed_at TIMESTAMP,
    abandoned_at TIMESTAMP,
    outcome TEXT,  -- What was accomplished (on completion)
    abandon_reason TEXT,  -- Why abandoned (on abandon)
    pause_count INTEGER DEFAULT 0,  -- Number of times paused
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for focus_sessions
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task_id ON focus_sessions(task_id);
CREATE INDEX idx_focus_sessions_status ON focus_sessions(status);
CREATE INDEX idx_focus_sessions_started_at ON focus_sessions(started_at);

-- Index for active session lookup (most common query)
CREATE INDEX idx_focus_sessions_active ON focus_sessions(user_id, started_at) 
WHERE status = 'ACTIVE';

-- Comments
COMMENT ON TABLE focus_sessions IS 'Tracks focused work sessions with timer and goals';
COMMENT ON COLUMN focus_sessions.goal IS 'What the developer wants to accomplish in this session';
COMMENT ON COLUMN focus_sessions.planned_duration_minutes IS 'Planned duration (25, 45, 90 minutes)';
COMMENT ON COLUMN focus_sessions.pause_count IS 'Number of times this session was paused';

-- ============================================================================
-- MIGRATION V8: Work Logs Table
-- File: src/main/resources/db/migration/V8__create_work_logs_table.sql
-- ============================================================================

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
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,  -- Optional task association
    focus_session_id BIGINT REFERENCES focus_sessions(id) ON DELETE SET NULL,  -- Optional session link
    log_type work_log_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,  -- How long this work took
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for work_logs
CREATE INDEX idx_work_logs_user_id ON work_logs(user_id);
CREATE INDEX idx_work_logs_task_id ON work_logs(task_id);
CREATE INDEX idx_work_logs_focus_session_id ON work_logs(focus_session_id);
CREATE INDEX idx_work_logs_log_type ON work_logs(log_type);
CREATE INDEX idx_work_logs_logged_at ON work_logs(logged_at);

-- Index for today's logs (common query)
CREATE INDEX idx_work_logs_today ON work_logs(user_id, logged_at);

-- Comments
COMMENT ON TABLE work_logs IS 'Manual work tracking with categories';
COMMENT ON COLUMN work_logs.task_id IS 'Optional: associated task';
COMMENT ON COLUMN work_logs.focus_session_id IS 'Optional: associated focus session';
COMMENT ON COLUMN work_logs.duration_minutes IS 'Duration of this work activity';

-- ============================================================================
-- MIGRATION V9: Summaries Table
-- File: src/main/resources/db/migration/V9__create_summaries_table.sql
-- ============================================================================

-- Summary type enum
CREATE TYPE summary_type AS ENUM (
    'DAILY',
    'WEEKLY'
);

-- Summary status enum
CREATE TYPE summary_status AS ENUM (
    'DRAFT',
    'EDITED',
    'SUBMITTED'
);

CREATE TABLE summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_type summary_type NOT NULL,
    summary_date DATE NOT NULL,  -- Date or week start date
    ai_generated_content TEXT NOT NULL,  -- Original AI-generated summary
    edited_content TEXT,  -- User-edited version (NULL if not edited)
    status summary_status NOT NULL DEFAULT 'DRAFT',
    submitted_at TIMESTAMP,
    submitted_to VARCHAR(255),  -- Email or name of recipient
    metadata JSONB,  -- LLM model, tokens used, generation time, etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for summaries
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_type ON summaries(summary_type);
CREATE INDEX idx_summaries_date ON summaries(summary_date);
CREATE INDEX idx_summaries_status ON summaries(status);
CREATE INDEX idx_summaries_submitted_at ON summaries(submitted_at);

-- Unique constraint: one summary per user per date per type
CREATE UNIQUE INDEX idx_summaries_unique 
ON summaries(user_id, summary_type, summary_date);

-- Comments
COMMENT ON TABLE summaries IS 'AI-generated daily and weekly summaries';
COMMENT ON COLUMN summaries.ai_generated_content IS 'Original AI-generated summary (preserved)';
COMMENT ON COLUMN summaries.edited_content IS 'User-edited version (NULL if not edited)';
COMMENT ON COLUMN summaries.metadata IS 'LLM metadata: model, tokens, generation time';

-- ============================================================================
-- MIGRATION V10: Update Triggers for updated_at
-- File: src/main/resources/db/migration/V10__create_update_triggers.sql
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blockers_updated_at BEFORE UPDATE ON blockers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_sync_updated_at BEFORE UPDATE ON integration_sync
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_sessions_updated_at BEFORE UPDATE ON focus_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA SCRIPT (Optional - for demo)
-- File: src/main/resources/db/migration/V11__seed_demo_data.sql
-- ============================================================================

-- Insert demo user (password: demo123)
-- BCrypt hash for "demo123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (email, name, password_hash) VALUES
('demo@devday.ai', 'Demo Developer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Get the demo user ID (will be 1 if this is first user)
-- For subsequent inserts, use: (SELECT id FROM users WHERE email = 'demo@devday.ai')

-- Insert sample manual tasks
INSERT INTO tasks (user_id, source, title, description, status, priority) VALUES
(1, 'MANUAL', 'Review pull request #42', 'Review authentication changes in PR #42', 'TODO', 'HIGH'),
(1, 'MANUAL', 'Update API documentation', 'Document new endpoints for focus sessions', 'TODO', 'MEDIUM'),
(1, 'MANUAL', 'Fix production bug', 'Users reporting timeout on login', 'IN_PROGRESS', 'URGENT');

-- Insert sample Jira tasks (will be created by sync, but can seed for demo)
INSERT INTO tasks (user_id, external_id, source, title, description, status, priority, metadata) VALUES
(1, 'AUTH-231', 'JIRA', 'Fix login timeout after 5 minutes', 'Users experiencing session timeout. Need to implement token refresh.', 'IN_PROGRESS', 'HIGH', 
 '{"jiraUrl": "https://jira.company.com/browse/AUTH-231", "assignee": "demo@devday.ai", "sprint": "Sprint 23"}'::jsonb),
(1, 'AUTH-232', 'JIRA', 'Add OAuth2 support', 'Implement OAuth2 authentication flow', 'TODO', 'MEDIUM',
 '{"jiraUrl": "https://jira.company.com/browse/AUTH-232", "assignee": "demo@devday.ai", "sprint": "Sprint 23"}'::jsonb);

-- Insert sample GitHub PRs
INSERT INTO tasks (user_id, external_id, source, title, description, status, priority, metadata) VALUES
(1, 'PR-82', 'GITHUB', 'Review: Payment webhook changes', 'Review payment webhook implementation', 'TODO', 'HIGH',
 '{"prUrl": "https://github.com/company/repo/pull/82", "author": "john.doe", "reviewers": ["demo@devday.ai"]}'::jsonb);

-- Insert sample calendar meeting
INSERT INTO tasks (user_id, external_id, source, title, description, status, priority, due_date, metadata) VALUES
(1, 'CAL-001', 'CALENDAR', 'Sprint Planning', 'Sprint 24 planning meeting', 'TODO', 'MEDIUM', 
 CURRENT_TIMESTAMP + INTERVAL '2 hours',
 '{"meetingTime": "2024-01-15T14:00:00Z", "duration": 60, "attendees": ["team@company.com"]}'::jsonb);

-- Insert sample integration sync records
INSERT INTO integration_sync (user_id, integration_type, last_sync_at, sync_status, items_synced) VALUES
(1, 'JIRA', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'SUCCESS', 2),
(1, 'GITHUB', CURRENT_TIMESTAMP - INTERVAL '10 minutes', 'SUCCESS', 1),
(1, 'CALENDAR', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 'SUCCESS', 1),
(1, 'TEAMS', CURRENT_TIMESTAMP - INTERVAL '20 minutes', 'SUCCESS', 0);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count tables
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Expected: 9 tables

-- Count indexes
SELECT COUNT(*) as index_count FROM pg_indexes WHERE schemaname = 'public';
-- Expected: 40+ indexes

-- Count enums
SELECT COUNT(*) as enum_count FROM pg_type WHERE typtype = 'e';
-- Expected: 11 enums

-- Verify demo user
SELECT id, email, name FROM users WHERE email = 'demo@devday.ai';

-- Verify demo tasks
SELECT id, source, title, status FROM tasks WHERE user_id = 1;

-- ============================================================================
-- ROLLBACK SCRIPTS (for development)
-- ============================================================================

-- DROP ALL TABLES (use with caution!)
/*
DROP TABLE IF EXISTS summaries CASCADE;
DROP TABLE IF EXISTS work_logs CASCADE;
DROP TABLE IF EXISTS focus_sessions CASCADE;
DROP TABLE IF EXISTS integration_sync CASCADE;
DROP TABLE IF EXISTS open_loops CASCADE;
DROP TABLE IF EXISTS blockers CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS summary_status CASCADE;
DROP TYPE IF EXISTS summary_type CASCADE;
DROP TYPE IF EXISTS work_log_type CASCADE;
DROP TYPE IF EXISTS focus_session_status CASCADE;
DROP TYPE IF EXISTS sync_status CASCADE;
DROP TYPE IF EXISTS integration_type CASCADE;
DROP TYPE IF EXISTS open_loop_priority CASCADE;
DROP TYPE IF EXISTS blocker_status CASCADE;
DROP TYPE IF EXISTS blocker_type CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_source CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Made with Bob
