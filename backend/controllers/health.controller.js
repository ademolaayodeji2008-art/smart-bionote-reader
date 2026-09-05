import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @route   GET /api/health
 * @desc    Reports API liveness for uptime checks and local verification
 */
export const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
  });
});
