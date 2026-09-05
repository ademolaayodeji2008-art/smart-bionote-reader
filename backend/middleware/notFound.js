/**
 * Catches requests to undefined routes and forwards a 404 error
 * to the global error handler.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
