# Smart Bionote Reader — Backend

Express.js REST API for Smart Bionote Reader, built with an MVC architecture.

## Stack

Node.js · Express.js · MongoDB Atlas · Mongoose · JWT · bcryptjs · Multer · Cloudinary ·
express-validator · express-rate-limit · nodemailer · google-auth-library

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your MongoDB Atlas + Cloudinary credentials
npm run dev
```

The API starts on `http://localhost:5000` (or `PORT` from your `.env`).

## Scripts

| Script          | Description                          |
| ---------------- | ------------------------------------- |
| `npm run dev`    | Start the server with nodemon (auto-restart) |
| `npm start`      | Start the server with node            |

## Environment Variables

See `.env.example` for the full list. At minimum you need:

| Variable                | Description                                  |
| ------------------------ | --------------------------------------------- |
| `PORT`                   | Port the server listens on                    |
| `MONGODB_URI`            | MongoDB Atlas connection string               |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary account cloud name                 |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                            |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                         |
| `JWT_SECRET`             | Secret used to sign auth JWTs — keep this out of source control |
| `JWT_EXPIRES_IN`         | Access token lifetime when "remember me" is checked (e.g. `7d`) |
| `CLIENT_URL`             | Frontend origin(s) allowed by CORS, comma-separated               |
| `FRONTEND_URL`           | Base URL used to build email verification/reset links             |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials for transactional email. If unset, emails are logged to the console instead (development only). |
| `EMAIL_FROM`             | From address for outgoing email                                   |
| `GOOGLE_CLIENT_ID`       | OAuth 2.0 Client ID used to verify Google Sign-In tokens           |

## Folder Structure (MVC)

```
backend/
├── config/       Third-party service setup (MongoDB, Cloudinary)
├── controllers/  Request handlers — business logic lives here
├── middleware/   Cross-cutting request/response logic (auth, roles, validation, rate limits, errors)
├── models/       Mongoose schemas
├── routes/       Express routers mapping URLs to controllers
├── services/     Reusable business logic shared across controllers (email, etc.)
├── validators/   express-validator input rules per endpoint
├── utils/        Pure helper functions (tokens, cookies, error/response shaping)
├── uploads/      Local scratch space before files are pushed to Cloudinary
├── app.js        Express app assembly (middleware + routes)
└── server.js     Entry point — loads env vars, connects to MongoDB, starts the server
```

## API

### Health Check

```
GET /api/health
```

```json
{
  "success": true,
  "message": "Server is running."
}
```

### Authentication

All endpoints are under `/api/auth`. The auth token is set as an httpOnly cookie — the
frontend never reads or stores it directly.

| Method | Endpoint             | Auth required | Description                                  |
| ------ | --------------------- | -------------- | --------------------------------------------- |
| POST   | `/register`           | No             | Create a student or teacher account (never admin) |
| POST   | `/login`               | No             | Email/password login; sets the auth cookie    |
| POST   | `/logout`              | No             | Clears the auth cookie                        |
| GET    | `/me`                  | Yes            | Returns the current authenticated user        |
| GET    | `/verify-email`        | No             | Confirms email via `?token=` from the verification email |
| POST   | `/forgot-password`     | No             | Always returns a generic response; emails a reset link if the account exists |
| POST   | `/reset-password`      | No             | Sets a new password from a valid reset token  |
| POST   | `/google`              | No             | Verifies a Google ID token and logs in/creates the user |

Admin accounts cannot be created through `/register` — they must be inserted directly in
the database (e.g. via `mongosh` or an internal script) by an existing administrator.

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and allow-list your IP (or `0.0.0.0/0` for local development)
3. Copy the connection string into `MONGODB_URI` in your `.env`

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret from the dashboard into `.env`
