/**
 * Admin Account Creation Script
 *
 * Creates the initial platform administrator account.
 * Run this ONCE after setting up your database.
 * Safe to run again — will not create a duplicate if the email already exists.
 *
 * Usage:
 *   node utils/createAdmin.js
 *
 * Required environment variables in backend/.env:
 *   ADMIN_NAME     — Full name for the admin account
 *   ADMIN_EMAIL    — Email address for the admin account
 *   ADMIN_PASSWORD — Strong password (min 8 chars, uppercase, lowercase, number)
 *   MONGODB_URI    — Your MongoDB Atlas connection string
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import mongoose from "mongoose";
import User from "../models/User.js";

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in backend/.env");
    process.exit(1);
  }
  if (!ADMIN_EMAIL) {
    console.error("❌ ADMIN_EMAIL is not set in backend/.env");
    process.exit(1);
  }
  if (!ADMIN_PASSWORD) {
    console.error("❌ ADMIN_PASSWORD is not set in backend/.env");
    process.exit(1);
  }
  if (!ADMIN_NAME) {
    console.error("❌ ADMIN_NAME is not set in backend/.env");
    process.exit(1);
  }

  // Validate password strength
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!PASSWORD_REGEX.test(ADMIN_PASSWORD)) {
    console.error("❌ ADMIN_PASSWORD must be at least 8 characters with an uppercase letter, lowercase letter, and number.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ MongoDB connected.");

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
    if (existing) {
      if (existing.role === "admin") {
        console.log(`ℹ Admin account already exists: ${existing.email}`);
      } else {
        console.error(`❌ An account with email ${ADMIN_EMAIL} already exists but is not an admin (role: ${existing.role}).`);
        console.error("   Choose a different email or remove the existing account first.");
        process.exit(1);
      }
      return;
    }

    // Create admin account
    const admin = await User.create({
      fullName: ADMIN_NAME.trim(),
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    });

    console.log("✅ Admin account created successfully!");
    console.log(`   Name:  ${admin.fullName}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log("");
    console.log("🔒 Security reminder:");
    console.log("   - Remove ADMIN_PASSWORD from your .env after confirming login works.");
    console.log("   - Use a strong, unique password.");
    console.log("   - Never share the admin credentials.");

  } catch (err) {
    console.error("❌ Failed to create admin account:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✓ MongoDB disconnected.");
  }
};

createAdmin();
