import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

/**
 * Validates that a named route parameter is a valid MongoDB ObjectId.
 * Usage: validateObjectId("id"), validateObjectId("classId")
 *
 * Prevents downstream services from receiving malformed IDs that would
 * cause a CastError deep in Mongoose — better to reject at the route level.
 */
export const validateObjectId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    throw new AppError(`Invalid identifier: ${paramName}.`, 400);
  }
  next();
};
