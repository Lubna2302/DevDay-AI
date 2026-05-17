# DevDay AI — Full-Stack Demo

## Prerequisites

- Java 17, Maven, Docker Desktop
- Node.js 18+

## 1. Start PostgreSQL

```powershell
cd S:\DevDay-AI\Backend
docker compose up -d
```

## 2. Start Backend

```powershell
cd S:\DevDay-AI\Backend
.\run-dev.ps1
```

On first start, Flyway runs migrations and **DemoDataSeeder** creates:

- **Email:** `demo@devday.ai`
- **Password:** `demo123`
- Sample tasks from Jira, GitHub, Calendar, Teams

API base: `http://localhost:8080/api`

## 3. Start Frontend

```powershell
cd S:\DevDay-AI\frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4. Sign in

Use demo credentials above (pre-filled on login screen).

## What works (live API)

- Login / register (JWT)
- Today dashboard (`GET /today`)
- Add manual tasks
- Start / complete / pause focus sessions
- Work logs
- Blockers (create / resolve)
- Task status updates
- Switch guard flows (pause with open loop)

## Still client-side mock

- Daily / weekly AI summary generation (no watsonx backend yet)
- Integration sync buttons (Jira/GitHub mock sync not implemented)

## Troubleshooting

- **CORS errors:** Ensure backend is on port 8080 and `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- **Empty tasks:** Delete DB volume and restart, or register a new user (seeder only runs when DB has zero users)
- **401:** Sign out and sign in again with demo credentials
