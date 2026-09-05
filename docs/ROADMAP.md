# Roadmap

Recommendations for the phases that follow the project foundation. Nothing below is implemented
yet — this is a planning reference only.

## 1. Authentication

- User model (student / teacher roles) with Mongoose
- Register / login endpoints, JWT issuance + refresh
- Password hashing with bcryptjs
- Protected-route middleware and role-based access control
- Wire the existing `/login` and `/register` placeholder pages to real forms with React Hook Form

## 2. Bionote Reader Core

- Note model with rich text/audio content
- Synchronized reading: text highlighting in sync with audio playback
- Teacher upload flow for notes and media (Multer → Cloudinary)

## 3. Voice-Guided Drawing Tutorials

- Step-based tutorial model with audio narration per step
- Canvas or SVG-based drawing playback synced to audio

## 4. Quizzes & Assessment

- Quiz/question models, teacher quiz builder
- Auto-graded and instant-feedback quiz-taking flow

## 5. Progress Tracking & Gamification

- Per-student progress model (completion %, quiz scores, streaks)
- Leaderboards (class-level and global)
- Badges/achievements

## 6. Platform Hardening

- API input validation (e.g. express-validator or zod)
- Rate limiting and request logging
- Centralized structured logging (e.g. pino/winston)
- Automated tests (unit + integration) for both apps
- CI pipeline (lint, build, test on every PR)
- Push notifications for lesson reminders (PWA)

## 7. Deployment

- Backend: containerize and deploy (e.g. Render, Railway, or a Node host)
- Frontend: static hosting with CDN (e.g. Vercel, Netlify)
- Environment-specific configs and secrets management
