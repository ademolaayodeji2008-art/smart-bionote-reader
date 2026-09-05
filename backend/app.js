import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "").split(",").map((o) => o.trim()).filter(Boolean);

// ── Security headers (helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // In development, allow any localhost origin regardless of port
    if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // In production, check against the explicit allowlist
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Ensure CORS headers are present on error responses too
app.use((err, req, res, next) => {
  cors(corsOptions)(req, res, () => next(err));
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
