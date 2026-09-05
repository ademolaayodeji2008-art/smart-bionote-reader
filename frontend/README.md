# Smart Bionote Reader — Frontend

React 19 + Vite PWA client for Smart Bionote Reader.

## Stack

React 19 · Vite · JavaScript (ES2023) · Tailwind CSS v4 · React Router · Axios ·
React Hook Form · vite-plugin-pwa

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Vite serves the app on `http://localhost:5173` by default (or the next free port).

## Scripts

| Script            | Description                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`      | Start the Vite dev server                 |
| `npm run build`    | Production build (also generates the PWA service worker + manifest) |
| `npm run preview`  | Serve the production build locally        |
| `npm run lint`     | Lint the codebase with oxlint             |

## Environment Variables

| Variable              | Description                        |
| ---------------------- | ----------------------------------- |
| `VITE_API_BASE_URL`    | Base URL of the backend API         |

## Folder Structure

```
src/
├── assets/      Images, fonts, and other bundled static assets
├── components/  Reusable, presentation-focused UI components
├── pages/       Route-level views
├── layouts/     Shared page shells (navbar/footer wrapper, etc.)
├── hooks/       Reusable stateful logic
├── context/     React context providers
├── services/    API clients (Axios instance)
├── routes/      React Router route definitions
├── utils/       Constants and pure helper functions
└── styles/      Global stylesheet + Tailwind theme
```

## PWA

The app is a fully configured, installable PWA:

- `vite-plugin-pwa` generates the manifest and service worker at build time
- Static assets, pages, and images are cached with distinct Workbox strategies
- `public/offline.html` is served when the user is offline and requests an uncached page
- App icons live in `public/icons/` (192, 512, and a maskable 512 variant)

Run `npm run build && npm run preview` to test installability and offline behavior — PWA
features are intentionally disabled in `npm run dev` for faster iteration.
