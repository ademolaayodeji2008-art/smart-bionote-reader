# Architecture

## Overview

Smart Bionote Reader is split into two independently deployable apps that communicate over a
REST API:

```
┌─────────────┐        HTTPS / JSON        ┌─────────────┐
│  frontend    │  ─────────────────────►   │  backend     │
│  React + PWA │  ◄─────────────────────   │  Express MVC │
└─────────────┘                            └──────┬───────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  MongoDB Atlas    │
                                          └──────────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Cloudinary        │
                                          │  (media storage)   │
                                          └──────────────────┘
```

## Frontend

- **Vite** builds and serves the React 19 app.
- **vite-plugin-pwa** generates the web app manifest and service worker at build time
  (`generateSW` strategy, `autoUpdate` registration).
- **Tailwind CSS v4** is wired in through `@tailwindcss/vite` (CSS-first config — brand colors,
  fonts, and animations are declared in `src/styles/index.css` via `@theme`, not a JS config file).
- **React Router** handles client-side navigation; `src/routes/AppRoutes.jsx` is the single
  source of truth for routes.
- Folder responsibilities:
  - `components/` — small, reusable, presentation-focused UI pieces (Button, Logo, Navbar…)
  - `pages/` — route-level views composed from components
  - `layouts/` — shared page shells (e.g. `MainLayout` wraps pages with the navbar/footer)
  - `hooks/` — reusable stateful logic (e.g. `usePWAInstall`)
  - `context/` — React context + providers for cross-cutting state
  - `services/` — external I/O (the Axios instance in `services/api.js`)
  - `routes/` — route definitions
  - `utils/` — pure helpers and constants
  - `styles/` — global stylesheet and Tailwind theme

## Backend

Follows the MVC pattern with a clear separation of concerns:

- `config/` — third-party service setup (MongoDB connection, Cloudinary client)
- `models/` — Mongoose schemas (empty for now — added as features are built)
- `controllers/` — request handlers; contain the actual business logic
- `routes/` — Express routers that map URLs to controllers
- `middleware/` — cross-cutting request/response logic (404 handling, error handling)
- `services/` — reusable business logic shared across controllers (empty for now)
- `utils/` — pure helper functions (e.g. `asyncHandler`)
- `uploads/` — local scratch space before files are pushed to Cloudinary

`app.js` assembles the Express application (middleware + routes); `server.js` is the entry point
that loads environment variables, connects to MongoDB, and starts listening. Keeping `app.js`
separate from `server.js` makes the Express app easy to import and test in isolation.

## Why this phase has no auth

Authentication, data models, and every other product feature are deliberately deferred so the
foundation — tooling, branding, PWA behavior, and architecture — can be reviewed and locked in
first. See [ROADMAP.md](ROADMAP.md) for what comes next.
