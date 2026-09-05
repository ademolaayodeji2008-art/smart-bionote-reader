import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const DURATION_UNITS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

/** Converts a duration string like "7d", "15m", "3600s" into milliseconds. */
export const parseDurationToMs = (duration) => {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  const [, amount, unit] = match;
  return Number(amount) * DURATION_UNITS[unit];
};

/** Signs a JWT access token carrying only the non-sensitive claims needed to identify the user. */
export const signAccessToken = (user, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

/** Verifies a JWT access token. Throws on invalid/expired tokens — callers should catch. */
export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

/**
 * Generates a secure random token for one-time use (email verification, password reset).
 * Returns both the raw token (sent to the user) and its SHA-256 hash (stored in the DB) —
 * so a database read alone is never enough to impersonate the link.
 */
export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export const hashToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");
