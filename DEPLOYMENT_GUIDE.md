# DevDay AI - Complete Deployment Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 17** (JDK)
- **Maven 3.9+**
- **Docker Desktop** (for PostgreSQL)
- **Node.js 20.9+** (required for Next.js 16)
- **Git**

### Step 1: Clone and Setup

```powershell
# Clone the repository
git clone <your-repo-url>
cd DevDay-AI
```

### Step 2: Start Backend

```powershell
# Terminal 1 - Start PostgreSQL and Backend
cd Backend

# Start PostgreSQL container
docker compose up -d

# Verify PostgreSQL is running
docker compose ps

# Start the backend (builds and runs)
.\run-dev.ps1
```

**What happens on first run:**
- Flyway runs database migrations (creates all tables)
- DemoDataSeeder creates demo user and 6 sample tasks
- Backend starts on `http://localhost:8080`
- API available at `http://localhost:8080/api`

**Demo Credentials:**
- Email: `demo@devday.ai`
- Password: `demo123`

### Step 3: Start Frontend

```powershell
# Terminal 2 - Start Frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Step 4: Access the Application

1. Open browser to `http://localhost:3000`
2. Login with demo credentials (pre-filled)
3. Explore the dashboard with 6 seeded tasks

---

## 📋 What's Working (Live API Integration)

### ✅ Fully Functional Features

1. **Authentication**
   - Login with JWT tokens
   - Register new users
   - Token-based session management

2. **Today Dashboard** (`GET /api/today`)
   - Aggregated view of all daily data
   - Tasks from all sources (Jira, GitHub, Calendar, Teams, Manual)
   - Active focus session
   - Work logs
   - Blockers
   - Open loops

3. **Task Management**
   - View tasks from multiple sources
   - Create manual tasks
   - Update task status (todo → in_progress → done)
   - Task prioritization

4. **Focus Sessions**
   - Start focus session with goal and duration
   - Complete focus session (tracks actual duration)
   - Pause focus session (creates open loop for context)
   - Switch guard modal (prevents accidental task switching)

5. **Work Logs**
   - Add work logs with types (debugging, meeting, helped teammate, etc.)
   - Associate work logs with tasks
   - Track duration
   - View today's work logs

6. **Blockers**
   - Create blockers (with optional task association)
   - Resolve blockers
   - Track blocker status

7. **Open Loops**
   - Automatically created when pausing focus sessions
   - Preserves context for task switches
   - Tracks reason for switching

### ⏳ Client-Side Mock (No Backend Yet)

- Daily AI summary generation (uses mock data)
- Weekly AI summary generation (uses mock data)
- Integration sync buttons (Jira/GitHub sync not implemented)

---

## 🏗️ Architecture Overview

### Backend Stack
- **Framework:** Spring Boot 3.2.x
- **Language:** Java 17
- **Database:** PostgreSQL 15
- **ORM:** Hibernate/JPA
- **Migrations:** Flyway
- **Security:** JWT with Spring Security
- **Build Tool:** Maven

### Frontend Stack
- **Framework:** Next.js 16.2.6
- **Language:** TypeScript
- **UI Library:** React 19.2.4
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Icons:** Lucide React, React Icons

### Database Schema
```
users
├── tasks (JIRA, GitHub, Calendar, Teams, Manual)
├── focus_sessions (with goal and duration tracking)
├── work_logs (categorized by type)
├── blockers (with resolution tracking)
└── open_loops (context preservation)
```

---

## 🔧 Configuration

### Backend Configuration

**Environment Variables** (Backend/.env or system environment):
```bash
# Database
DB_USERNAME=devday
DB_PASSWORD=devday123

# JWT Secret (change in production!)
JWT_SECRET=change-this-secret-in-production-use-at-least-256-bits-for-security

# Application
PORT=8080
SPRING_PROFILES_ACTIVE=dev
```

**Key Files:**
- [`Backend/src/main/resources/application.yml`](Backend/src/main/resources/application.yml) - Main configuration
- [`Backend/docker-compose.yml`](Backend/docker-compose.yml) - PostgreSQL setup
- [`Backend/.env.example`](Backend/.env.example) - Environment template

### Frontend Configuration

**Environment Variables** (frontend/.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Key Files:**
- [`frontend/.env.local`](frontend/.env.local) - API endpoint configuration
- [`frontend/src/services/api.ts`](frontend/src/services/api.ts) - API client
- [`frontend/next.config.ts`](frontend/next.config.ts) - Next.js configuration

---

## 🧪 Testing the Application

### Manual Testing Flow

1. **Login**
   ```
   Email: demo@devday.ai
   Password: demo123
   ```

2. **View Dashboard**
   - See 6 seeded tasks from different sources
   - Check task priorities and statuses

3. **Create Manual Task**
   - Click "Add Manual Task"
   - Fill in title and description
   - Task persists in database

4. **Start Focus Session**
   - Select a task
   - Set goal and duration
   - Click "Start Focus"
   - Session tracked in database

5. **Add Work Log**
   - Select work log type
   - Add description
   - Optionally link to task
   - Saved via API

6. **Create Blocker**
   - Describe the blocker
   - Optionally link to task
   - Track until resolved

7. **Pause Focus Session**
   - Click "Pause" on active session
   - Add context and reason
   - Creates open loop automatically
   - Switch guard prevents accidental switches

8. **Complete Focus Session**
   - Click "Complete"
   - Calculates actual duration
   - Updates database

### API Testing

**Health Check:**
```bash
curl http://localhost:8080/api/actuator/health
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@devday.ai","password":"demo123"}'
```

**Get Today Data:**
```bash
curl -X GET http://localhost:8080/api/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Database connection failed
```
Solution: Ensure PostgreSQL is running
cd Backend
docker compose ps
docker compose up -d
```

**Problem:** Port 8080 already in use
```
Solution: Stop other services or change port in application.yml
server:
  port: 8081
```

**Problem:** Flyway migration failed
```
Solution: Reset database
cd Backend
docker compose down -v
docker compose up -d
.\run-dev.ps1
```

**Problem:** Empty tasks after login
```
Solution: Database was created before DemoDataSeeder fix
cd Backend
docker compose down -v  # Delete volume
docker compose up -d
.\run-dev.ps1  # Restart backend to re-seed
```

### Frontend Issues

**Problem:** CORS errors
```
Solution: Verify backend is on port 8080 and frontend/.env.local is correct
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Problem:** 401 Unauthorized
```
Solution: Sign out and sign in again with demo credentials
Clear localStorage if needed
```

**Problem:** Module not found errors
```
Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Next.js version compatibility
```
Solution: Ensure Node.js 20.9+ is installed
node --version
```

---

## 📊 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Today Dashboard
- `GET /api/today` - Get aggregated today data

### Tasks
- `POST /api/tasks` - Create manual task
- `PATCH /api/tasks/{id}/status` - Update task status

### Focus Sessions
- `POST /api/focus-sessions/start` - Start focus session
- `GET /api/focus-sessions/active` - Get active session
- `POST /api/focus-sessions/{id}/complete` - Complete session
- `POST /api/focus-sessions/{id}/pause` - Pause session with context

### Work Logs
- `POST /api/work-logs` - Create work log
- `GET /api/work-logs/today` - Get today's work logs

### Blockers
- `POST /api/blockers` - Create blocker
- `POST /api/blockers/{id}/resolve` - Resolve blocker

### Health
- `GET /api/actuator/health` - Health check

Full API documentation: [`Backend/API_QUICK_REFERENCE.md`](Backend/API_QUICK_REFERENCE.md)

---

## 🚢 Production Deployment Considerations

### Security
- [ ] Change JWT_SECRET to a strong random value (256+ bits)
- [ ] Use environment-specific secrets management
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable SQL injection protection (already using JPA)

### Database
- [ ] Use managed PostgreSQL service (AWS RDS, Azure Database, etc.)
- [ ] Configure connection pooling
- [ ] Set up automated backups
- [ ] Enable SSL connections
- [ ] Monitor query performance

### Backend
- [ ] Build production JAR: `mvn clean package -DskipTests`
- [ ] Use production profile: `SPRING_PROFILES_ACTIVE=prod`
- [ ] Configure logging (file rotation, log levels)
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure health checks
- [ ] Use container orchestration (Kubernetes, Docker Swarm)

### Frontend
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to Vercel, Netlify, or custom server
- [ ] Configure environment variables
- [ ] Enable CDN for static assets
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics

### Infrastructure
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling
- [ ] Implement load balancing
- [ ] Set up monitoring and alerting
- [ ] Configure backup and disaster recovery

---

## 📝 Next Steps for Enhancement

### High Priority
1. **IBM BOB Integration**
   - Implement webhook endpoint for BOB
   - Add BOB-specific authentication
   - Create BOB command handlers

2. **AI Summary Generation**
   - Integrate IBM watsonx.ai
   - Implement daily summary endpoint
   - Implement weekly summary endpoint
   - Add summary caching

### Medium Priority
3. **Real Integration Sync**
   - Jira API integration
   - GitHub API integration
   - Calendar API integration
   - Teams API integration

4. **Enhanced Features**
   - Task filtering and search
   - Advanced analytics dashboard
   - Team collaboration features
   - Notification system

### Low Priority
5. **Polish**
   - Add comprehensive error handling
   - Improve loading states
   - Add animations and transitions
   - Implement dark mode
   - Add keyboard shortcuts

---

## 📚 Additional Documentation

- [`FULLSTACK_DEMO.md`](FULLSTACK_DEMO.md) - Quick demo guide
- [`Backend/IMPLEMENTATION_COMPLETE.md`](Backend/IMPLEMENTATION_COMPLETE.md) - Backend implementation details
- [`Backend/API_TESTING_GUIDE.md`](Backend/API_TESTING_GUIDE.md) - API testing guide
- [`Backend/IBM_BOB_INTEGRATION_SPEC.md`](Backend/IBM_BOB_INTEGRATION_SPEC.md) - BOB integration spec
- [`frontend/README.md`](frontend/README.md) - Frontend documentation

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation
3. Check application logs:
   - Backend: `Backend/logs/devday-ai.log`
   - Frontend: Browser console

---

**Made with Bob 🤖**