# DevDay AI Backend - Bootstrap Guide
## DELIVERABLE F: Configuration & Setup Instructions

> **Purpose**: Step-by-step guide to get the backend running in 5 minutes

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- Docker Desktop (for PostgreSQL)
- Git

### Step 1: Clone and Navigate
```bash
cd Backend
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values (at minimum, set JWT_SECRET)
# For hackathon demo, you can use defaults
```

### Step 3: Start PostgreSQL
```bash
docker-compose up -d
```

**Verify PostgreSQL is running**:
```bash
docker ps
# Should show devday-postgres container running on port 5432
```

### Step 4: Build and Run
```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

**Alternative (if mvnw doesn't work on Windows)**:
```bash
mvn clean install
mvn spring-boot:run
```

### Step 5: Verify Health
```bash
curl http://localhost:8080/api/health
```

**Expected Response**:
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔧 Detailed Configuration

### Environment Variables

#### Required (Minimum for Demo)
```bash
# .env file
JWT_SECRET=your-secret-key-at-least-32-characters-long
DB_USERNAME=devday
DB_PASSWORD=devday123
```

#### Recommended for IBM BOB Hackathon
```bash
# IBM watsonx.ai (PRIMARY)
WATSONX_API_KEY=your-watsonx-api-key
WATSONX_PROJECT_ID=your-project-id
LLM_PROVIDER=watsonx

# OpenAI (FALLBACK)
OPENAI_API_KEY=your-openai-api-key

# BOB Integration
BOB_ENABLED=true

# Demo Mode
DEMO_MODE=true
SEED_DATA=true
```

#### Optional
```bash
PORT=8080
LOG_LEVEL=DEBUG
FRONTEND_URL=http://localhost:3000
SPRING_PROFILES_ACTIVE=dev
```

---

## 📊 Database Setup

### Automatic Setup (Recommended)
Flyway migrations run automatically on application startup. No manual steps needed.

### Manual Verification
```bash
# Connect to PostgreSQL
docker exec -it devday-postgres psql -U devday -d devday_ai

# List tables
\dt

# Expected tables:
# users, tasks, blockers, open_loops, focus_sessions, 
# work_logs, summaries, integration_sync

# Exit
\q
```

### Seed Demo Data
If `SEED_DATA=true` in .env, demo data is automatically loaded:
- Demo user: `demo@devday.ai` / `demo123`
- 5 Jira tasks
- 1 GitHub PR
- 1 Calendar meeting
- 3 manual tasks

---

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:8080/api/health
```

### 2. Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@devday.ai",
    "name": "Test Developer",
    "password": "test123"
  }'
```

**Save the JWT token from response**

### 3. Get Today View
```bash
curl http://localhost:8080/api/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Sync Mock Integrations
```bash
# Sync Jira
curl http://localhost:8080/api/integrations/jira/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Sync GitHub
curl http://localhost:8080/api/integrations/github/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Sync Calendar
curl http://localhost:8080/api/integrations/calendar/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Sync Teams
curl http://localhost:8080/api/integrations/teams/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Start Focus Session
```bash
curl -X POST http://localhost:8080/api/focus-sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "goal": "Test focus session",
    "plannedDurationMinutes": 45
  }'
```

---

## 🐳 Docker Commands

### Start PostgreSQL
```bash
docker-compose up -d
```

### Stop PostgreSQL
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f postgres
```

### Reset Database (CAUTION: Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

### Connect to PostgreSQL CLI
```bash
docker exec -it devday-postgres psql -U devday -d devday_ai
```

---

## 📝 Application Profiles

### Development Profile (Default)
```bash
SPRING_PROFILES_ACTIVE=dev
```
- Debug logging enabled
- SQL logging enabled
- Demo mode enabled
- Seed data on startup

### Production Profile
```bash
SPRING_PROFILES_ACTIVE=prod
```
- Info logging only
- SQL logging disabled
- Demo mode disabled
- No seed data

---

## 🔍 Troubleshooting

### Issue: Port 8080 already in use
```bash
# Find process using port 8080
# Windows
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :8080

# Kill the process or change PORT in .env
PORT=8081
```

### Issue: PostgreSQL connection failed
```bash
# Check if PostgreSQL is running
docker ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection
docker exec -it devday-postgres psql -U devday -d devday_ai -c "SELECT 1;"
```

### Issue: Flyway migration failed
```bash
# Check migration files exist
ls src/main/resources/db/migration/

# Reset database and retry
docker-compose down -v
docker-compose up -d
./mvnw spring-boot:run
```

### Issue: JWT token invalid
```bash
# Ensure JWT_SECRET is set in .env
# Ensure JWT_SECRET is at least 32 characters
# Re-login to get new token
```

### Issue: LLM API calls failing
```bash
# Check API keys are set
echo $WATSONX_API_KEY
echo $OPENAI_API_KEY

# Enable template fallback in application.yml
llm:
  fallback-to-template: true

# Check logs for detailed error
tail -f logs/devday-ai.log
```

---

## 📦 Maven Commands

### Clean Build
```bash
./mvnw clean install
```

### Run Tests
```bash
./mvnw test
```

### Run Application
```bash
./mvnw spring-boot:run
```

### Package JAR
```bash
./mvnw clean package
java -jar target/devday-ai-backend-1.0.0.jar
```

### Skip Tests (Faster Build)
```bash
./mvnw clean install -DskipTests
```

---

## 🎯 Demo Preparation Checklist

### Before Demo
- [ ] PostgreSQL running (`docker ps`)
- [ ] Application started (`./mvnw spring-boot:run`)
- [ ] Health endpoint returns 200 (`curl http://localhost:8080/api/health`)
- [ ] Demo user exists (`demo@devday.ai` / `demo123`)
- [ ] Mock data synced (Jira, GitHub, Calendar, Teams)
- [ ] Postman collection imported (if using Postman)
- [ ] Environment variables set (especially LLM API keys)
- [ ] Logs clean (no errors in `logs/devday-ai.log`)

### Demo User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@devday.ai",
    "password": "demo123"
  }'
```

**Save the token for demo**

### Quick Demo Flow Test
1. Login → Get token ✓
2. Get today view → See aggregated tasks ✓
3. Start focus session → Session created ✓
4. Create work log → Log created ✓
5. Generate daily summary → AI summary generated ✓

---

## 🔗 Useful URLs

### Local Development
- **Health Check**: http://localhost:8080/api/health
- **Actuator**: http://localhost:8080/api/actuator
- **Actuator Health**: http://localhost:8080/api/actuator/health

### Database
- **Host**: localhost
- **Port**: 5432
- **Database**: devday_ai
- **Username**: devday
- **Password**: devday123

### Logs
- **Application Log**: `logs/devday-ai.log`
- **Console**: Real-time in terminal

---

## 📚 Next Steps

After successful bootstrap:
1. Review [`CHAT_SESSION_GUIDE.md`](./CHAT_SESSION_GUIDE.md) for API implementation prompts
2. Start with API 1 in a new chat session
3. Follow the one-chat-per-API workflow
4. Update [`PROGRESS.md`](./PROGRESS.md) after each API completion

---

## 🆘 Getting Help

### Check Documentation
1. [`REVISED_IMPLEMENTATION_PLAN.md`](./REVISED_IMPLEMENTATION_PLAN.md) - Complete roadmap
2. [`FRONTEND_BACKEND_CONTRACT.md`](./FRONTEND_BACKEND_CONTRACT.md) - API contract
3. [`DATABASE_SCHEMA.sql`](./DATABASE_SCHEMA.sql) - Database schema
4. [`IBM_BOB_INTEGRATION_SPEC.md`](./IBM_BOB_INTEGRATION_SPEC.md) - BOB integration

### Common Issues
- Port conflicts → Change PORT in .env
- Database connection → Check docker-compose
- JWT errors → Verify JWT_SECRET length
- LLM errors → Enable template fallback

---

**Bootstrap Complete! Ready to implement APIs.** 🚀