<div align="center">

# 🚀 DevDay AI

### Your private developer workday assistant

**Plan your day. Stay focused. Capture context. Generate your report.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-dev--day--ai.vercel.app-D6FF6B?style=for-the-badge&logo=vercel&logoColor=black)](https://dev-day-ai.vercel.app/)
[![Built with IBM BOB](https://img.shields.io/badge/Built%20with-IBM%20BOB-0f62fe?style=for-the-badge)](#-how-we-used-ibm-bob)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)

🌐 **Live App:** [https://dev-day-ai.vercel.app/](https://dev-day-ai.vercel.app/)

</div>

---

## ✨ What Is DevDay AI?

**DevDay AI** is a developer-first productivity assistant that brings daily engineering work into one focused dashboard.

Developers can manage tasks, PRs, meetings, blockers, open loops, work logs, focus sessions, and AI-generated reports without feeling monitored.

It is designed as a **private developer work journal**, not an employee surveillance tool.

> DevDay AI helps developers end the day with clarity.

---

## 🧩 The Problem

Developers do not only work on Jira tickets.

A real developer day includes:

- 🎫 Jira tasks
- 🔀 Pull request reviews
- 📅 Meetings
- 💬 Teams discussions
- 🧠 Debugging
- 🧑‍🤝‍🧑 Helping teammates
- 🚧 Blockers
- 🔍 Research
- 🤖 AI/Cursor-assisted coding
- 🧵 Half-finished tasks and context switches

By the end of the day, work is scattered and developers often struggle to answer:

> What did I actually complete today?

---

## 💡 Our Solution

DevDay AI gives developers a single **Today Dashboard** where they can:

- see all work in one place
- choose one active focus task
- avoid task-jumping with Switch Guard
- capture resume notes through Open Loops
- log meaningful work manually
- track blockers
- generate editable daily and weekly AI summaries

---

## 🖥️ Live Demo

🔗 **Try it here:** [https://dev-day-ai.vercel.app/](https://dev-day-ai.vercel.app/)

If demo authentication is enabled:

```txt
Email: demo@devday.ai
Password: demo123
```

---

## 🏆 Key Features

### 🗂️ Today Dashboard

One command center for:

- tasks
- PRs
- meetings
- blockers
- manual logs
- open loops
- summaries

### 🎯 Focus Sessions

Developers choose one active task and define a goal before working.

The app does not force a schedule. The developer stays in control.

### 🛡️ Switch Guard

Our key productivity feature.

When a developer tries to switch tasks, DevDay AI asks them to:

- ✅ complete the current task
- 📝 pause with a resume note
- 🚧 mark it blocked
- ↪️ switch intentionally

This prevents unfinished work from disappearing.

### 🧵 Open Loops

Open Loops preserve context for unfinished tasks.

Each open loop can store:

- current state
- next action
- blocker
- task context

### 📝 Manual Work Logs

Capture work that tools usually miss:

- debugging
- PR reviews
- meetings
- research
- documentation
- teammate help
- production support

### 🤖 AI Daily Summary

Generate an editable daily report from:

- tasks
- work logs
- blockers
- focus sessions
- open loops

### 📈 AI Weekly Summary

Create outcome-focused weekly summaries that avoid low-level technical noise.

Instead of:

```txt
Added a class
Changed a method
```

DevDay AI writes:

```txt
Improved login reliability
Progressed payment workflow investigation
Tracked backend API clarification blocker
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js | React framework |
| React | UI components |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Axios | API communication |

### Backend

| Technology | Purpose |
|---|---|
| Java 17 | Backend language |
| Spring Boot | REST API backend |
| PostgreSQL | Database |
| Hibernate / JPA | ORM |
| Flyway | Database migrations |
| Spring Security | Authentication |
| JWT | Secure sessions |

### AI + Tools

| Tool | Usage |
|---|---|
| IBM BOB | AI-assisted development |
| IBM watsonx.ai | Planned AI summary integration |
| GitHub Copilot | AI coding support |
| Docker | Local services |
| Vercel | Frontend deployment |

---

## 🏗️ Architecture

```txt
Next.js Frontend
        |
        v
Spring Boot REST API
        |
        v
PostgreSQL Database
        |
        v
MCP / API Connector Layer
  - Jira
  - GitHub / Bitbucket
  - Calendar
  - Microsoft Teams
        |
        v
AI Summary Service
```

For the hackathon MVP, some integration data can be mocked while keeping clean service boundaries for real integrations later.

---

## 🔁 Product Flow

```txt
Import daily work
        ↓
Choose active focus
        ↓
Log progress
        ↓
Track blockers
        ↓
Close open loops
        ↓
Generate AI summary
        ↓
Edit and share
```

---

## 📁 Project Structure

```txt
DevDay-AI-main/
  frontend/
    src/
      app/
      components/
        dashboard/
        tasks/
        focus/
        worklog/
        blockers/
        openloops/
        summary/
      mock/
      services/
      types/
      utils/

  Backend/
    src/
    docker-compose.yml

  bob_sessions/
    exported IBM BOB task history files
    consumption summary screenshots
```

---

## 🚀 Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

### Backend

```powershell
cd Backend
docker compose up -d
.\run-dev.ps1
```

Backend runs on:

```txt
http://localhost:8080
```

---

## 🔐 Privacy First

DevDay AI is not an employee tracker.

It does **not** include:

- ❌ screenshot tracking
- ❌ keystroke tracking
- ❌ raw browser history tracking
- ❌ private message reading
- ❌ Cursor prompt spying
- ❌ minute-by-minute monitoring

Developers review and edit summaries before sharing.

---

## 🤖 How We Used IBM BOB

IBM BOB was used as a real development partner during the hackathon.

BOB helped with:

- 🧠 project architecture planning
- ⚛️ React component generation
- 🧾 TypeScript type design
- 🧪 mock data and service-layer planning
- 🎯 focus workflow implementation
- 🛡️ Switch Guard debugging
- 🎨 UI polish and animations
- ☕ Spring Boot API planning
- 📚 README and presentation preparation

Hackathon-required BOB exports are included in:

```txt
bob_sessions/
```

This folder should contain:

- exported `.md` task histories
- screenshots of task consumption summaries

---

## 🧪 Core Demo Flow

1. Open the Today Dashboard.
2. View tasks from Jira, GitHub/Bitbucket, Calendar, Teams, and manual entries.
3. Select `AUTH-231` as active focus.
4. Start a focus session.
5. Add a work log.
6. Try switching to another task.
7. Use Switch Guard to pause with a resume note.
8. See the task appear in Open Loops.
9. Add a blocker.
10. Generate a Daily Summary.
11. Edit and submit the summary.
12. Generate a Weekly Summary.

---

## 🗺️ Roadmap

- [ ] IBM watsonx.ai integration
- [ ] Real Jira sync
- [ ] GitHub / Bitbucket integration
- [ ] Calendar integration
- [ ] Microsoft Teams integration
- [ ] Team lead dashboard
- [ ] Export summaries to Teams, Slack, or email
- [ ] Personal productivity insights

---

## 📌 Project Status

✅ Hackathon MVP ready  
✅ Frontend deployed  
✅ Focus workflow implemented  
✅ Switch Guard implemented  
✅ Work logs, blockers, open loops implemented  
✅ Daily and weekly summaries implemented  
✅ IBM BOB session exports prepared  

---

## 🎤 Elevator Pitch

**DevDay AI helps developers turn a scattered workday into a clear, focused workflow.**

It brings tasks, meetings, blockers, work logs, and summaries into one private dashboard, preserves context through Switch Guard and Open Loops, and generates editable AI reports at the end of the day.

---

## 🙌 Acknowledgments

Built for the **IBM BOB Hackathon** with IBM BOB as an AI coding and planning assistant.

---

<div align="center">

### DevDay AI

**Private by design. Useful by default.**

[🌐 Live Demo](https://dev-day-ai.vercel.app/)

</div>
