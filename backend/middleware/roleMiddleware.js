import { AppError } from "../utils/AppError.js";

/**
 * Restricts a route to one or more roles. Must run after `protect`, which
 * attaches `req.user`. Usage: `requireRole("teacher", "admin")`.
 */
export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new AppError("You must be logged in to access this resource.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("You do not have permission to access this resource.", 403);
    }

    next();
  };
