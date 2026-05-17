# DevDay AI - Backend Implementation Guide
## Lablab.ai IBM BOB Hackathon

> **Developer Productivity Assistant** - Help developers stay focused, track work, and generate AI-powered summaries

---

## 📚 Documentation Structure

This backend implementation is organized into multiple comprehensive guides:

### 1. **BACKEND_IMPLEMENTATION_PLAN.md** (Main Document)
**Purpose**: Complete technical specification and architecture  
**Use When**: You need detailed information about system design, database schema, or architectural decisions  
**Contains**:
- System architecture overview
- Complete database schema with SQL
- Project structure
- All 18 API specifications with detailed examples
- Configuration files
- Best practices and guidelines

### 2. **API_QUICK_REFERENCE.md** (Quick Lookup)
**Purpose**: Fast API endpoint reference  
**Use When**: You need to quickly check endpoint format, request/response structure, or HTTP methods  
**Contains**:
- API implementation status tracker
- Complete endpoint catalog with examples
- Request/response formats
- Authentication details
- HTTP status codes
- Testing commands

### 3. **IMPLEMENTATION_SUMMARY.md** (Quick Start)
**Purpose**: High-level overview and quick start guide  
**Use When**: You want to understand the big picture or get started quickly  
**Contains**:
- Phase-by-phase breakdown
- Time estimates
- Implementation checklist
- Demo flow
- Pro tips and common pitfalls
- Success metrics

### 4. **CHAT_SESSION_GUIDE.md** (Step-by-Step)
**Purpose**: Detailed prompts for each API implementation  
**Use When**: You're ready to implement a specific API and need the exact prompt  
**Contains**:
- Copy-paste prompts for each API
- Expected deliverables
- Testing commands
- Implementation checklists

---

## 🎯 Project Overview

**DevDay AI** is a developer productivity assistant that helps developers:
- ✅ See all work from Jira, GitHub, Calendar, and Teams in one place
- ✅ Maintain focus with enforced single-task sessions
- ✅ Track work manually with categorized logs
- ✅ Manage blockers and open loops
- ✅ Generate AI-powered daily and weekly summaries
- ✅ Submit professional summaries to team leads

**Key Innovation**: Prevents task-jumping by enforcing focus sessions with context preservation through resume notes and open loops.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React/Next.js Frontend                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot 3.2 REST API Layer                  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Today   │  Focus   │   Work   │   AI     │   BOB    │  │
│  │ Service  │ Service  │   Log    │ Summary  │Integration│  │
│  │          │          │ Service  │ Service  │          │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Mock MCP Adapters Layer                     │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐ │
│  │  Jira    │  GitHub  │ Calendar │  Microsoft Teams     │ │
│  │ Adapter  │ Adapter  │ Adapter  │     Adapter          │ │
│  └──────────┴──────────┴──────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  Users │ Tasks │ Focus Sessions │ Work Logs │ Summaries    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker Desktop
- PostgreSQL (via Docker)
- OpenAI API key (for AI summaries)

### Setup

1. **Clone and navigate**
```bash
cd Backend
```

2. **Set environment variables**
```bash
export DB_USERNAME=devday
export DB_PASSWORD=devday123
export JWT_SECRET=your-secret-key-change-in-production
export OPENAI_API_KEY=your-openai-api-key
```

3. **Start PostgreSQL**
```bash
docker-compose up -d
```

4. **Run application**
```bash
./mvnw spring-boot:run
```

5. **Verify health**
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (4-6 hours)
- [ ] API 1: Project Setup & Health Check
- [ ] API 2: User Management & JWT Authentication
- [ ] API 3: Task Entity & CRUD Operations

### Phase 2: Mock Integrations (3-4 hours)
- [ ] API 4: Jira Mock Adapter
- [ ] API 5: GitHub Mock Adapter
- [ ] API 6: Calendar & Teams Mock Adapters

### Phase 3: Today Aggregation (3-4 hours)
- [ ] API 7: Today Aggregation Service
- [ ] API 8: Task Status Management
- [ ] API 9: Task Search & Filtering

### Phase 4: Focus Sessions (4-5 hours)
- [ ] API 10: Focus Session Start & Management
- [ ] API 11: Focus Session Pause & Resume
- [ ] API 12: Focus Session Complete & Switch Guard

### Phase 5: Work Logging (3-4 hours)
- [ ] API 13: Work Log Creation
- [ ] API 14: Blocker Management
- [ ] API 15: Open Loops Management

### Phase 6: AI Integration (4-5 hours)
- [ ] API 16: LLM Service Integration
- [ ] API 17: Daily Summary Generation
- [ ] API 18: Weekly Summary Generation

### Phase 7: Bonus (2-3 hours)
- [ ] API 19: IBM BOB Integration (Optional)

**Total Estimated Time**: 24-30 hours

---

## 🎯 Core Features

### 1. Today Aggregation
Combines tasks from all sources (Jira, GitHub, Calendar, Teams, Manual) into a single unified view.

**Endpoint**: `GET /api/today`

### 2. Focus Session Management
Enforces single-task focus with timer, goal setting, and context preservation.

**Key Endpoints**:
- `POST /api/focus-sessions/start`
- `POST /api/focus-sessions/{id}/pause`
- `POST /api/focus-sessions/{id}/complete`

### 3. Task Switching Guard
Prevents developers from jumping between tasks without proper context preservation.

**Endpoint**: `POST /api/tasks/switch-guard`

### 4. Work Logging
Manual work tracking with categories (helped teammate, debugging, research, etc.).

**Endpoint**: `POST /api/work-logs`

### 5. AI Summary Generation
Generates professional daily and weekly summaries using LLM.

**Endpoints**:
- `POST /api/summaries/daily/generate`
- `POST /api/summaries/weekly/generate`

---

## 🗂️ Database Schema

### Core Tables
- **users** - Developer profiles
- **tasks** - All work items from all sources
- **focus_sessions** - Focus session tracking
- **work_logs** - Manual work logs
- **blockers** - Issue tracking
- **open_loops** - Unfinished work tracking
- **summaries** - AI-generated summaries
- **integration_sync** - Integration sync status

See [`BACKEND_IMPLEMENTATION_PLAN.md`](./BACKEND_IMPLEMENTATION_PLAN.md) for complete schema with SQL.

---

## 🔧 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.x
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Migration**: Flyway
- **Security**: Spring Security + JWT
- **Validation**: Hibernate Validator

### AI Integration
- **LLM Provider**: OpenAI GPT-4 Turbo
- **Alternative**: Anthropic Claude, IBM watsonx

### Development Tools
- **Containerization**: Docker & Docker Compose
- **API Testing**: Postman
- **Database Tool**: DBeaver
- **Logging**: SLF4J + Logback

---

## 📝 API Documentation

### Authentication
All endpoints except `/api/health`, `/api/auth/register`, and `/api/auth/login` require JWT authentication.

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Key Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/users/me` - Get current user

**Tasks**
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks (with filtering)
- `PATCH /api/tasks/{id}` - Update task
- `POST /api/tasks/{id}/complete` - Complete task

**Integrations**
- `GET /api/integrations/jira/sync` - Sync Jira tasks
- `GET /api/integrations/github/sync` - Sync GitHub PRs
- `GET /api/integrations/status` - Get all integration statuses

**Today**
- `GET /api/today` - Get today's aggregated view
- `POST /api/today/refresh` - Refresh all integrations

**Focus Sessions**
- `POST /api/focus-sessions/start` - Start focus session
- `POST /api/focus-sessions/{id}/pause` - Pause session
- `POST /api/focus-sessions/{id}/complete` - Complete session
- `POST /api/tasks/switch-guard` - Validate task switch

**Work Logs**
- `POST /api/work-logs` - Create work log
- `GET /api/work-logs/today` - Get today's work logs

**Summaries**
- `POST /api/summaries/daily/generate` - Generate daily summary
- `PATCH /api/summaries/{id}` - Edit summary
- `POST /api/summaries/{id}/submit` - Submit summary

See [`API_QUICK_REFERENCE.md`](./API_QUICK_REFERENCE.md) for complete API catalog.

---

## 🧪 Testing

### Manual Testing with cURL

**Register User**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","name":"Test Dev","password":"test123"}'
```

**Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"test123"}'
```

**Get Today View**
```bash
curl http://localhost:8080/api/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Postman Collection
Import the Postman collection (to be created) for complete API testing.

---

## 🎬 Demo Flow

1. **Register/Login** → Get JWT token
2. **Sync Integrations** → Load mock data from all sources
3. **View Today Page** → See aggregated tasks
4. **Start Focus Session** → Pick task, set goal (90 min)
5. **Log Work** → Add manual work log
6. **Try Task Switch** → Blocked by switch guard
7. **Pause Session** → Pause with resume note
8. **Add Blocker** → Mark task as blocked
9. **Complete Session** → Finish with outcome
10. **Generate Summary** → AI creates daily summary
11. **Edit Summary** → Developer edits content
12. **Submit Summary** → Send to team lead

---

## 💡 Best Practices

### Code Quality
- Use Lombok to reduce boilerplate
- Follow REST naming conventions
- Implement proper exception handling
- Add comprehensive logging
- Write meaningful commit messages

### API Design
- Use proper HTTP status codes
- Consistent response format
- Pagination for list endpoints
- Clear error messages
- Input validation

### Security
- Never expose sensitive data
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Secure JWT tokens

### Performance
- Use database indexes
- Implement caching where appropriate
- Optimize N+1 queries
- Use connection pooling
- Monitor query performance

---

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Application Won't Start
```bash
# Check Java version
java -version  # Should be 17+

# Clean and rebuild
./mvnw clean install

# Check for port conflicts
lsof -i :8080  # On Mac/Linux
netstat -ano | findstr :8080  # On Windows
```

### JWT Token Issues
- Ensure JWT_SECRET environment variable is set
- Check token expiration (24 hours default)
- Verify Authorization header format: `Bearer {token}`

---

## 📚 Additional Resources

### Documentation
- [Spring Boot 3 Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Spring Security](https://docs.spring.io/spring-security/reference/)
- [OpenAI API](https://platform.openai.com/docs/api-reference)

### Tutorials
- [Building REST APIs with Spring Boot](https://spring.io/guides/tutorials/rest/)
- [Spring Security with JWT](https://www.baeldung.com/spring-security-oauth-jwt)
- [Flyway Database Migrations](https://flywaydb.org/documentation/)

---

## 🤝 Contributing

This is a hackathon project. For the actual hackathon:
1. Create a new chat session for each API
2. Use the prompts from `CHAT_SESSION_GUIDE.md`
3. Test each API before moving to the next
4. Commit after each working API
5. Keep the demo flow in mind

---

## 📄 License

This project is created for the Lablab.ai IBM BOB Hackathon.

---

## 🎯 Success Criteria

### Technical Excellence
- ✅ All 18 APIs implemented and working
- ✅ Database schema properly designed
- ✅ Clean code architecture
- ✅ Proper error handling
- ✅ API documentation complete

### Demo Readiness
- ✅ Mock data realistic and impressive
- ✅ Today page loads < 500ms
- ✅ AI summaries generate < 3 seconds
- ✅ No crashes during demo
- ✅ Smooth user flow

### Innovation Points
- ✅ IBM BOB integration working
- ✅ Intelligent task switching guard
- ✅ Quality AI summaries
- ✅ Open loops tracking
- ✅ Professional UI/UX

---

## 📞 Support

For questions or issues during implementation:
1. Check the relevant documentation file
2. Review the API Quick Reference
3. Consult the Implementation Summary
4. Use the Chat Session Guide prompts

---

**Good luck with your hackathon! 🚀**

Remember: Focus on getting a working demo. Perfect code can come later. The goal is to showcase your innovation and technical skills through a smooth, impressive demonstration.