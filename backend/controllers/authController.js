import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import TeacherProfile from "../models/TeacherProfile.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { signAccessToken, generateSecureToken, hashToken } from "../utils/tokenUtils.js";
import { AUTH_COOKIE_NAME, getAuthCookieOptions, getClearCookieOptions, getTokenExpiryFor } from "../utils/cookieOptions.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new student or teacher account (never admin) and
 *          emails a verification link. The account cannot log in until verified.
 */
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  // Role is NEVER taken from the request body.
  // Public registration always creates a student account.
  // Teachers are created only via the admin invitation system.
  const assignedRole = "student";

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const { rawToken, hashedToken } = generateSecureToken();

  const user = await User.create({
    fullName,
    email,
    password,
    role: assignedRole,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: Date.now() + EMAIL_VERIFICATION_TTL_MS,
  });

  // Auto-create the role-appropriate profile. If this fails we log the error
  // but do NOT roll back the user — the account is still usable and the
  // profile can be recreated. A missing profile is a soft failure.
  try {
    if (assignedRole === "student") {
      await StudentProfile.create({ user: user._id });
    } else if (assignedRole === "teacher") {
      await TeacherProfile.create({ user: user._id });
    }
  } catch (profileError) {
    console.error(`[authController] Profile creation failed for user ${user._id}:`, profileError.message);
  }

  await sendVerificationEmail(user, rawToken);

  sendSuccess(res, {
    statusCode: 201,
    message: "Account created. Please check your email to verify your account before logging in.",
    data: { user },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates with email/password and sets an httpOnly auth cookie.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.password) {
    throw new AppError("This account uses Google Sign-In. Please continue with Google.", 401);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before continuing.", 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user, getTokenExpiryFor(rememberMe));
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(rememberMe));

  sendSuccess(res, { message: "Login successful.", data: { user } });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clears the auth cookie. Safe to call even without a valid session.
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
  sendSuccess(res, { message: "Logged out successfully." });
});

/**
 * @route   GET /api/auth/me
 * @desc    Returns the currently authenticated user (via `protect` middleware).
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: "Current user retrieved.", data: { user: req.user } });
});

/**
 * @route   GET /api/auth/verify-email
 * @desc    Confirms a user's email using the token emailed at registration.
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const hashedToken = hashToken(token);

  const user = await User.findOne({ emailVerificationToken: hashedToken }).select(
    "+emailVerificationToken +emailVerificationExpires",
  );

  if (!user) {
    throw new AppError("This verification link is invalid or has already been used.", 400, "TOKEN_INVALID");
  }

  if (user.emailVerificationExpires.getTime() < Date.now()) {
    throw new AppError("Your verification link has expired. Please request a new one.", 400, "TOKEN_EXPIRED");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  sendSuccess(res, { message: "Email verified successfully. You can now log in." });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Emails a password-reset link. Always responds with the same
 *          generic message so account existence is never revealed.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const { rawToken, hashedToken } = generateSecureToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + PASSWORD_RESET_TTL_MS;
    await user.save();
    await sendPasswordResetEmail(user, rawToken);
  }

  sendSuccess(res, {
    message: "If an account exists with that email, password reset instructions have been sent.",
  });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Sets a new password from a valid, unexpired reset token, then
 *          clears the token and signs the browser out everywhere.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const hashedToken = hashToken(token);

  const user = await User.findOne({ passwordResetToken: hashedToken }).select(
    "+passwordResetToken +passwordResetExpires",
  );

  if (!user) {
    throw new AppError("This password reset link is invalid or has already been used.", 400, "TOKEN_INVALID");
  }

  if (user.passwordResetExpires.getTime() < Date.now()) {
    throw new AppError("Your password reset link has expired. Please request a new one.", 400, "TOKEN_EXPIRED");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

  sendSuccess(res, { message: "Your password has been reset successfully. Please log in with your new password." });
});

/**
 * @route   POST /api/auth/google
 * @desc    Verifies a Google ID token server-side, then creates or logs in
 *          the matching user. Never trusts client-supplied profile data.
 */
export const googleAuthLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new AppError("Google sign-in verification failed. Please try again.", 401);
  }

  if (!payload?.email_verified) {
    throw new AppError("Your Google account's email address is not verified.", 401);
  }

  const normalizedEmail = payload.email.toLowerCase().trim();
  let user = await User.findOne({ googleId: payload.sub });

  if (!user) {
    user = await User.findOne({ email: normalizedEmail });

    if (user) {
      user.googleId = payload.sub;
      user.isEmailVerified = true;
      if (!user.profileImage && payload.picture) user.profileImage = payload.picture;
    } else {
      user = new User({
        fullName: payload.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId: payload.sub,
        isEmailVerified: true,
        profileImage: payload.picture || null,
        role: "student",
      });
    }
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  const isNewUser = user.isNew;

  user.lastLoginAt = new Date();
  await user.save();

  // For brand-new Google sign-ups, auto-create the profile (students only via Google)
  if (isNewUser) {
    try {
      await StudentProfile.create({ user: user._id });
    } catch (profileError) {
      console.error(`[authController] Profile creation failed for Google user ${user._id}:`, profileError.message);
    }
  }

  const token = signAccessToken(user, getTokenExpiryFor(true));
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(true));

  sendSuccess(res, { message: "Signed in with Google successfully.", data: { user } });
});
