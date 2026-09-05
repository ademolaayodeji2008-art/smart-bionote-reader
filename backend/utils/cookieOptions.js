import { parseDurationToMs } from "./tokenUtils.js";

export const AUTH_COOKIE_NAME = "sbr_token";

const SHORT_SESSION_DURATION = "1d";

/**
 * Cookie options for the auth token. `rememberMe` extends the cookie (and the
 * JWT it carries) to the full JWT_EXPIRES_IN lifetime; otherwise it expires
 * after one day. `secure` is forced on in production so the cookie is never
 * sent over plain HTTP.
 */
export const getAuthCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: parseDurationToMs(rememberMe ? process.env.JWT_EXPIRES_IN : SHORT_SESSION_DURATION),
  path: "/",
});

export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

export const getTokenExpiryFor = (rememberMe) => (rememberMe ? process.env.JWT_EXPIRES_IN : SHORT_SESSION_DURATION);
