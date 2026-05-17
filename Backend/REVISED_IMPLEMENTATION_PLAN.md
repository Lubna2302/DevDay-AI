# DevDay AI Backend - REVISED Implementation Plan
## IBM BOB Hackathon - Execution Ready

> **CRITICAL**: This plan fixes all sequencing bugs, aligns with IBM BOB requirements, and is designed for ONE CHAT PER API workflow.

---

## 📋 Executive Summary (5 Key Points)

1. **Sequencing Fixed**: Blocker and OpenLoop entities now created in API 3B (before APIs 8 & 11 need them)
2. **IBM BOB Prioritized**: API 19 elevated to "Must Have" with complete webhook spec, intent mapping, and demo integration
3. **LLM Provider Clarified**: Primary = IBM watsonx.ai (hackathon alignment), fallback = OpenAI, template-based if no API key
4. **Complete SQL Delivered**: Full Flyway migrations with indexes, constraints, and seed data script included
5. **One-Chat-Per-API**: Every API has self-contained prompt in CHAT_SESSION_GUIDE.md with handoff blocks

---

## 🗓️ DELIVERABLE A: Revised Implementation Roadmap (3-4 Days)

### Day 1: Foundation & Core Entities (8-10 hours)
**Goal**: Database, auth, and all entity foundations ready

| Time | API | Task | Hours | Must/Should/Cut |
|------|-----|------|-------|-----------------|
| 09:00 | API 1 | Project setup, Docker, health endpoint | 1.5 | **MUST** |
| 10:30 | API 2 | User entity, JWT auth, login/register | 2.0 | **MUST** |
| 12:30 | *Lunch* | | 0.5 | |
| 13:00 | API 3 | Task entity, CRUD, pagination | 2.0 | **MUST** |
| 15:00 | API 3B | Blocker & OpenLoop entities (tables only) | 1.0 | **MUST** |
| 16:00 | API 4 | Jira mock adapter with sync | 1.5 | **MUST** |
| 17:30 | *End Day 1* | Commit, test all endpoints | 0.5 | |

**Day 1 Deliverables**:
- ✅ Spring Boot app running on port 8080
- ✅ PostgreSQL with 5 tables: users, tasks, blockers, open_loops, integration_sync
- ✅ JWT auth working (register, login, /me)
- ✅ Task CRUD with pagination
- ✅ Jira mock sync (5-10 tasks imported)

---

### Day 2: Integrations & Today View (8-10 hours)
**Goal**: Complete data aggregation and focus sessions

| Time | API | Task | Hours | Must/Should/Cut |
|------|-----|------|-------|-----------------|
| 09:00 | API 5 | GitHub mock adapter with PRs | 1.0 | **MUST** |
| 10:00 | API 6 | Calendar & Teams mock adapters | 1.5 | **MUST** |
| 11:30 | API 7 | Today aggregation service | 2.0 | **MUST** |
| 13:30 | *Lunch* | | 0.5 | |
| 14:00 | API 8 | Task status transitions (uses blockers) | 1.5 | **MUST** |
| 15:30 | API 10 | Focus session start & management | 2.0 | **MUST** |
| 17:30 | *End Day 2* | Test Today page, focus flow | 0.5 | |

**Day 2 Deliverables**:
- ✅ All 4 mock integrations syncing
- ✅ GET /api/today returns aggregated view < 500ms
- ✅ Task status transitions with blocker creation
- ✅ Focus session start (single active session enforced)

---

### Day 3: Focus, Logging & AI (8-10 hours)
**Goal**: Complete focus lifecycle and AI summaries

| Time | API | Task | Hours | Must/Should/Cut |
|------|-----|------|-------|-----------------|
| 09:00 | API 11 | Focus pause/resume (creates open loops) | 1.5 | **MUST** |
| 10:30 | API 12 | Focus complete & switch guard | 1.5 | **MUST** |
| 12:00 | *Lunch* | | 0.5 | |
| 12:30 | API 13 | Work logs with categories | 1.5 | **MUST** |
| 14:00 | API 16 | LLM service (watsonx + OpenAI fallback) | 2.0 | **MUST** |
| 16:00 | API 17 | Daily summary generate/edit/submit | 2.0 | **MUST** |
| 18:00 | *End Day 3* | Test AI summaries | 0.5 | |

**Day 3 Deliverables**:
- ✅ Complete focus session lifecycle
- ✅ Switch guard prevents task jumping
- ✅ Work logs with 8 categories
- ✅ AI daily summary generation < 3 seconds
- ✅ Edit and submit workflow

---

### Day 4: Polish, BOB & Demo Prep (6-8 hours)
**Goal**: IBM BOB integration and demo readiness

| Time | API | Task | Hours | Must/Should/Cut |
|------|-----|------|-------|-----------------|
| 09:00 | API 14 | Blocker management endpoints | 1.0 | Should Have |
| 10:00 | API 15 | Open loops management endpoints | 1.0 | Should Have |
| 11:00 | API 19 | IBM BOB webhook & intents | 2.5 | **MUST** (IBM event) |
| 13:30 | *Lunch* | | 0.5 | |
| 14:00 | Demo Prep | Seed data, test flow, Postman collection | 2.0 | **MUST** |
| 16:00 | Polish | Error messages, logging, edge cases | 1.0 | Should Have |
| 17:00 | *Final Test* | End-to-end demo rehearsal | 1.0 | **MUST** |

**Day 4 Deliverables**:
- ✅ IBM BOB webhook receiving messages
- ✅ Natural language work logging via BOB
- ✅ Complete demo flow tested
- ✅ Seed data script ready

---

### Cut List (If Behind Schedule)

**Priority 1 - Cut First** (saves 2-3 hours):
- API 9: Task search & filtering (use basic GET /api/tasks with filters)
- API 18: Weekly summary generation
- Blocker history endpoint (keep create/resolve only)
- Open loop priority sorting endpoint

**Priority 2 - Simplify** (saves 1-2 hours):
- API 8: Remove auto-blocker creation, make it manual only
- API 11: Remove auto-open-loop creation, make it manual only
- Reduce mock data from 10 to 5 items per source

**Priority 3 - Template Fallback** (if LLM fails):
- Use template-based summaries instead of AI if API issues

---

## 📊 DELIVERABLE B: Updated API Sequence (19 APIs + 1 Entity-Only)

### API 1: Project Setup & Health Check
**Chat Title**: "API 1: Spring Boot Project Setup with PostgreSQL and Health Endpoint"

**Prerequisites**: None (bootstrap)

**Entities/Tables**: None yet (Flyway setup only)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check with DB status |

**Success Criteria**:
1. Spring Boot 3.2.x app starts on port 8080
2. PostgreSQL connects via Docker
3. GET /api/health returns `{"status":"UP","database":"connected"}`
4. Flyway migrations run successfully

**Estimated Hours**: 1.5

**Files Created**:
- `pom.xml` with dependencies
- `src/main/java/com/devday/DevDayApplication.java`
- `src/main/resources/application.yml`
- `docker-compose.yml`
- `src/main/resources/db/migration/V1__init_schema.sql`

---

### API 2: User Management & JWT Authentication
**Chat Title**: "API 2: User Entity and JWT Authentication System"

**Prerequisites**: API 1 complete

**Entities/Tables**: 
- `users` table (Flyway V2)
- User entity

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT |
| GET | /api/users/me | Get current user profile |

**Success Criteria**:
1. User can register with email/password
2. Login returns JWT token (24h expiration)
3. Protected endpoints require valid JWT
4. BCrypt password hashing works

**Estimated Hours**: 2.0

**Files Created**:
- `V2__create_users_table.sql`
- `com.devday.model.entity.User`
- `com.devday.repository.UserRepository`
- `com.devday.service.UserService`
- `com.devday.controller.AuthController`
- `com.devday.config.SecurityConfig`
- `com.devday.security.JwtTokenProvider`

---

### API 3: Task Entity & CRUD Operations
**Chat Title**: "API 3: Task Entity with Full CRUD and Pagination"

**Prerequisites**: API 2 complete

**Entities/Tables**:
- `tasks` table (Flyway V3)
- Task entity with enums (TaskStatus, TaskSource, TaskPriority)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/tasks | Create manual task |
| GET | /api/tasks | Get all tasks (paginated, filtered) |
| GET | /api/tasks/{id} | Get single task |
| PATCH | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |

**Success Criteria**:
1. CRUD operations work for manual tasks
2. Pagination works (page, size params)
3. Filtering by status, source, priority
4. Unique constraint on (user_id, source, external_id)

**Estimated Hours**: 2.0

**Files Created**:
- `V3__create_tasks_table.sql`
- `com.devday.model.entity.Task`
- `com.devday.model.enums.TaskStatus`
- `com.devday.model.enums.TaskSource`
- `com.devday.model.enums.TaskPriority`
- `com.devday.repository.TaskRepository`
- `com.devday.service.TaskService`
- `com.devday.controller.TaskController`

---

### API 3B: Blocker & OpenLoop Entities (Tables Only)
**Chat Title**: "API 3B: Create Blocker and OpenLoop Entity Foundations"

**Prerequisites**: API 3 complete

**Entities/Tables**:
- `blockers` table (Flyway V4)
- `open_loops` table (Flyway V5)
- Blocker entity
- OpenLoop entity
- Enums: BlockerType, BlockerStatus

**Endpoints**: NONE (entity-only milestone)

**Success Criteria**:
1. Blocker table created with indexes
2. OpenLoop table created with indexes
3. Entities and repositories exist
4. No service/controller yet (added in APIs 14-15)

**Estimated Hours**: 1.0

**Why This Exists**: APIs 8 and 11 will auto-create blockers and open loops, so tables must exist first.

**Files Created**:
- `V4__create_blockers_table.sql`
- `V5__create_open_loops_table.sql`
- `com.devday.model.entity.Blocker`
- `com.devday.model.entity.OpenLoop`
- `com.devday.model.enums.BlockerType`
- `com.devday.model.enums.BlockerStatus`
- `com.devday.repository.BlockerRepository`
- `com.devday.repository.OpenLoopRepository`

---

### API 4: Jira Mock Adapter
**Chat Title**: "API 4: Jira Mock Adapter with Realistic Task Sync"

**Prerequisites**: API 3B complete

**Entities/Tables**:
- `integration_sync` table (Flyway V6)
- IntegrationSync entity

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/integrations/jira/sync | Sync Jira tasks (mock) |
| GET | /api/integrations/jira/tasks | Get synced Jira tasks |

**Success Criteria**:
1. Mock adapter returns 5-10 realistic Jira tasks
2. Sync imports tasks with source=JIRA
3. Duplicate prevention by external_id
4. IntegrationSync tracks last sync time

**Estimated Hours**: 1.5

**Mock Data Example**:
```json
{
  "externalId": "AUTH-231",
  "title": "Fix login timeout after 5 minutes",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "metadata": {"jiraUrl": "https://jira.company.com/browse/AUTH-231"}
}
```

**Files Created**:
- `V6__create_integration_sync_table.sql`
- `com.devday.adapter.JiraAdapter`
- `com.devday.service.McpIntegrationService`
- `com.devday.controller.IntegrationController`

---

### API 5: GitHub Mock Adapter
**Chat Title**: "API 5: GitHub Mock Adapter for Pull Requests"

**Prerequisites**: API 4 complete

**Entities/Tables**: Uses existing `tasks` and `integration_sync`

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/integrations/github/sync | Sync GitHub PRs (mock) |
| GET | /api/integrations/github/prs | Get synced PRs |

**Success Criteria**:
1. Mock adapter returns 3-5 realistic PRs
2. PRs stored with source=GITHUB
3. PR metadata in JSONB field (url, reviewers)

**Estimated Hours**: 1.0

**Files Created**:
- `com.devday.adapter.GitHubAdapter`

---

### API 6: Calendar & Teams Mock Adapters
**Chat Title**: "API 6: Calendar and Teams Mock Adapters"

**Prerequisites**: API 5 complete

**Entities/Tables**: Uses existing `tasks` and `integration_sync`

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/integrations/calendar/sync | Sync calendar meetings (mock) |
| GET | /api/integrations/teams/sync | Sync Teams messages (mock) |
| GET | /api/integrations/status | Get all integration statuses |

**Success Criteria**:
1. Calendar adapter returns 2-3 meetings with task_type=MEETING
2. Teams adapter returns 1-2 action items with task_type=TEAMS_MESSAGE
3. Status endpoint shows last sync for all 4 sources

**Estimated Hours**: 1.5

**Files Created**:
- `com.devday.adapter.CalendarAdapter`
- `com.devday.adapter.TeamsAdapter`

---

### API 7: Today Aggregation Service
**Chat Title**: "API 7: Today Page Aggregation Endpoint"

**Prerequisites**: API 6 complete

**Entities/Tables**: None (reads from existing tables)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/today | Get today's aggregated view |
| POST | /api/today/refresh | Trigger sync of all integrations |

**Success Criteria**:
1. Single endpoint returns tasks from all 5 sources
2. Includes active focus session (if any)
3. Includes recent work logs (today)
4. Includes active blockers
5. Includes open loops
6. Response time < 500ms

**Estimated Hours**: 2.0

**Response Schema**:
```json
{
  "date": "2024-01-15",
  "tasks": {
    "jira": [...],
    "github": [...],
    "calendar": [...],
    "teams": [...],
    "manual": [...]
  },
  "activeFocusSession": {...} or null,
  "recentWorkLogs": [...],
  "activeBlockers": [...],
  "openLoops": [...],
  "stats": {
    "totalTasks": 12,
    "completedToday": 3,
    "inProgress": 2,
    "blocked": 1
  }
}
```

**Files Created**:
- `com.devday.service.TodayService`
- `com.devday.controller.TodayController`
- `com.devday.model.dto.response.TodayResponse`

---

### API 8: Task Status Management
**Chat Title**: "API 8: Task Status Transitions with Blocker Creation"

**Prerequisites**: API 7 complete, API 3B entities exist

**Entities/Tables**: Uses `tasks`, `blockers` (from API 3B)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| PATCH | /api/tasks/{id}/status | Update task status |
| POST | /api/tasks/{id}/complete | Mark task complete |
| POST | /api/tasks/{id}/block | Block task (creates blocker) |
| POST | /api/tasks/{id}/unblock | Unblock task (resolves blocker) |

**Success Criteria**:
1. Status transitions validated (TODO → IN_PROGRESS → COMPLETED)
2. Invalid transitions rejected (e.g., TODO → COMPLETED)
3. Block endpoint creates Blocker record
4. Unblock resolves blocker and sets task to TODO

**Estimated Hours**: 1.5

**State Machine**:
- TODO → IN_PROGRESS ✓
- IN_PROGRESS → COMPLETED ✓
- IN_PROGRESS → BLOCKED ✓
- BLOCKED → TODO (via unblock) ✓
- TODO → COMPLETED ✗ (must go through IN_PROGRESS)

**Files Created**:
- Updates `TaskService` with status logic
- Updates `TaskController` with new endpoints

---

### API 9: Task Search & Filtering (OPTIONAL - CUT IF BEHIND)
**Chat Title**: "API 9: Advanced Task Search and Filtering"

**Prerequisites**: API 8 complete

**Entities/Tables**: Uses `tasks` with indexes

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks/search?q={query} | Full-text search |
| GET | /api/tasks/filter?status=&source= | Multi-criteria filter |
| GET | /api/tasks/due-today | Tasks due today |
| GET | /api/tasks/overdue | Overdue tasks |

**Success Criteria**:
1. Search works on title and description
2. Filters combine (AND logic)
3. Query performance < 200ms

**Estimated Hours**: 1.5

**CUT STRATEGY**: Use basic GET /api/tasks with query params instead

---

### API 10: Focus Session Start & Management
**Chat Title**: "API 10: Focus Session Lifecycle - Start and Active Session"

**Prerequisites**: API 8 complete

**Entities/Tables**:
- `focus_sessions` table (Flyway V7)
- FocusSession entity
- Enum: FocusSessionStatus

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/focus-sessions/start | Start new focus session |
| GET | /api/focus-sessions/active | Get active session |
| GET | /api/focus-sessions/{id} | Get session by ID |
| GET | /api/focus-sessions/history | Get session history |

**Success Criteria**:
1. Only ONE active session per user enforced
2. Starting new session when one exists returns 409 Conflict
3. Duration presets: 25, 45, 90 minutes
4. Elapsed time calculated correctly

**Estimated Hours**: 2.0

**Files Created**:
- `V7__create_focus_sessions_table.sql`
- `com.devday.model.entity.FocusSession`
- `com.devday.model.enums.FocusSessionStatus`
- `com.devday.repository.FocusSessionRepository`
- `com.devday.service.FocusSessionService`
- `com.devday.controller.FocusSessionController`

---

### API 11: Focus Session Pause & Resume
**Chat Title**: "API 11: Focus Session Pause/Resume with Open Loop Creation"

**Prerequisites**: API 10 complete, API 3B entities exist

**Entities/Tables**: Uses `focus_sessions`, `open_loops` (from API 3B)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/focus-sessions/{id}/pause | Pause session (creates open loop) |
| POST | /api/focus-sessions/{id}/resume | Resume paused session |

**Success Criteria**:
1. Pause requires mandatory resume_note
2. Pause creates OpenLoop record automatically
3. Resume updates session status to ACTIVE
4. Multiple pause/resume cycles supported

**Estimated Hours**: 1.5

**Files Created**:
- Updates `FocusSessionService` with pause/resume logic

---

### API 12: Focus Session Complete & Switch Guard
**Chat Title**: "API 12: Focus Session Completion and Task Switch Guard"

**Prerequisites**: API 11 complete

**Entities/Tables**: Uses `focus_sessions`, `tasks`

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/focus-sessions/{id}/complete | Complete session |
| POST | /api/focus-sessions/{id}/abandon | Abandon session (creates open loop) |
| POST | /api/tasks/switch-guard | Validate task switch |

**Success Criteria**:
1. Complete requires outcome note
2. Complete can optionally mark task as COMPLETED
3. Abandon creates OpenLoop automatically
4. Switch guard returns 409 if active session exists
5. Switch guard offers options: COMPLETE, PAUSE, ABANDON, SWITCH_ANYWAY

**Estimated Hours**: 1.5

**Switch Guard Response**:
```json
{
  "canSwitch": false,
  "reason": "Active focus session in progress on task AUTH-231",
  "activeFocusSession": {...},
  "options": [
    "COMPLETE_SESSION",
    "PAUSE_WITH_NOTE",
    "ABANDON_SESSION",
    "SWITCH_ANYWAY"
  ]
}
```

**Files Created**:
- Updates `FocusSessionService` with complete/abandon logic
- Updates `TaskController` with switch-guard endpoint

---

### API 13: Work Log Creation
**Chat Title**: "API 13: Manual Work Logging with Categories"

**Prerequisites**: API 12 complete

**Entities/Tables**:
- `work_logs` table (Flyway V8)
- WorkLog entity
- Enum: WorkLogType

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/work-logs | Create work log |
| GET | /api/work-logs | Get all work logs (paginated) |
| GET | /api/work-logs/today | Get today's work logs |
| GET | /api/work-logs/{id} | Get single work log |

**Success Criteria**:
1. All 8 log types supported
2. Duration tracking in minutes
3. Optional task association
4. Today's logs retrievable with total duration

**Estimated Hours**: 1.5

**Log Types**:
- HELPED_TEAMMATE
- DEBUGGING
- RESEARCH
- DOCUMENTATION
- MEETING
- PRODUCTION_SUPPORT
- ARCHITECTURE
- OTHER

**Files Created**:
- `V8__create_work_logs_table.sql`
- `com.devday.model.entity.WorkLog`
- `com.devday.model.enums.WorkLogType`
- `com.devday.repository.WorkLogRepository`
- `com.devday.service.WorkLogService`
- `com.devday.controller.WorkLogController`

---

### API 14: Blocker Management (SHOULD HAVE)
**Chat Title**: "API 14: Blocker Tracking and Resolution Endpoints"

**Prerequisites**: API 13 complete, API 3B entities exist

**Entities/Tables**: Uses `blockers` (from API 3B)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/blockers | Create blocker manually |
| GET | /api/blockers/active | Get active blockers |
| PATCH | /api/blockers/{id}/resolve | Resolve blocker |
| GET | /api/blockers/history | Get blocker history (CUT IF BEHIND) |

**Success Criteria**:
1. Manual blocker creation works
2. Active blockers retrievable
3. Resolution tracks duration
4. Blocker types: WAITING_ON_TEAM, TECHNICAL_ISSUE, EXTERNAL_DEPENDENCY, CLARIFICATION_NEEDED

**Estimated Hours**: 1.0

**Files Created**:
- `com.devday.service.BlockerService`
- `com.devday.controller.BlockerController`

---

### API 15: Open Loops Management (SHOULD HAVE)
**Chat Title**: "API 15: Open Loops Tracking and Closure"

**Prerequisites**: API 14 complete, API 3B entities exist

**Entities/Tables**: Uses `open_loops` (from API 3B)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/open-loops | Get all open loops |
| POST | /api/open-loops | Create open loop manually |
| PATCH | /api/open-loops/{id}/close | Close open loop |
| GET | /api/open-loops/priority | Get priority-sorted loops (CUT IF BEHIND) |

**Success Criteria**:
1. Auto-created loops from pause/abandon visible
2. Manual creation supported
3. Closure workflow works
4. Priority sorting (HIGH, MEDIUM, LOW)

**Estimated Hours**: 1.0

**Files Created**:
- `com.devday.service.OpenLoopService`
- `com.devday.controller.OpenLoopController`

---

### API 16: LLM Service Integration
**Chat Title**: "API 16: LLM Service with IBM watsonx.ai and OpenAI Fallback"

**Prerequisites**: API 15 complete

**Entities/Tables**: None (service only)

**Endpoints**: None (internal service)

**Success Criteria**:
1. Primary provider: IBM watsonx.ai (for hackathon scoring)
2. Fallback provider: OpenAI GPT-4
3. Template-based fallback if no API key
4. Prompt templates for daily/weekly summaries
5. Token usage tracking

**Estimated Hours**: 2.0

**Configuration**:
```yaml
llm:
  provider: watsonx  # or openai
  watsonx:
    api-key: ${WATSONX_API_KEY}
    url: ${WATSONX_URL:https://us-south.ml.cloud.ibm.com}
    project-id: ${WATSONX_PROJECT_ID}
    model: ibm/granite-13b-chat-v2
  openai:
    api-key: ${OPENAI_API_KEY}
    model: gpt-4-turbo-preview
  fallback-to-template: true
```

**Prompt Template (Daily)**:
```
Generate a professional daily standup summary for {date}.

Context:
- Completed Tasks: {completedTasks}
- In-Progress Tasks: {inProgressTasks}
- Work Logs: {workLogs}
- Active Blockers: {blockers}
- Focus Sessions: {focusSessions}

Format as markdown with sections:
1. What I Worked On Today
2. Completed Work
3. In-Progress Work
4. Blockers
5. Collaboration & Support
6. Tomorrow's Plan

Keep it professional, concise, and outcome-focused.
```

**Files Created**:
- `com.devday.service.LlmService` (interface)
- `com.devday.service.impl.WatsonxLlmService`
- `com.devday.service.impl.OpenAiLlmService`
- `com.devday.service.impl.TemplateLlmService`
- `com.devday.config.LlmConfig`

---

### API 17: Daily Summary Generation
**Chat Title**: "API 17: Daily AI Summary Generation with Edit and Submit"

**Prerequisites**: API 16 complete

**Entities/Tables**:
- `summaries` table (Flyway V9)
- Summary entity
- Enums: SummaryType, SummaryStatus

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/summaries/daily/generate | Generate daily summary |
| GET | /api/summaries/daily/{date} | Get summary by date |
| GET | /api/summaries/daily/latest | Get latest daily summary |
| PATCH | /api/summaries/{id} | Edit summary content |
| POST | /api/summaries/{id}/submit | Submit summary to team lead |

**Success Criteria**:
1. AI generates quality summary < 3 seconds
2. Summary includes all work from the day
3. Edit workflow updates edited_content field
4. Submit workflow tracks submission time and recipient
5. Status transitions: DRAFT → EDITED → SUBMITTED

**Estimated Hours**: 2.0

**Files Created**:
- `V9__create_summaries_table.sql`
- `com.devday.model.entity.Summary`
- `com.devday.model.enums.SummaryType`
- `com.devday.model.enums.SummaryStatus`
- `com.devday.repository.SummaryRepository`
- `com.devday.service.SummaryService`
- `com.devday.controller.SummaryController`

---

### API 18: Weekly Summary Generation (CUT IF BEHIND)
**Chat Title**: "API 18: Weekly AI Summary Aggregation"

**Prerequisites**: API 17 complete

**Entities/Tables**: Uses `summaries`

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/summaries/weekly/generate | Generate weekly summary |
| GET | /api/summaries/weekly/{weekStart} | Get summary by week |
| GET | /api/summaries/weekly/latest | Get latest weekly summary |

**Success Criteria**:
1. Aggregates 7 days of data
2. Higher-level perspective (outcomes, not tasks)
3. Includes weekly trends

**Estimated Hours**: 1.5

**CUT STRATEGY**: Skip if behind schedule; daily summaries are sufficient for demo

---

### API 19: IBM BOB Integration (MUST HAVE FOR IBM HACKATHON)
**Chat Title**: "API 19: IBM BOB Webhook Integration with Intent Mapping"

**Prerequisites**: API 17 complete (API 18 optional)

**Entities/Tables**: None (uses existing services)

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/bob/webhook | Main BOB webhook receiver |
| POST | /api/bob/intents/work-log | Work log intent handler |
| POST | /api/bob/intents/start-focus | Start focus intent handler |
| POST | /api/bob/intents/complete-task | Complete task intent handler |
| POST | /api/bob/intents/add-blocker | Add blocker intent handler |

**Success Criteria**:
1. Webhook receives BOB messages
2. Intent parsing routes to correct handler
3. Natural language work log creation
4. Conversational responses
5. BOB userId maps to JWT user

**Estimated Hours**: 2.5

**Intent Mapping**:
- "I helped Sarah with Docker for 30 minutes" → WORK_LOG
- "Start focus on AUTH-231 for 90 minutes" → START_FOCUS
- "Completed AUTH-231" → COMPLETE_TASK
- "Blocked on API documentation" → ADD_BLOCKER

**Files Created**:
- `com.devday.service.BobIntegrationService`
- `com.devday.controller.BobWebhookController`
- `com.devday.model.dto.request.BobWebhookRequest`
- `com.devday.model.dto.response.BobWebhookResponse`
- `com.devday.config.BobConfig`

**See DELIVERABLE E for complete BOB spec**

---

## 📊 API Dependency Graph

```
API 1 (Setup)
  └─> API 2 (Auth)
       └─> API 3 (Tasks)
            └─> API 3B (Blocker/OpenLoop Entities) *** CRITICAL DEPENDENCY ***
                 ├─> API 4 (Jira)
                 │    └─> API 5 (GitHub)
                 │         └─> API 6 (Calendar/Teams)
                 │              └─> API 7 (Today)
                 │                   └─> API 8 (Task Status - uses Blockers)
                 │                        ├─> API 9 (Search - OPTIONAL)
                 │                        └─> API 10 (Focus Start)
                 │                             └─> API 11 (Focus Pause - uses OpenLoops)
                 │                                  └─> API 12 (Focus Complete)
                 │                                       └─> API 13 (Work Logs)
                 │                                            ├─> API 14 (Blocker Mgmt)
                 │                                            └─> API 15 (OpenLoop Mgmt)
                 │                                                 └─> API 16 (LLM)
                 │                                                      └─> API 17 (Daily Summary)
                 │                                                           ├─> API 18 (Weekly - OPTIONAL)
                 │                                                           └─> API 19 (BOB - MUST HAVE)
```

---

## 🎯 Must Have / Should Have / Cut Summary

### MUST HAVE (Demo Critical)
- APIs 1-8: Foundation through task status
- API 10-13: Focus sessions and work logs
- API 16-17: LLM and daily summaries
- **API 19: IBM BOB integration** (elevated for IBM hackathon)

### SHOULD HAVE (Demo Polish)
- API 14-15: Blocker and open loop management endpoints
- API 3B: Entity foundations (MUST for sequencing, but no endpoints)

### CUT IF BEHIND
- API 9: Task search (use basic filtering)
- API 18: Weekly summaries
- Blocker/OpenLoop history endpoints
- Priority sorting endpoints

---
