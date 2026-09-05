/**
 * An error with a known HTTP status and a message safe to show to the user.
 * The global error handler trusts `isOperational` errors to already carry a
 * safe message, and masks everything else behind a generic 500 response.
 */
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
