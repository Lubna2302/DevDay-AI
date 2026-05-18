# DevDay AI Frontend

Next.js frontend for **DevDay AI**, a developer-first productivity assistant for managing daily work, focus sessions, blockers, open loops, work logs, and AI-generated summaries.

Live demo: [https://dev-day-ai.vercel.app/](https://dev-day-ai.vercel.app/)

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

---

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Main UI Areas

- Today Dashboard
- Task list and manual task entry
- Active Focus and focus sessions
- Switch Guard modal
- Work log composer and feed
- Blocker panel
- Open Loops panel
- Daily Summary editor
- Weekly Summary editor

---

## Notes

The frontend is structured with mock/service boundaries so the UI can work independently and later connect cleanly to the Spring Boot backend APIs.
