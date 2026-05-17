# DevDay AI - Frontend-Backend Contract
## DELIVERABLE D: API Contract Specification

> **Purpose**: Single source of truth for frontend developers integrating with the backend

---

## 🌐 Base Configuration

### Base URL
```
Development: http://localhost:8080/api
Production: https://api.devday.ai/api
```

**Note**: All endpoints are prefixed with `/api` due to `server.servlet.context-path: /api` in application.yml

### Example Endpoint URLs
- Health: `http://localhost:8080/api/health`
- Login: `http://localhost:8080/api/auth/login`
- Today: `http://localhost:8080/api/today`

---

## 🔐 Authentication

### Header Format
All authenticated endpoints require JWT token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle
- **Expiration**: 24 hours (86400000 ms)
- **Refresh**: Not implemented in MVP (user must re-login)
- **Storage**: Frontend should store in httpOnly cookie or secure localStorage

### Public Endpoints (No Auth Required)
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

---

## 📦 Response Envelope

### Standard Success Response
**ALL endpoints** use this consistent envelope:

```json
{
  "data": {
    // Actual response data here
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Examples

**Single Resource**:
```json
{
  "data": {
    "id": 1,
    "email": "dev@example.com",
    "name": "John Developer"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**List of Resources**:
```json
{
  "data": {
    "items": [
      {"id": 1, "title": "Task 1"},
      {"id": 2, "title": "Task 2"}
    ],
    "total": 2
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Paginated Response**:
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## ❌ Error Response Format

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      "Specific validation error 1",
      "Specific validation error 2"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 401 | `TOKEN_EXPIRED` | JWT token has expired |
| 403 | `FORBIDDEN` | User lacks permission |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Business rule violation |
| 409 | `ACTIVE_SESSION_EXISTS` | Cannot start focus session (one already active) |
| 409 | `DUPLICATE_RESOURCE` | Resource already exists |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | External service (LLM, etc.) unavailable |

### Example Error Responses

**Validation Error (400)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      "Title is required",
      "Priority must be one of: LOW, MEDIUM, HIGH, URGENT"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Unauthorized (401)**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": ["Missing or invalid JWT token"]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Conflict (409)**:
```json
{
  "error": {
    "code": "ACTIVE_SESSION_EXISTS",
    "message": "Cannot start new focus session",
    "details": [
      "Active focus session already exists on task AUTH-231",
      "Complete, pause, or abandon current session first"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📄 Pagination Format

### Query Parameters
```
?page=1&size=20&sort=createdAt,desc
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `size` | integer | 20 | Items per page (max 100) |
| `sort` | string | varies | Sort field and direction |

### Response Format
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔑 Demo-Critical Endpoints

### 1. Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "dev@example.com",
  "name": "John Developer",
  "password": "securepass123"
}
```

**Response (201)**:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "dev@example.com",
      "name": "John Developer"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "dev@example.com",
  "password": "securepass123"
}
```

**Response (200)**: Same as register

---

### 2. Today Aggregation (CRITICAL)

#### Get Today View
```http
GET /api/today
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "data": {
    "date": "2024-01-15",
    "tasks": {
      "jira": [
        {
          "id": 1,
          "externalId": "AUTH-231",
          "title": "Fix login timeout after 5 minutes",
          "status": "IN_PROGRESS",
          "priority": "HIGH",
          "source": "JIRA",
          "metadata": {
            "jiraUrl": "https://jira.company.com/browse/AUTH-231"
          }
        }
      ],
      "github": [
        {
          "id": 2,
          "externalId": "PR-82",
          "title": "Review: Payment webhook changes",
          "status": "TODO",
          "priority": "HIGH",
          "source": "GITHUB",
          "metadata": {
            "prUrl": "https://github.com/company/repo/pull/82"
          }
        }
      ],
      "calendar": [
        {
          "id": 3,
          "externalId": "CAL-001",
          "title": "Sprint Planning",
          "status": "TODO",
          "priority": "MEDIUM",
          "source": "CALENDAR",
          "dueDate": "2024-01-15T14:00:00Z",
          "metadata": {
            "meetingTime": "2024-01-15T14:00:00Z",
            "duration": 60
          }
        }
      ],
      "teams": [],
      "manual": [
        {
          "id": 4,
          "title": "Update API documentation",
          "status": "TODO",
          "priority": "MEDIUM",
          "source": "MANUAL"
        }
      ]
    },
    "activeFocusSession": {
      "id": 10,
      "taskId": 1,
      "task": {
        "id": 1,
        "title": "Fix login timeout after 5 minutes"
      },
      "goal": "Complete authentication timeout fix",
      "plannedDurationMinutes": 90,
      "elapsedMinutes": 45,
      "status": "ACTIVE",
      "startedAt": "2024-01-15T09:00:00Z",
      "estimatedEndTime": "2024-01-15T10:30:00Z"
    },
    "recentWorkLogs": [
      {
        "id": 15,
        "logType": "HELPED_TEAMMATE",
        "title": "Helped junior dev with Docker setup",
        "durationMinutes": 30,
        "loggedAt": "2024-01-15T08:30:00Z"
      }
    ],
    "activeBlockers": [
      {
        "id": 8,
        "taskId": 5,
        "title": "Waiting for API documentation",
        "blockerType": "CLARIFICATION_NEEDED",
        "blockedSince": "2024-01-15T08:00:00Z"
      }
    ],
    "openLoops": [
      {
        "id": 3,
        "taskId": 1,
        "title": "Authentication timeout fix - paused",
        "resumeNote": "Need to check production logs",
        "priority": "HIGH",
        "createdAt": "2024-01-15T09:45:00Z"
      }
    ],
    "stats": {
      "totalTasks": 12,
      "completedToday": 3,
      "inProgress": 2,
      "blocked": 1
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. Focus Sessions (CRITICAL)

#### Start Focus Session
```http
POST /api/focus-sessions/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": 5,
  "goal": "Complete authentication timeout fix",
  "plannedDurationMinutes": 90
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 10,
    "taskId": 5,
    "task": {
      "id": 5,
      "title": "Fix login timeout after 5 minutes"
    },
    "goal": "Complete authentication timeout fix",
    "plannedDurationMinutes": 90,
    "status": "ACTIVE",
    "startedAt": "2024-01-15T10:00:00Z",
    "estimatedEndTime": "2024-01-15T11:30:00Z"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Error if session exists (409)**:
```json
{
  "error": {
    "code": "ACTIVE_SESSION_EXISTS",
    "message": "Cannot start new focus session",
    "details": ["Active session exists on task AUTH-231"]
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### Get Active Session
```http
GET /api/focus-sessions/active
Authorization: Bearer {token}
```

**Response (200)** - Session exists:
```json
{
  "data": {
    "id": 10,
    "taskId": 5,
    "goal": "Complete authentication timeout fix",
    "status": "ACTIVE",
    "elapsedMinutes": 45,
    "startedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:45:00Z"
}
```

**Response (200)** - No active session:
```json
{
  "data": null,
  "timestamp": "2024-01-15T10:45:00Z"
}
```

#### Complete Focus Session
```http
POST /api/focus-sessions/{id}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "outcome": "Fixed authentication timeout. Implemented token refresh with 30-second buffer.",
  "actualDurationMinutes": 85,
  "markTaskComplete": true
}
```

**Response (200)**:
```json
{
  "data": {
    "id": 10,
    "status": "COMPLETED",
    "completedAt": "2024-01-15T11:25:00Z",
    "outcome": "Fixed authentication timeout...",
    "taskCompleted": true
  },
  "timestamp": "2024-01-15T11:25:00Z"
}
```

---

### 4. Work Logs (CRITICAL)

#### Create Work Log
```http
POST /api/work-logs
Authorization: Bearer {token}
Content-Type: application/json

{
  "logType": "HELPED_TEAMMATE",
  "title": "Helped junior dev with Docker setup",
  "description": "Walked through Docker Compose configuration and troubleshooting",
  "durationMinutes": 30,
  "taskId": null
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 15,
    "logType": "HELPED_TEAMMATE",
    "title": "Helped junior dev with Docker setup",
    "description": "Walked through Docker Compose configuration...",
    "durationMinutes": 30,
    "loggedAt": "2024-01-15T11:30:00Z"
  },
  "timestamp": "2024-01-15T11:30:00Z"
}
```

**Valid Log Types**:
- `HELPED_TEAMMATE`
- `DEBUGGING`
- `RESEARCH`
- `DOCUMENTATION`
- `MEETING`
- `PRODUCTION_SUPPORT`
- `ARCHITECTURE`
- `OTHER`

---

### 5. Daily Summary (CRITICAL)

#### Generate Daily Summary
```http
POST /api/summaries/daily/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15"
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 20,
    "summaryType": "DAILY",
    "summaryDate": "2024-01-15",
    "aiGeneratedContent": "## Daily Summary - January 15, 2024\n\n### What I Worked On Today\n- Fixed authentication timeout issue (AUTH-231)\n- Reviewed payment webhook PR (#82)\n- Helped junior developer with Docker setup\n\n### Completed Work\n- Implemented token refresh mechanism\n- Added 30-second buffer for token expiration\n\n### In-Progress Work\n- Payment webhook review (PR #82)\n\n### Blockers\n- Waiting for API documentation for OAuth flow\n\n### Collaboration\n- Helped junior dev with Docker Compose (30 minutes)\n\n### Tomorrow's Plan\n- Complete payment webhook review\n- Start OAuth2 implementation",
    "editedContent": null,
    "status": "DRAFT",
    "metadata": {
      "model": "ibm/granite-13b-chat-v2",
      "provider": "watsonx",
      "tokensUsed": 450,
      "generatedAt": "2024-01-15T17:00:00Z"
    },
    "createdAt": "2024-01-15T17:00:00Z"
  },
  "timestamp": "2024-01-15T17:00:00Z"
}
```

#### Edit Summary
```http
PATCH /api/summaries/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "editedContent": "## Daily Summary - January 15, 2024\n\n[User's edited version]"
}
```

**Response (200)**:
```json
{
  "data": {
    "id": 20,
    "editedContent": "## Daily Summary...",
    "status": "EDITED",
    "updatedAt": "2024-01-15T17:15:00Z"
  },
  "timestamp": "2024-01-15T17:15:00Z"
}
```

#### Submit Summary
```http
POST /api/summaries/{id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "submittedTo": "team-lead@company.com"
}
```

**Response (200)**:
```json
{
  "data": {
    "id": 20,
    "status": "SUBMITTED",
    "submittedAt": "2024-01-15T17:20:00Z",
    "submittedTo": "team-lead@company.com"
  },
  "timestamp": "2024-01-15T17:20:00Z"
}
```

---

## 🌍 CORS Configuration

### Allowed Origins
```yaml
# application.yml
cors:
  allowed-origins:
    - http://localhost:3000  # React dev server
    - http://localhost:5173  # Vite dev server
    - https://devday.ai      # Production frontend
```

### Allowed Methods
- GET
- POST
- PATCH
- DELETE
- OPTIONS

### Allowed Headers
- Authorization
- Content-Type
- Accept

### Exposed Headers
- Authorization

### Credentials
- Allowed: `true`

---

## 📊 Common Data Types

### Task Object
```typescript
interface Task {
  id: number;
  userId: number;
  externalId?: string;  // e.g., "AUTH-231", "PR-82"
  source: 'JIRA' | 'GITHUB' | 'CALENDAR' | 'TEAMS' | 'MANUAL';
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;  // ISO 8601
  completedAt?: string;  // ISO 8601
  metadata?: Record<string, any>;  // Source-specific data
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

### Focus Session Object
```typescript
interface FocusSession {
  id: number;
  userId: number;
  taskId: number;
  task?: Task;  // Populated in responses
  goal: string;
  plannedDurationMinutes: number;
  actualDurationMinutes?: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;  // ISO 8601
  pausedAt?: string;  // ISO 8601
  completedAt?: string;  // ISO 8601
  outcome?: string;
  elapsedMinutes?: number;  // Calculated field
  estimatedEndTime?: string;  // ISO 8601
}
```

### Work Log Object
```typescript
interface WorkLog {
  id: number;
  userId: number;
  taskId?: number;
  logType: 'HELPED_TEAMMATE' | 'DEBUGGING' | 'RESEARCH' | 'DOCUMENTATION' | 
           'MEETING' | 'PRODUCTION_SUPPORT' | 'ARCHITECTURE' | 'OTHER';
  title: string;
  description?: string;
  durationMinutes: number;
  loggedAt: string;  // ISO 8601
}
```

---

## 🧪 Testing Recommendations

### Frontend Testing Checklist
- [ ] Handle 401 errors (redirect to login)
- [ ] Handle 409 conflicts (show user-friendly message)
- [ ] Handle 500 errors (show generic error, log to console)
- [ ] Parse response envelope correctly (`response.data.data`)
- [ ] Display validation errors from `error.details` array
- [ ] Implement token refresh or re-login on expiration
- [ ] Test pagination (page, size, hasNext, hasPrevious)
- [ ] Test CORS with actual frontend dev server

### Sample Frontend Code (React/TypeScript)

```typescript
// API client with error handling
async function apiCall<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`http://localhost:8080/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    // Handle error response
    throw new ApiError(
      json.error.code,
      json.error.message,
      json.error.details
    );
  }

  // Return data from envelope
  return json.data;
}

// Usage
const todayData = await apiCall<TodayResponse>('/today');
console.log(todayData.tasks.jira);  // Direct access to data
```

---

## 📝 Notes for Frontend Developers

1. **Always use the response envelope**: Access data via `response.data.data`, not `response.data`
2. **Handle null values**: `activeFocusSession` can be `null` if no session active
3. **Date formats**: All dates are ISO 8601 strings (use `new Date()` to parse)
4. **Enums are uppercase**: `JIRA`, `IN_PROGRESS`, `HIGH` (not `jira`, `in_progress`, `high`)
5. **Pagination is 1-indexed**: First page is `page=1`, not `page=0`
6. **Token expiration**: 24 hours - implement re-login flow
7. **CORS**: Ensure your dev server origin is in allowed origins list

---

## 🔗 Quick Links

- **Full API Reference**: See `API_QUICK_REFERENCE.md`
- **Database Schema**: See `DATABASE_SCHEMA.sql`
- **Implementation Plan**: See `REVISED_IMPLEMENTATION_PLAN.md`

---

**Last Updated**: 2024-01-15  
**Contract Version**: 1.0.0