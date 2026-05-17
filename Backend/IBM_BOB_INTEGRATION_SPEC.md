# IBM BOB Integration Specification
## DELIVERABLE E: Complete BOB Webhook & Intent Mapping

> **Priority**: MUST HAVE for IBM BOB Hackathon  
> **Purpose**: Enable natural language work logging and task management via IBM BOB conversational interface

---

## 🎯 Overview

IBM BOB (Build on Bedrock) integration allows developers to interact with DevDay AI using natural language through a conversational interface. Users can log work, start focus sessions, complete tasks, and add blockers without leaving their chat environment.

### Key Features
1. **Natural Language Work Logging**: "I helped Sarah with Docker for 30 minutes"
2. **Focus Session Control**: "Start focus on AUTH-231 for 90 minutes"
3. **Task Management**: "Completed AUTH-231" or "Mark AUTH-231 as blocked"
4. **Blocker Reporting**: "Blocked on API documentation"

---

## 🔌 Webhook Endpoint

### Main Webhook Receiver
```http
POST /api/bob/webhook
Content-Type: application/json
Authorization: Bearer {jwt_token}  // OR use BOB userId mapping
```

**Request Body**:
```json
{
  "message": "I just helped Sarah with Docker for 30 minutes",
  "userId": "bob_user_123",
  "sessionId": "session_456",
  "timestamp": "2024-01-15T10:30:00Z",
  "context": {
    "previousIntent": "work_log",
    "conversationHistory": []
  }
}
```

**Response**:
```json
{
  "data": {
    "response": "Got it! I've logged that you helped Sarah with Docker setup for 30 minutes.",
    "action": "WORK_LOG_CREATED",
    "resourceId": 42,
    "resourceType": "work_log",
    "suggestions": [
      "Would you like to start a focus session?",
      "Any blockers to report?"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔐 Authentication Strategy

### Option 1: BOB User ID Mapping (Recommended for Hackathon)
- BOB sends `userId` in webhook payload
- Backend maintains mapping: `bob_user_id` → `devday_user_id`
- Mapping stored in `users` table: add `bob_user_id VARCHAR(255)` column
- First-time users auto-register via BOB

**Mapping Table Addition**:
```sql
-- Add to V2__create_users_table.sql
ALTER TABLE users ADD COLUMN bob_user_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_bob_user_id ON users(bob_user_id);
```

### Option 2: JWT Token (Alternative)
- BOB includes JWT token in Authorization header
- User must authenticate via web UI first
- More secure but requires extra setup step

**Recommended**: Use Option 1 for hackathon demo simplicity

---

## 🧠 Intent Recognition & Routing

### Intent Types

| Intent | Trigger Phrases | Handler Endpoint | Action |
|--------|----------------|------------------|--------|
| `WORK_LOG` | "I helped", "spent X hours", "worked on" | `/api/bob/intents/work-log` | Create work log |
| `START_FOCUS` | "start focus", "begin session", "focus on" | `/api/bob/intents/start-focus` | Start focus session |
| `COMPLETE_TASK` | "completed", "finished", "done with" | `/api/bob/intents/complete-task` | Mark task complete |
| `ADD_BLOCKER` | "blocked on", "waiting for", "stuck on" | `/api/bob/intents/add-blocker` | Create blocker |
| `PAUSE_FOCUS` | "pause session", "take a break" | `/api/bob/intents/pause-focus` | Pause focus session |
| `GET_TODAY` | "what's on my plate", "show today", "my tasks" | `/api/bob/intents/get-today` | Return today view |
| `UNKNOWN` | Unrecognized input | `/api/bob/intents/unknown` | Ask for clarification |

### Intent Detection Logic

**Simple Pattern Matching (MVP)**:
```java
public Intent detectIntent(String message) {
    String lower = message.toLowerCase();
    
    // Work log patterns
    if (lower.matches(".*(helped|spent|worked on).*")) {
        return Intent.WORK_LOG;
    }
    
    // Focus session patterns
    if (lower.matches(".*(start focus|begin session|focus on).*")) {
        return Intent.START_FOCUS;
    }
    
    // Task completion patterns
    if (lower.matches(".*(completed|finished|done with).*")) {
        return Intent.COMPLETE_TASK;
    }
    
    // Blocker patterns
    if (lower.matches(".*(blocked on|waiting for|stuck on).*")) {
        return Intent.ADD_BLOCKER;
    }
    
    // Today view patterns
    if (lower.matches(".*(what's on my plate|show today|my tasks).*")) {
        return Intent.GET_TODAY;
    }
    
    return Intent.UNKNOWN;
}
```

**Advanced (Optional)**: Use IBM Watson NLU or watsonx.ai for intent classification

---

## 📝 Intent Handler Specifications

### 1. Work Log Intent

**Endpoint**: `POST /api/bob/intents/work-log`

**Request**:
```json
{
  "message": "I helped Sarah with Docker for 30 minutes",
  "userId": "bob_user_123"
}
```

**Parsing Logic**:
- Extract duration: "30 minutes" → `durationMinutes: 30`
- Extract activity: "helped Sarah with Docker" → `title: "Helped Sarah with Docker"`
- Infer log type: "helped" → `logType: HELPED_TEAMMATE`

**Response**:
```json
{
  "data": {
    "workLog": {
      "id": 42,
      "logType": "HELPED_TEAMMATE",
      "title": "Helped Sarah with Docker",
      "durationMinutes": 30,
      "loggedAt": "2024-01-15T10:30:00Z"
    },
    "response": "Got it! I've logged that you helped Sarah with Docker setup for 30 minutes. Great teamwork! 🤝"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Log Type Inference**:
- "helped" → `HELPED_TEAMMATE`
- "debugging", "fixed bug" → `DEBUGGING`
- "researched", "investigated" → `RESEARCH`
- "documented", "wrote docs" → `DOCUMENTATION`
- "meeting", "call" → `MEETING`
- Default → `OTHER`

---

### 2. Start Focus Intent

**Endpoint**: `POST /api/bob/intents/start-focus`

**Request**:
```json
{
  "message": "Start focus on AUTH-231 for 90 minutes",
  "userId": "bob_user_123"
}
```

**Parsing Logic**:
- Extract task ID: "AUTH-231" → lookup task by `external_id`
- Extract duration: "90 minutes" → `plannedDurationMinutes: 90`
- Default duration if not specified: 45 minutes
- Goal: Use task title as goal

**Response (Success)**:
```json
{
  "data": {
    "focusSession": {
      "id": 10,
      "taskId": 5,
      "task": {
        "externalId": "AUTH-231",
        "title": "Fix login timeout after 5 minutes"
      },
      "goal": "Fix login timeout after 5 minutes",
      "plannedDurationMinutes": 90,
      "status": "ACTIVE",
      "startedAt": "2024-01-15T10:30:00Z",
      "estimatedEndTime": "2024-01-15T12:00:00Z"
    },
    "response": "Focus session started on AUTH-231! I'll check in with you in 90 minutes. You've got this! 💪"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response (Conflict - Active Session Exists)**:
```json
{
  "data": {
    "response": "You already have an active focus session on AUTH-230. Would you like to:\n1. Complete current session\n2. Pause current session\n3. Abandon current session\n\nJust let me know!",
    "action": "CONFLICT",
    "activeFocusSession": {
      "id": 9,
      "task": {
        "externalId": "AUTH-230",
        "title": "Add OAuth2 support"
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. Complete Task Intent

**Endpoint**: `POST /api/bob/intents/complete-task`

**Request**:
```json
{
  "message": "Completed AUTH-231",
  "userId": "bob_user_123"
}
```

**Parsing Logic**:
- Extract task ID: "AUTH-231" → lookup task
- If active focus session on this task → complete session too
- Mark task as COMPLETED

**Response**:
```json
{
  "data": {
    "task": {
      "id": 5,
      "externalId": "AUTH-231",
      "title": "Fix login timeout after 5 minutes",
      "status": "COMPLETED",
      "completedAt": "2024-01-15T10:30:00Z"
    },
    "focusSessionCompleted": true,
    "response": "Awesome! Marked AUTH-231 as completed. Great work on fixing the login timeout! 🎉"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 4. Add Blocker Intent

**Endpoint**: `POST /api/bob/intents/add-blocker`

**Request**:
```json
{
  "message": "Blocked on API documentation for AUTH-231",
  "userId": "bob_user_123"
}
```

**Parsing Logic**:
- Extract task ID: "AUTH-231" (optional)
- Extract blocker description: "API documentation"
- Infer blocker type: "documentation" → `CLARIFICATION_NEEDED`

**Response**:
```json
{
  "data": {
    "blocker": {
      "id": 8,
      "taskId": 5,
      "title": "Blocked on API documentation",
      "blockerType": "CLARIFICATION_NEEDED",
      "status": "ACTIVE",
      "blockedSince": "2024-01-15T10:30:00Z"
    },
    "response": "Got it. I've logged that you're blocked on API documentation for AUTH-231. I'll track this for your daily summary. 🚧"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Blocker Type Inference**:
- "waiting for team", "waiting on" → `WAITING_ON_TEAM`
- "technical issue", "bug", "error" → `TECHNICAL_ISSUE`
- "external", "third-party" → `EXTERNAL_DEPENDENCY`
- "documentation", "clarification", "need info" → `CLARIFICATION_NEEDED`

---

### 5. Pause Focus Intent

**Endpoint**: `POST /api/bob/intents/pause-focus`

**Request**:
```json
{
  "message": "Pause session, need to check production logs",
  "userId": "bob_user_123"
}
```

**Parsing Logic**:
- Extract resume note: "need to check production logs"
- Pause active session
- Create open loop automatically

**Response**:
```json
{
  "data": {
    "focusSession": {
      "id": 10,
      "status": "PAUSED",
      "pausedAt": "2024-01-15T10:30:00Z"
    },
    "openLoopCreated": true,
    "response": "Session paused. I've noted that you need to check production logs. Take your time! ⏸️"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 6. Get Today Intent

**Endpoint**: `POST /api/bob/intents/get-today`

**Request**:
```json
{
  "message": "What's on my plate today?",
  "userId": "bob_user_123"
}
```

**Response**:
```json
{
  "data": {
    "summary": "You have 12 tasks today:\n• 2 Jira tickets (1 in progress)\n• 1 GitHub PR to review\n• 1 meeting at 2 PM\n• 3 manual tasks\n\nActive focus session: AUTH-231 (45 min elapsed)\n\nWould you like details on any of these?",
    "todayData": {
      "totalTasks": 12,
      "inProgress": 1,
      "activeFocusSession": {...}
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔄 Conversation Flow Examples

### Example 1: Work Log Flow
```
User: "I helped Sarah with Docker for 30 minutes"
BOB: "Got it! I've logged that you helped Sarah with Docker setup for 30 minutes. Great teamwork! 🤝"

User: "Also spent 1 hour debugging authentication"
BOB: "Logged 1 hour of debugging work on authentication. Anything else you worked on?"

User: "That's it for now"
BOB: "Perfect! I've captured your work. Would you like to start a focus session on something?"
```

### Example 2: Focus Session Flow
```
User: "Start focus on AUTH-231 for 90 minutes"
BOB: "Focus session started on AUTH-231! I'll check in with you in 90 minutes. You've got this! 💪"

[45 minutes later]
User: "Pause session, need to check production logs"
BOB: "Session paused. I've noted that you need to check production logs. Take your time! ⏸️"

[15 minutes later]
User: "Resume session"
BOB: "Session resumed! You have 45 minutes remaining. Let's finish strong! 🚀"

[45 minutes later]
User: "Completed AUTH-231"
BOB: "Awesome! Marked AUTH-231 as completed and closed your focus session. Great work on fixing the login timeout! 🎉"
```

### Example 3: Blocker Flow
```
User: "Blocked on API documentation for AUTH-231"
BOB: "Got it. I've logged that you're blocked on API documentation for AUTH-231. I'll track this for your daily summary. 🚧"

User: "Can you show me my blockers?"
BOB: "You have 2 active blockers:\n1. API documentation (AUTH-231) - since 10:30 AM\n2. Waiting for code review (PR-82) - since yesterday\n\nNeed help escalating any of these?"
```

---

## 🛠️ Implementation Details

### BOB Service Class Structure

```java
@Service
public class BobIntegrationService {
    
    private final TaskService taskService;
    private final FocusSessionService focusSessionService;
    private final WorkLogService workLogService;
    private final BlockerService blockerService;
    
    public BobWebhookResponse handleWebhook(BobWebhookRequest request) {
        // 1. Map BOB user to DevDay user
        User user = getUserByBobId(request.getUserId());
        
        // 2. Detect intent
        Intent intent = detectIntent(request.getMessage());
        
        // 3. Route to appropriate handler
        return switch (intent) {
            case WORK_LOG -> handleWorkLog(request, user);
            case START_FOCUS -> handleStartFocus(request, user);
            case COMPLETE_TASK -> handleCompleteTask(request, user);
            case ADD_BLOCKER -> handleAddBlocker(request, user);
            case PAUSE_FOCUS -> handlePauseFocus(request, user);
            case GET_TODAY -> handleGetToday(request, user);
            default -> handleUnknown(request);
        };
    }
    
    private BobWebhookResponse handleWorkLog(BobWebhookRequest request, User user) {
        // Parse message
        WorkLogData data = parseWorkLogMessage(request.getMessage());
        
        // Create work log
        WorkLog workLog = workLogService.create(user.getId(), data);
        
        // Generate response
        return BobWebhookResponse.builder()
            .response(generateWorkLogResponse(workLog))
            .action("WORK_LOG_CREATED")
            .resourceId(workLog.getId())
            .resourceType("work_log")
            .build();
    }
    
    // ... other handlers
}
```

### Message Parsing Utilities

```java
public class BobMessageParser {
    
    private static final Pattern DURATION_PATTERN = 
        Pattern.compile("(\\d+)\\s*(hour|hours|min|mins|minutes)");
    
    private static final Pattern TASK_ID_PATTERN = 
        Pattern.compile("([A-Z]+-\\d+|PR-\\d+)");
    
    public static Integer extractDuration(String message) {
        Matcher matcher = DURATION_PATTERN.matcher(message);
        if (matcher.find()) {
            int value = Integer.parseInt(matcher.group(1));
            String unit = matcher.group(2);
            return unit.startsWith("hour") ? value * 60 : value;
        }
        return null;
    }
    
    public static String extractTaskId(String message) {
        Matcher matcher = TASK_ID_PATTERN.matcher(message);
        return matcher.find() ? matcher.group(1) : null;
    }
    
    public static WorkLogType inferLogType(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("helped")) return WorkLogType.HELPED_TEAMMATE;
        if (lower.contains("debug")) return WorkLogType.DEBUGGING;
        if (lower.contains("research")) return WorkLogType.RESEARCH;
        if (lower.contains("document")) return WorkLogType.DOCUMENTATION;
        if (lower.contains("meeting")) return WorkLogType.MEETING;
        return WorkLogType.OTHER;
    }
}
```

---

## 🎬 Demo Script for IBM BOB

### Setup (Before Demo)
1. Register demo user: `demo@devday.ai` / `demo123`
2. Link BOB user ID: `bob_demo_user` → demo user
3. Sync mock data (Jira, GitHub, Calendar)
4. Ensure no active focus session

### Demo Flow (5 minutes)

**Slide 1: Introduction**
> "DevDay AI helps developers stay focused and track their work. Let me show you how IBM BOB makes this even easier with natural language."

**Slide 2: Work Logging via BOB**
```
User: "I helped Sarah with Docker for 30 minutes"
BOB: "Got it! I've logged that you helped Sarah with Docker setup for 30 minutes. Great teamwork! 🤝"
```
> "No forms, no clicking—just natural conversation."

**Slide 3: Starting Focus Session**
```
User: "Start focus on AUTH-231 for 90 minutes"
BOB: "Focus session started on AUTH-231! I'll check in with you in 90 minutes. You've got this! 💪"
```
> "BOB enforces single-task focus to prevent context switching."

**Slide 4: Reporting Blockers**
```
User: "Blocked on API documentation"
BOB: "Got it. I've logged that you're blocked on API documentation for AUTH-231. I'll track this for your daily summary. 🚧"
```
> "Blockers are automatically included in AI-generated summaries."

**Slide 5: Completing Work**
```
User: "Completed AUTH-231"
BOB: "Awesome! Marked AUTH-231 as completed and closed your focus session. Great work! 🎉"
```
> "One command updates task status, closes focus session, and logs completion time."

**Slide 6: AI Summary**
> [Show generated daily summary with all BOB-logged activities]
> "At end of day, AI generates professional summary from all interactions—ready to send to your team lead."

---

## 🧪 Testing BOB Integration

### Test Cases

1. **Work Log Creation**
   - Input: "I helped Sarah with Docker for 30 minutes"
   - Expected: Work log created with type=HELPED_TEAMMATE, duration=30

2. **Focus Session Start**
   - Input: "Start focus on AUTH-231 for 90 minutes"
   - Expected: Focus session created, status=ACTIVE

3. **Conflict Handling**
   - Input: "Start focus on AUTH-232" (while AUTH-231 active)
   - Expected: Error response with options to complete/pause/abandon

4. **Task Completion**
   - Input: "Completed AUTH-231"
   - Expected: Task status=COMPLETED, focus session closed

5. **Blocker Creation**
   - Input: "Blocked on API documentation"
   - Expected: Blocker created with type=CLARIFICATION_NEEDED

### cURL Test Commands

```bash
# Test work log intent
curl -X POST http://localhost:8080/api/bob/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I helped Sarah with Docker for 30 minutes",
    "userId": "bob_demo_user",
    "sessionId": "test_session"
  }'

# Test start focus intent
curl -X POST http://localhost:8080/api/bob/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Start focus on AUTH-231 for 90 minutes",
    "userId": "bob_demo_user",
    "sessionId": "test_session"
  }'

# Test complete task intent
curl -X POST http://localhost:8080/api/bob/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Completed AUTH-231",
    "userId": "bob_demo_user",
    "sessionId": "test_session"
  }'
```

---

## 📊 Success Metrics

### Technical
- [ ] Webhook receives and parses BOB messages
- [ ] Intent detection accuracy > 90%
- [ ] All 6 intents implemented and working
- [ ] BOB user ID mapping functional
- [ ] Response time < 500ms

### Demo
- [ ] Natural language work logging works
- [ ] Focus session control via BOB works
- [ ] Task completion via BOB works
- [ ] Blocker reporting via BOB works
- [ ] Conversational responses feel natural

### Innovation
- [ ] Demonstrates IBM BOB value proposition
- [ ] Shows seamless integration with backend
- [ ] Highlights developer productivity gains
- [ ] Impresses judges with natural UX

---

## 🚀 Future Enhancements (Post-Hackathon)

1. **Advanced NLU**: Use IBM Watson NLU for better intent classification
2. **Context Awareness**: Remember conversation history for follow-ups
3. **Proactive Notifications**: BOB reminds user when focus session ends
4. **Voice Integration**: Voice commands via BOB
5. **Team Collaboration**: "Ask Sarah about Docker setup" → creates message
6. **Smart Suggestions**: BOB suggests next task based on priority

---

**Last Updated**: 2024-01-15  
**Spec Version**: 1.0.0  
**Priority**: MUST HAVE for IBM BOB Hackathon