# DevDay AI - API Testing Guide

## Quick Start

### 1. Start PostgreSQL
```bash
cd Backend
docker compose up -d
```

### 2. Run the Application
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

### 3. Test Health Endpoint
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2026-05-16T14:30:00Z"
}
```

---

## Authentication APIs

### Register a New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@devday.ai",
    "name": "Demo Developer",
    "password": "demo123"
  }'
```

Expected response:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "demo@devday.ai",
      "name": "Demo Developer"
    }
  },
  "timestamp": "2026-05-16T14:30:00Z"
}
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@devday.ai",
    "password": "demo123"
  }'
```

### Get Current User Profile
```bash
# Replace YOUR_TOKEN with the token from register/login response
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "data": {
    "id": 1,
    "email": "demo@devday.ai",
    "name": "Demo Developer"
  },
  "timestamp": "2026-05-16T14:30:00Z"
}
```

---

## Task APIs (Coming Soon)

### Create a Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix authentication timeout",
    "source": "MANUAL",
    "priority": "HIGH",
    "status": "TODO"
  }'
```

### Get All Tasks
```bash
curl -X GET "http://localhost:8080/api/tasks?page=1&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Task by ID
```bash
curl -X GET http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Task
```bash
curl -X PATCH http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

---

## Focus Session APIs (Coming Soon)

### Start Focus Session
```bash
curl -X POST http://localhost:8080/api/focus-sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "goal": "Complete authentication timeout fix",
    "plannedDurationMinutes": 90
  }'
```

### Get Active Focus Session
```bash
curl -X GET http://localhost:8080/api/focus-sessions/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complete Focus Session
```bash
curl -X POST http://localhost:8080/api/focus-sessions/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "Fixed authentication timeout. Implemented token refresh.",
    "actualDurationMinutes": 85,
    "markTaskComplete": true
  }'
```

---

## Work Log APIs (Coming Soon)

### Create Work Log
```bash
curl -X POST http://localhost:8080/api/work-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logType": "HELPED_TEAMMATE",
    "title": "Helped junior dev with Docker setup",
    "description": "Walked through Docker Compose configuration",
    "durationMinutes": 30
  }'
```

### Get Today's Work Logs
```bash
curl -X GET http://localhost:8080/api/work-logs/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Today Aggregation API (Coming Soon)

### Get Today View
```bash
curl -X GET http://localhost:8080/api/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response includes:
- All tasks from all sources (Jira, GitHub, Calendar, Teams, Manual)
- Active focus session
- Recent work logs
- Active blockers
- Open loops
- Daily statistics

---

## Error Responses

### Validation Error (400)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      "Email is required",
      "Password must be at least 6 characters"
    ]
  },
  "timestamp": "2026-05-16T14:30:00Z"
}
```

### Unauthorized (401)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication failed",
    "details": ["Missing or invalid JWT token"]
  },
  "timestamp": "2026-05-16T14:30:00Z"
}
```

### Not Found (404)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": ["Task with ID 999 not found"]
  },
  "timestamp": "2026-05-16T14:30:00Z"
}
```

---

## Implementation Status

- [x] API 1: Health Check
- [x] API 2: Authentication (register, login, get profile)
- [ ] API 3: Task CRUD
- [ ] API 7: Today Aggregation
- [ ] API 10: Focus Sessions
- [ ] API 13: Work Logs
- [ ] API 17: Daily Summary

---

## Next Steps

1. Implement Task CRUD operations
2. Add demo seed data
3. Implement Today aggregation endpoint
4. Add Focus Session management
5. Add Work Log tracking
6. Integrate AI summary generation

---

**Last Updated**: 2026-05-16