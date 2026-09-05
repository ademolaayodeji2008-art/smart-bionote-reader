# Smart Bionote Reader

> **"Read. Listen. Learn."**

Smart Bionote Reader is an educational Progressive Web App that helps students learn through
reading, listening, interactive quizzes, and teacher-created learning materials. This repository
currently contains the **project foundation** — the frontend and backend scaffolding, branding,
and PWA configuration that future features will be built on top of.

## Tech Stack

**Frontend** — React 19, Vite, JavaScript (ES2023), Tailwind CSS v4, React Router, Axios,
React Hook Form, vite-plugin-pwa.

**Backend** — Node.js, Express.js (MVC architecture), MongoDB Atlas, Mongoose, JWT, bcryptjs,
Multer, Cloudinary.

Both apps are written in plain JavaScript using ES Modules — no TypeScript, no CommonJS.

## Project Structure

```
smart-bionote-reader/
├── frontend/   React + Vite PWA client
├── backend/    Express MVC API
└── docs/       Project documentation
```

See [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for
details specific to each app.

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your MongoDB Atlas + Cloudinary credentials
npm run dev
```

The API starts on `http://localhost:5000` and exposes a health check at `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app starts on `http://localhost:5173` (Vite will pick the next free port if that one is busy).

## Environment Variables

Each app manages its own `.env` file — see `frontend/.env.example` and `backend/.env.example`.
A combined `.env.example` is also provided at the project root purely as a quick reference.

## Documentation

Additional project documentation lives in [docs/](docs/).

## Current Phase

This phase covers the **project foundation only**:

- Frontend and backend scaffolding with clean, modular architecture
- Tailwind CSS branding and a premium, accessible UI shell
- A fully configured, installable, offline-capable PWA
- Splash screen and landing page
- Express server wired up with MVC structure and a health check endpoint

Authentication and all other product features are intentionally **not** implemented yet — see
[docs/ROADMAP.md](docs/ROADMAP.md) for what's planned next.
