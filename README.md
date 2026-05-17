# DevDay AI - Your Private Developer Workday Assistant

> A full-stack application that helps developers manage their daily work from Jira, GitHub, Calendar, and Teams in one unified dashboard. Track focus sessions, manage blockers, and generate AI-powered summaries.

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

### Prerequisites
- **Java 17** (JDK)
- **Maven 3.9+**
- **Docker Desktop** (for PostgreSQL)
- **Node.js 20.9+** (required for Next.js 16)

### One-Command Startup

```powershell
# Start everything (PostgreSQL, Backend, Frontend)
.\start-fullstack.ps1

# Or start manually:
# Terminal 1 - Backend
cd Backend
docker compose up -d
.\run-dev.ps1

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access the Application

1. Open **http://localhost:3000**
2. Login with demo credentials:
   - **Email:** `demo@devday.ai`
   - **Password:** `demo123`

---

## ✨ Features

### ✅ Fully Functional (Live API)

- **Authentication** - JWT-based login and registration
- **Today Dashboard** - Aggregated view of all daily activities
- **Task Management** - Tasks from Jira, GitHub, Calendar, Teams, and manual entry
- **Focus Sessions** - Track focused work periods with goals and duration
- **Work Logs** - Log non-task work (debugging, meetings, helping teammates)
- **Blockers** - Track and resolve impediments
- **Open Loops** - Context preservation when switching tasks
- **Switch Guard** - Prevents accidental task switching with context capture

### ⏳ Coming Soon

- **AI Summaries** - Daily and weekly summaries powered by IBM watsonx.ai
- **Real Integration Sync** - Live sync with Jira, GitHub, Calendar, Teams
- **IBM BOB Integration** - Webhook integration for BOB assistant

---

## 🏗️ Architecture

### Backend
- **Framework:** Spring Boot 3.2.x
- **Language:** Java 17
- **Database:** PostgreSQL 15
- **ORM:** Hibernate/JPA
- **Migrations:** Flyway
- **Security:** JWT with Spring Security
- **API:** RESTful with JSON

### Frontend
- **Framework:** Next.js 16.2.6
- **Language:** TypeScript 5
- **UI:** React 19.2.4
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **State:** React Hooks

### Database Schema
```
users
├── tasks (JIRA, GitHub, Calendar, Teams, Manual)
├── focus_sessions (goal tracking, duration)
├── work_logs (categorized activities)
├── blockers (impediment tracking)
└── open_loops (context preservation)
```

---

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete local setup and deployment guide
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Production deployment with Docker, Kubernetes, and cloud platforms
- **[FULLSTACK_DEMO.md](FULLSTACK_DEMO.md)** - Quick demo walkthrough
- **[Backend/IMPLEMENTATION_COMPLETE.md](Backend/IMPLEMENTATION_COMPLETE.md)** - Backend implementation details
- **[Backend/API_QUICK_REFERENCE.md](Backend/API_QUICK_REFERENCE.md)** - API endpoint reference
- **[Backend/IBM_BOB_INTEGRATION_SPEC.md](Backend/IBM_BOB_INTEGRATION_SPEC.md)** - BOB integration specification

---

## 🔧 Configuration

### Backend Configuration

**Environment Variables** (Backend/.env):
```bash
DB_USERNAME=devday
DB_PASSWORD=devday123
JWT_SECRET=change-this-secret-in-production
```

**Key Files:**
- [`Backend/src/main/resources/application.yml`](Backend/src/main/resources/application.yml) - Main configuration
- [`Backend/docker-compose.yml`](Backend/docker-compose.yml) - PostgreSQL setup

### Frontend Configuration

**Environment Variables** (frontend/.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🧪 Testing

### Manual Testing

1. **Login** with demo credentials
2. **View Dashboard** - See 6 seeded tasks
3. **Create Task** - Add manual task
4. **Start Focus** - Begin focus session
5. **Add Work Log** - Log work activity
6. **Create Blocker** - Track impediment
7. **Pause Focus** - Switch tasks with context

### API Testing

```bash
# Health check
curl http://localhost:8080/api/actuator/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@devday.ai","password":"demo123"}'

# Get today's data
curl -X GET http://localhost:8080/api/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Dashboard
- `GET /api/today` - Get aggregated today data

### Tasks
- `POST /api/tasks` - Create manual task
- `PATCH /api/tasks/{id}/status` - Update task status

### Focus Sessions
- `POST /api/focus-sessions/start` - Start focus session
- `GET /api/focus-sessions/active` - Get active session
- `POST /api/focus-sessions/{id}/complete` - Complete session
- `POST /api/focus-sessions/{id}/pause` - Pause with context

### Work Logs
- `POST /api/work-logs` - Create work log
- `GET /api/work-logs/today` - Get today's logs

### Blockers
- `POST /api/blockers` - Create blocker
- `POST /api/blockers/{id}/resolve` - Resolve blocker

Full API documentation: [Backend/API_QUICK_REFERENCE.md](Backend/API_QUICK_REFERENCE.md)

---

## 🐛 Troubleshooting

### Backend Issues

**Database connection failed:**
```powershell
cd Backend
docker compose ps
docker compose up -d
```

**Empty tasks after login:**
```powershell
# Reset database to re-seed demo data
cd Backend
docker compose down -v
docker compose up -d
.\run-dev.ps1
```

### Frontend Issues

**CORS errors:**
```bash
# Verify frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**401 Unauthorized:**
- Sign out and sign in again
- Clear localStorage if needed

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🚢 Deployment

### Local Development
```powershell
.\start-fullstack.ps1
```

### Production Options

1. **Cloud Platforms** (Recommended)
   - Backend: AWS Elastic Beanstalk / Azure App Service / Google Cloud Run
   - Frontend: Vercel / Netlify / AWS Amplify
   - Database: AWS RDS / Azure Database / Google Cloud SQL

2. **Docker Compose**
   - Simple setup for small teams
   - See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

3. **Kubernetes**
   - Full control and scalability
   - See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

---

## 🔐 Security

### Development
- Demo credentials: `demo@devday.ai` / `demo123`
- Default JWT secret (change in production!)

### Production Checklist
- [ ] Generate strong JWT secret (256+ bits)
- [ ] Configure HTTPS/TLS
- [ ] Set up secrets management
- [ ] Restrict CORS origins
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Enable database SSL
- [ ] Review security headers

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete security guide.

---

## 📈 Roadmap

### High Priority
- [ ] IBM watsonx.ai integration for AI summaries
- [ ] IBM BOB webhook integration
- [ ] Real-time Jira sync
- [ ] Real-time GitHub sync

### Medium Priority
- [ ] Calendar integration (Google, Outlook)
- [ ] Teams integration
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

### Low Priority
- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Mobile app
- [ ] Browser extension

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built for the IBM BOB Hackathon
- Powered by Spring Boot, Next.js, and PostgreSQL
- UI components inspired by modern design systems
- Demo data seeding for easy testing

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review [Backend/API_TESTING_GUIDE.md](Backend/API_TESTING_GUIDE.md)
3. Check application logs:
   - Backend: `Backend/logs/devday-ai.log`
   - Frontend: Browser console
4. Open an issue on GitHub

---

## 🎯 Project Status

**Current Status:** ✅ **Production Ready for Demo**

- ✅ Authentication and authorization
- ✅ Core task management
- ✅ Focus session tracking
- ✅ Work log management
- ✅ Blocker tracking
- ✅ Open loop context preservation
- ⏳ AI summary generation (mock data)
- ⏳ Real integration sync (mock data)

---

**Made with Bob 🤖**

*DevDay AI - Making developers more productive, one focus session at a time.*