import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

/**
 * Runs after an array of express-validator checks. Rejects the request with
 * the first validation message if any check failed — keeps error responses
 * consistent instead of dumping the full error array to the client.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  next();
};
