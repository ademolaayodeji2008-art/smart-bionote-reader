/**
 * Maps a raw error (Mongoose, JWT, or otherwise) to a safe { statusCode, message }
 * pair. Anything not recognized here is treated as an unexpected 500 and never
 * has its raw message shown to the client.
 */
const toSafeError = (err) => {
  if (err.isOperational) {
    return { statusCode: err.statusCode, message: err.message, code: err.code };
  }

  if (err.name === "ValidationError") {
    const firstMessage = Object.values(err.errors)[0]?.message;
    return { statusCode: 400, message: firstMessage || "Invalid input." };
  }

  if (err.name === "CastError") {
    return { statusCode: 400, message: "Invalid resource identifier." };
  }

  if (err.code === 11000) {
    return { statusCode: 409, message: "An account with this email already exists." };
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Invalid or expired session. Please log in again." };
  }

  return { statusCode: 500, message: "Something went wrong. Please try again later." };
};

/**
 * Global error handler. Must be registered last, after all routes.
 * Normalizes every error into a consistent JSON response shape and never
 * leaks stack traces or internal error messages in production.
 */
export const errorHandler = (err, req, res, next) => {
  const { statusCode, message, code } = toSafeError(err);

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
