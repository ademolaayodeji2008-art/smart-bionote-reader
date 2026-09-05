/**
 * Wraps an async Express route handler so rejected promises are
 * forwarded to the global error handler instead of crashing the app.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
