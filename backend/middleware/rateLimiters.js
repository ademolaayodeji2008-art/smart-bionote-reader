import rateLimit from "express-rate-limit";

const limiterResponse = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

/** Slows down credential-guessing on login without punishing normal use. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse("Too many login attempts. Please try again in 15 minutes."),
});

/** Prevents mass account creation / email enumeration via registration. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse("Too many accounts created from this location. Please try again later."),
});

/** Forgot/reset password share a limiter since both are token-guessing targets. */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse("Too many attempts. Please try again later."),
});

/** Prevents quiz-spam / answer-fishing. Max 30 quiz submissions per hour. */
export const quizSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse("Too many quiz submissions. Please wait before trying again."),
});

/** Limits file upload frequency to reduce Cloudinary abuse. */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse("Too many upload requests. Please wait and try again."),
});
