# DevDay AI - API Quick Reference Guide
## Complete Backend API Catalog

> **Quick Navigation**: Use this as your implementation checklist and API reference during development

---

## 📊 API Implementation Status Tracker

| Phase | API # | Name | Endpoint | Priority | Status |
|-------|-------|------|----------|----------|--------|
| **Phase 1** | 1 | Project Setup | `/api/health` | CRITICAL | ⬜ Not Started |
| | 2 | Authentication | `/api/auth/*` | CRITICAL | ⬜ Not Started |
| | 3 | Task CRUD | `/api/tasks` | CRITICAL | ⬜ Not Started |
| **Phase 2** | 4 | Jira Mock | `/api/integrations/jira/*` | HIGH | ⬜ Not Started |
| | 5 | GitHub Mock | `/api/integrations/github/*` | HIGH | ⬜ Not Started |
| | 6 | Calendar/Teams Mock | `/api/integrations/calendar/*` | HIGH | ⬜ Not Started |
| **Phase 3** | 7 | Today Aggregation | `/api/today` | CRITICAL | ⬜ Not Started |
| | 8 | Task Status | `/api/tasks/{id}/status` | HIGH | ⬜ Not Started |
| | 9 | Task Search | `/api/tasks/search` | MEDIUM | ⬜ Not Started |
| **Phase 4** | 10 | Focus Start | `/api/focus-sessions/start` | CRITICAL | ⬜ Not Started |
| | 11 | Focus Pause | `/api/focus-sessions/{id}/pause` | HIGH | ⬜ Not Started |
| | 12 | Focus Complete | `/api/focus-sessions/{id}/complete` | HIGH | ⬜ Not Started |
| **Phase 5** | 13 | Work Logs | `/api/work-logs` | HIGH | ⬜ Not Started |
| | 14 | Blockers | `/api/blockers` | MEDIUM | ⬜ Not Started |
| | 15 | Open Loops | `/api/open-loops` | MEDIUM | ⬜ Not Started |
| **Phase 6** | 16 | LLM Service | Internal Service | CRITICAL | ⬜ Not Started |
| | 17 | Daily Summary | `/api/summaries/daily/*` | CRITICAL | ⬜ Not Started |
| | 18 | Weekly Summary | `/api/summaries/weekly/*` | HIGH | ⬜ Not Started |
| **Bonus** | 19 | BOB Integration | `/api/bob/webhook` | OPTIONAL | ⬜ Not Started |

---

## 🎯 Complete API Catalog

### Phase 1: Foundation APIs

#### API 1: Health Check
```
GET /api/health
Response: { "status": "UP", "database": "connected", "timestamp": "..." }
```

#### API 2: Authentication
```
POST /api/auth/register
Body: { "email": "dev@example.com", "name": "John", "password": "pass123" }
Response: { "token": "jwt...", "user": {...} }

POST /api/auth/login
Body: { "email": "dev@example.com", "password": "pass123" }
Response: { "token": "jwt...", "user": {...} }

GET /api/users/me
Headers: Authorization: Bearer {token}
Response: { "id": 1, "email": "...", "name": "..." }
```

#### API 3: Task CRUD
```
POST /api/tasks
Body: { "title": "Fix bug", "source": "MANUAL", "priority": "HIGH", "status": "TODO" }
Response: { "id": 1, "title": "...", "createdAt": "..." }

GET /api/tasks?status=TODO&source=MANUAL&page=1&size=20
Response: { "tasks": [...], "total": 5, "page": 1, "pageSize": 20 }

GET /api/tasks/{id}
Response: { "id": 1, "title": "...", "status": "..." }

PATCH /api/tasks/{id}
Body: { "title": "Updated title", "priority": "MEDIUM" }
Response: { "id": 1, "title": "Updated title", ... }

DELETE /api/tasks/{id}
Response: 204 No Content
```

---

### Phase 2: Integration APIs

#### API 4: Jira Integration
```
GET /api/integrations/jira/sync
Response: { "synced": 5, "status": "SUCCESS", "lastSync": "..." }

GET /api/integrations/jira/tasks
Response: { "tasks": [...], "total": 5 }
```

#### API 5: GitHub Integration
```
GET /api/integrations/github/sync
Response: { "synced": 3, "status": "SUCCESS", "lastSync": "..." }

GET /api/integrations/github/prs
Response: { "prs": [...], "total": 3 }
```

#### API 6: Calendar & Teams Integration
```
GET /api/integrations/calendar/sync
Response: { "synced": 2, "status": "SUCCESS" }

GET /api/integrations/teams/sync
Response: { "synced": 1, "status": "SUCCESS" }

GET /api/integrations/status
Response: {
  "jira": { "lastSync": "...", "status": "SUCCESS" },
  "github": { "lastSync": "...", "status": "SUCCESS" },
  "calendar": { "lastSync": "...", "status": "SUCCESS" },
  "teams": { "lastSync": "...", "status": "SUCCESS" }
}
```

---

### Phase 3: Today & Task Management APIs

#### API 7: Today Aggregation
```
GET /api/today
Response: {
  "date": "2024-01-15",
  "tasks": {
    "jira": [...],
    "github": [...],
    "calendar": [...],
    "teams": [...],
    "manual": [...]
  },
  "activeFocusSession": {...},
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

POST /api/today/refresh
Response: { "refreshed": true, "timestamp": "..." }
```

#### API 8: Task Status Management
```
PATCH /api/tasks/{id}/status
Body: { "status": "IN_PROGRESS", "note": "Starting work" }
Response: { "id": 1, "status": "IN_PROGRESS", "updatedAt": "..." }

POST /api/tasks/{id}/complete
Body: { "completionNote": "Fixed the issue" }
Response: { "id": 1, "status": "COMPLETED", "completedAt": "..." }

POST /api/tasks/{id}/block
Body: {
  "blockerTitle": "Waiting for API docs",
  "blockerDescription": "Need OAuth flow clarification",
  "blockerType": "CLARIFICATION_NEEDED"
}
Response: { "taskId": 1, "blocker": {...} }

POST /api/tasks/{id}/unblock
Body: { "blockerId": 5, "resolutionNote": "Received documentation" }
Response: { "taskId": 1, "status": "TODO" }
```

#### API 9: Task Search & Filtering
```
GET /api/tasks/search?q=authentication
Response: { "tasks": [...], "total": 3 }

GET /api/tasks/filter?status=IN_PROGRESS&source=JIRA&priority=HIGH
Response: { "tasks": [...], "total": 2 }

GET /api/tasks/due-today
Response: { "tasks": [...], "total": 4 }

GET /api/tasks/overdue
Response: { "tasks": [...], "total": 1 }
```

---

### Phase 4: Focus Session APIs

#### API 10: Focus Session Start
```
POST /api/focus-sessions/start
Body: {
  "taskId": 5,
  "goal": "Complete authentication timeout fix",
  "plannedDurationMinutes": 90
}
Response: {
  "id": 10,
  "task": {...},
  "goal": "Complete authentication timeout fix",
  "plannedDurationMinutes": 90,
  "status": "ACTIVE",
  "startedAt": "2024-01-15T10:00:00Z",
  "estimatedEndTime": "2024-01-15T11:30:00Z"
}

GET /api/focus-sessions/active
Response: { "focusSession": {...} } or { "focusSession": null }

GET /api/focus-sessions/{id}
Response: { "id": 10, "task": {...}, "status": "ACTIVE", ... }

GET /api/focus-sessions/history?page=1&size=10
Response: { "sessions": [...], "total": 25 }
```

#### API 11: Focus Session Pause & Resume
```
POST /api/focus-sessions/{id}/pause
Body: {
  "resumeNote": "Need to check production logs. Found potential race condition."
}
Response: {
  "id": 10,
  "status": "PAUSED",
  "pausedAt": "2024-01-15T10:45:00Z",
  "resumeNote": "Need to check production logs...",
  "openLoopCreated": true
}

POST /api/focus-sessions/{id}/resume
Response: {
  "id": 10,
  "status": "ACTIVE",
  "resumedAt": "2024-01-15T11:00:00Z"
}
```

#### API 12: Focus Session Complete & Switch Guard
```
POST /api/focus-sessions/{id}/complete
Body: {
  "outcome": "Fixed authentication timeout. Implemented token refresh with 30-second buffer.",
  "actualDurationMinutes": 85,
  "markTaskComplete": true
}
Response: {
  "id": 10,
  "status": "COMPLETED",
  "completedAt": "2024-01-15T11:25:00Z",
  "outcome": "...",
  "taskCompleted": true
}

POST /api/focus-sessions/{id}/abandon
Body: {
  "reason": "Higher priority issue came up"
}
Response: {
  "id": 10,
  "status": "ABANDONED",
  "abandonedAt": "2024-01-15T10:30:00Z",
  "openLoopCreated": true
}

POST /api/tasks/switch-guard
Body: {
  "currentTaskId": 5,
  "newTaskId": 8
}
Response: {
  "canSwitch": false,
  "reason": "Active focus session in progress",
  "activeFocusSession": {...},
  "options": [
    "COMPLETE_SESSION",
    "PAUSE_WITH_NOTE",
    "ABANDON_SESSION",
    "SWITCH_ANYWAY"
  ]
}
```

---

### Phase 5: Work Logging APIs

#### API 13: Work Logs
```
POST /api/work-logs
Body: {
  "logType": "HELPED_TEAMMATE",
  "title": "Helped junior dev with Docker setup",
  "description": "Walked through Docker Compose configuration",
  "durationMinutes": 30,
  "taskId": null
}
Response: {
  "id": 15,
  "logType": "HELPED_TEAMMATE",
  "title": "...",
  "durationMinutes": 30,
  "loggedAt": "2024-01-15T11:30:00Z"
}

GET /api/work-logs?page=1&size=20
Response: { "workLogs": [...], "total": 45 }

GET /api/work-logs/today
Response: { "workLogs": [...], "total": 5, "totalDurationMinutes": 180 }

GET /api/work-logs/{id}
Response: { "id": 15, "logType": "...", ... }
```

**Log Types**: HELPED_TEAMMATE, DEBUGGING, RESEARCH, DOCUMENTATION, MEETING, PRODUCTION_SUPPORT, ARCHITECTURE, OTHER

#### API 14: Blockers
```
POST /api/blockers
Body: {
  "taskId": 5,
  "title": "Waiting for API documentation",
  "description": "Need OAuth flow clarification from backend team",
  "blockerType": "CLARIFICATION_NEEDED"
}
Response: {
  "id": 8,
  "taskId": 5,
  "title": "...",
  "status": "ACTIVE",
  "blockedSince": "2024-01-15T10:00:00Z"
}

GET /api/blockers/active
Response: { "blockers": [...], "total": 2 }

PATCH /api/blockers/{id}/resolve
Body: {
  "resolutionNote": "Received documentation. OAuth flow clarified."
}
Response: {
  "id": 8,
  "status": "RESOLVED",
  "resolvedAt": "2024-01-15T14:00:00Z",
  "durationHours": 4
}

GET /api/blockers/history?page=1&size=20
Response: { "blockers": [...], "total": 15 }
```

**Blocker Types**: WAITING_ON_TEAM, TECHNICAL_ISSUE, EXTERNAL_DEPENDENCY, CLARIFICATION_NEEDED

#### API 15: Open Loops
```
GET /api/open-loops
Response: {
  "openLoops": [
    {
      "id": 3,
      "task": {...},
      "title": "Authentication timeout fix - paused",
      "context": "Found potential race condition",
      "resumeNote": "Need to check production logs",
      "priority": "HIGH",
      "createdAt": "2024-01-15T10:45:00Z"
    }
  ],
  "total": 3
}

POST /api/open-loops
Body: {
  "taskId": 5,
  "title": "Need to investigate edge case",
  "context": "Found during testing",
  "priority": "MEDIUM"
}
Response: { "id": 4, "title": "...", ... }

PATCH /api/open-loops/{id}/close
Body: {
  "resolutionNote": "Completed investigation"
}
Response: {
  "id": 3,
  "closedAt": "2024-01-15T15:00:00Z"
}

GET /api/open-loops/priority
Response: { "openLoops": [...] } // Sorted by priority
```

---

### Phase 6: AI Summary APIs

#### API 16: LLM Service (Internal)
This is an internal service, not a REST endpoint. Used by Summary APIs.

**Configuration**:
```yaml
llm:
  provider: openai  # or anthropic, watsonx
  openai:
    api-key: ${OPENAI_API_KEY}
    model: gpt-4-turbo-preview
    max-tokens: 2000
```

#### API 17: Daily Summary
```
POST /api/summaries/daily/generate
Body: {
  "date": "2024-01-15"
}
Response: {
  "id": 20,
  "summaryType": "DAILY",
  "summaryDate": "2024-01-15",
  "aiGeneratedContent": "## Daily Summary - January 15, 2024\n\n### What I Worked On\n...",
  "editedContent": null,
  "status": "DRAFT",
  "metadata": {
    "model": "gpt-4-turbo-preview",
    "tokensUsed": 450,
    "generatedAt": "2024-01-15T17:00:00Z"
  }
}

GET /api/summaries/daily/{date}
Response: { "id": 20, "summaryType": "DAILY", ... }

GET /api/summaries/daily/latest
Response: { "id": 20, "summaryType": "DAILY", ... }

PATCH /api/summaries/{id}
Body: {
  "editedContent": "## Daily Summary - January 15, 2024\n\n[User's edited version]"
}
Response: {
  "id": 20,
  "editedContent": "...",
  "status": "EDITED",
  "updatedAt": "2024-01-15T17:15:00Z"
}

POST /api/summaries/{id}/submit
Body: {
  "submittedTo": "team-lead@company.com"
}
Response: {
  "id": 20,
  "status": "SUBMITTED",
  "submittedAt": "2024-01-15T17:20:00Z",
  "submittedTo": "team-lead@company.com"
}
```

#### API 18: Weekly Summary
```
POST /api/summaries/weekly/generate
Body: {
  "weekStart": "2024-01-08"  // Monday of the week
}
Response: {
  "id": 25,
  "summaryType": "WEEKLY",
  "summaryDate": "2024-01-08",
  "aiGeneratedContent": "## Weekly Summary - Week of January 8, 2024\n\n### Main Outcomes\n...",
  "status": "DRAFT",
  "metadata": {
    "model": "gpt-4-turbo-preview",
    "tokensUsed": 650,
    "dailySummariesIncluded": 5
  }
}

GET /api/summaries/weekly/{weekStart}
Response: { "id": 25, "summaryType": "WEEKLY", ... }

GET /api/summaries/weekly/latest
Response: { "id": 25, "summaryType": "WEEKLY", ... }
```

---

### Bonus: IBM BOB Integration

#### API 19: BOB Webhook
```
POST /api/bob/webhook
Body: {
  "message": "I just helped Sarah with Docker for 30 minutes",
  "userId": "user123",
  "sessionId": "session456"
}
Response: {
  "response": "Got it! I've logged that you helped Sarah with Docker setup for 30 minutes.",
  "action": "WORK_LOG_CREATED",
  "workLogId": 42
}

POST /api/bob/intents/work-log
Body: {
  "message": "Spent 2 hours debugging authentication issue",
  "userId": "user123"
}
Response: {
  "workLog": {...},
  "response": "Logged 2 hours of debugging work on authentication."
}

POST /api/bob/intents/start-focus
Body: {
  "message": "Start focus session on AUTH-231 for 90 minutes",
  "userId": "user123"
}
Response: {
  "focusSession": {...},
  "response": "Focus session started on AUTH-231. I'll check in with you in 90 minutes."
}

POST /api/bob/intents/complete-task
Body: {
  "message": "Completed AUTH-231",
  "userId": "user123"
}
Response: {
  "task": {...},
  "response": "Great! Marked AUTH-231 as completed."
}
```

---

## 🔐 Authentication

All endpoints except `/api/health`, `/api/auth/register`, and `/api/auth/login` require JWT authentication.

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Common Response Formats

### Success Response
```json
{
  "data": {...},
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      "Title is required",
      "Priority must be HIGH, MEDIUM, or LOW"
    ]
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 🎯 HTTP Status Codes

- `200 OK` - Successful GET, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Business rule violation (e.g., active focus session exists)
- `500 Internal Server Error` - Server error

---

## 🧪 Testing Checklist

For each API:
- [ ] Happy path works
- [ ] Validation errors handled
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Database changes verified
- [ ] Error responses correct
- [ ] Performance acceptable
- [ ] Logging appropriate

---

## 📦 Postman Collection Structure

```
DevDay AI Backend
├── 1. Authentication
│   ├── Register
│   ├── Login
│   └── Get Current User
├── 2. Tasks
│   ├── Create Task
│   ├── Get All Tasks
│   ├── Get Task by ID
│   ├── Update Task
│   ├── Delete Task
│   ├── Update Status
│   ├── Complete Task
│   ├── Block Task
│   └── Search Tasks
├── 3. Integrations
│   ├── Sync Jira
│   ├── Sync GitHub
│   ├── Sync Calendar
│   ├── Sync Teams
│   └── Get Integration Status
├── 4. Today
│   ├── Get Today View
│   └── Refresh Today
├── 5. Focus Sessions
│   ├── Start Session
│   ├── Get Active Session
│   ├── Pause Session
│   ├── Resume Session
│   ├── Complete Session
│   ├── Abandon Session
│   └── Switch Guard
├── 6. Work Logs
│   ├── Create Work Log
│   ├── Get All Work Logs
│   └── Get Today's Work Logs
├── 7. Blockers
│   ├── Create Blocker
│   ├── Get Active Blockers
│   ├── Resolve Blocker
│   └── Get Blocker History
├── 8. Open Loops
│   ├── Get Open Loops
│   ├── Create Open Loop
│   ├── Close Open Loop
│   └── Get Priority Open Loops
├── 9. Summaries
│   ├── Generate Daily Summary
│   ├── Get Daily Summary
│   ├── Edit Summary
│   ├── Submit Summary
│   ├── Generate Weekly Summary
│   └── Get Weekly Summary
└── 10. BOB Integration (Optional)
    ├── BOB Webhook
    ├── Work Log Intent
    ├── Start Focus Intent
    └── Complete Task Intent
```

---

## 🚀 Quick Start Commands

### Start PostgreSQL
```bash
docker-compose up -d postgres
```

### Run Application
```bash
./mvnw spring-boot:run
```

### Run Tests
```bash
./mvnw test
```

### Build JAR
```bash
./mvnw clean package
```

### Check Health
```bash
curl http://localhost:8080/api/health
```

---

## 💡 Implementation Tips

1. **Start Simple**: Get basic CRUD working before adding complexity
2. **Test Early**: Test each endpoint immediately after implementation
3. **Mock First**: Use mock data for integrations, real integration later
4. **Log Everything**: Debug logs help during development
5. **Validate Input**: Use `@Valid` and custom validators
6. **Handle Errors**: Proper exception handling from the start
7. **Document As You Go**: Add API docs while fresh in mind
8. **Commit Often**: Commit after each working API
9. **Performance Matters**: Add indexes, optimize queries early
10. **Demo Data**: Prepare realistic mock data for impressive demo

---

**Remember**: This is your implementation roadmap. Check off each API as you complete it, and refer back to this guide whenever you need endpoint details or request/response formats.

Good luck! 🎯