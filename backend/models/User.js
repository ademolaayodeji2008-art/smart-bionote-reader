import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      // Not required for Google-authenticated accounts that never set a password.
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Password reset / email verification tokens are stored as SHA-256 hashes,
    // never the raw token that goes out in the email link.
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // Lets auth middleware invalidate JWTs issued before a password change,
    // without needing a server-side session/token blacklist.
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  if (!this.isNew) this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.wasPasswordChangedAfter = function wasPasswordChangedAfter(jwtIssuedAtSeconds) {
  if (!this.passwordChangedAt) return false;
  const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIssuedAtSeconds < changedAtSeconds;
};

// Fields that must never leave the API, even accidentally via res.json(user).
const SENSITIVE_FIELDS = [
  "password",
  "googleId",
  "emailVerificationToken",
  "emailVerificationExpires",
  "passwordResetToken",
  "passwordResetExpires",
  "passwordChangedAt",
  "__v",
];

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    for (const field of SENSITIVE_FIELDS) delete ret[field];
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
