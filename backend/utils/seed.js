/**
 * Development seed script — creates initial subjects.
 *
 * Safe to run repeatedly: uses upsert (findOneAndUpdate with upsert:true)
 * so re-running never creates duplicates.
 *
 * Usage:
 *   node backend/utils/seed.js
 *
 * Requirements: MONGODB_URI must be set in backend/.env
 *
 * Does NOT create user accounts, admin accounts, or any auth-related data.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import Badge from "../models/Badge.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

const SUBSCRIPTION_PLANS = [
  { name: "1 Month", durationMonths: 1, amountKobo: 150000, currency: "NGN", description: "Full access for 1 month.", displayOrder: 1 },
  { name: "3 Months", durationMonths: 3, amountKobo: 400000, currency: "NGN", description: "Full access for 3 months. Save ₦500 vs monthly.", displayOrder: 2 },
  { name: "6 Months", durationMonths: 6, amountKobo: 800000, currency: "NGN", description: "Full access for 6 months. Save ₦1,000 vs monthly.", displayOrder: 3 },
  { name: "9 Months", durationMonths: 9, amountKobo: 1250000, currency: "NGN", description: "Full access for 9 months. Save ₦1,000 vs monthly.", displayOrder: 4 },
  { name: "12 Months", durationMonths: 12, amountKobo: 1600000, currency: "NGN", description: "Full access for 12 months. Best value — save ₦2,000.", displayOrder: 5 },
];

const SUBJECTS = [
  { name: "Biology", slug: "biology", description: "The study of living organisms.", icon: "Microscope" },
  { name: "Chemistry", slug: "chemistry", description: "The science of matter and its properties.", icon: "FlaskConical" },
  { name: "Physics", slug: "physics", description: "The study of matter, energy, space, and time.", icon: "Zap" },
  { name: "Mathematics", slug: "mathematics", description: "The abstract science of number, quantity, and space.", icon: "Calculator" },
  { name: "English Language", slug: "english-language", description: "Reading, writing, comprehension, and communication.", icon: "BookOpen" },
];

const BADGES = [
  { key: "FIRST_LESSON", name: "First Step", description: "Completed your first lesson.", icon: "BookOpen", requirementType: "lessons_completed", requirementValue: 1, xpReward: 50 },
  { key: "LESSON_5", name: "Getting Started", description: "Completed 5 lessons.", icon: "BookOpen", requirementType: "lessons_completed", requirementValue: 5, xpReward: 100 },
  { key: "LESSON_10", name: "Dedicated Learner", description: "Completed 10 lessons.", icon: "GraduationCap", requirementType: "lessons_completed", requirementValue: 10, xpReward: 200 },
  { key: "QUIZ_STARTER", name: "Quiz Starter", description: "Passed your first quiz.", icon: "ClipboardList", requirementType: "quizzes_completed", requirementValue: 1, xpReward: 50 },
  { key: "QUIZ_5", name: "Quiz Enthusiast", description: "Passed 5 quizzes.", icon: "ClipboardList", requirementType: "quizzes_completed", requirementValue: 5, xpReward: 150 },
  { key: "STREAK_3", name: "3-Day Streak", description: "Studied 3 days in a row.", icon: "Flame", requirementType: "streak_days", requirementValue: 3, xpReward: 75 },
  { key: "STREAK_7", name: "Week Warrior", description: "Studied 7 days in a row.", icon: "Flame", requirementType: "streak_days", requirementValue: 7, xpReward: 200 },
  { key: "STREAK_30", name: "Consistent Learner", description: "Studied 30 days in a row.", icon: "Trophy", requirementType: "streak_days", requirementValue: 30, xpReward: 500 },
  { key: "XP_500", name: "Rising Star", description: "Earned 500 XP.", icon: "Sparkles", requirementType: "xp_reached", requirementValue: 500, xpReward: 0 },
  { key: "XP_2000", name: "Biology Expert", description: "Earned 2000 XP.", icon: "Award", requirementType: "xp_reached", requirementValue: 2000, xpReward: 0 },
  { key: "PERFECT_SCORE", name: "Perfect Score", description: "Achieved an average quiz score of 90%+.", icon: "Star", requirementType: "perfect_score", requirementValue: 90, xpReward: 250 },
];

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set. Add it to backend/.env before seeding.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding.");

    let created = 0;
    let updated = 0;

    for (const subjectData of SUBJECTS) {
      const result = await Subject.findOneAndUpdate(
        { slug: subjectData.slug },
        { $setOnInsert: subjectData },
        { upsert: true, new: false },
      );
      if (result === null) { created++; console.log(`  ✓ Created subject: ${subjectData.name}`); }
      else { updated++; console.log(`  — Already exists: ${subjectData.name}`); }
    }

    console.log("\n--- Seeding badges ---");
    for (const badgeData of BADGES) {
      const result = await Badge.findOneAndUpdate(
        { key: badgeData.key },
        { $setOnInsert: badgeData },
        { upsert: true, new: false },
      );
      if (result === null) { created++; console.log(`  ✓ Created badge: ${badgeData.name}`); }
      else { updated++; console.log(`  — Already exists badge: ${badgeData.name}`); }
    }

    console.log(`\nSeeding complete: ${created} created, ${updated} already existed.`);

    console.log("\n--- Seeding subscription plans ---");
    for (const planData of SUBSCRIPTION_PLANS) {
      const result = await SubscriptionPlan.findOneAndUpdate(
        { name: planData.name },
        { $setOnInsert: planData },
        { upsert: true, new: false },
      );
      if (result === null) { created++; console.log(`  ✓ Created plan: ${planData.name} — ₦${planData.amountKobo / 100}`); }
      else { updated++; console.log(`  — Already exists plan: ${planData.name}`); }
    }

    console.log(`\nAll seeding complete.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seed();
