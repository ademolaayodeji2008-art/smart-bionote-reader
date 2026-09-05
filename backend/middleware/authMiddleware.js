import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/tokenUtils.js";
import { AUTH_COOKIE_NAME } from "../utils/cookieOptions.js";

/**
 * Verifies the auth cookie, loads the current user, and attaches it to
 * `req.user`. Rejects missing, invalid, expired, or stale (password since
 * changed) tokens, and deactivated accounts — all with the same generic
 * "not authenticated" message so no internal detail leaks to the client.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw new AppError("You must be logged in to access this resource.", 401);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError("Your session has expired. Please log in again.", 401);
  }

  const user = await User.findById(payload.sub).select("+passwordChangedAt");

  if (!user) {
    throw new AppError("Your session has expired. Please log in again.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  if (user.wasPasswordChangedAfter(payload.iat)) {
    throw new AppError("Your session has expired. Please log in again.", 401);
  }

  req.user = user;
  next();
});
