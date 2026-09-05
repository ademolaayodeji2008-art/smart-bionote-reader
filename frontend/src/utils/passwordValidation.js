/**
 * Frontend mirror of the backend's password policy — used for instant
 * feedback only. The backend re-validates on every request and is the
 * final authority.
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_REQUIREMENT_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.";

export const PASSWORD_RULES = [
  { test: (value) => value.length >= 8, label: "At least 8 characters" },
  { test: (value) => /[A-Z]/.test(value), label: "One uppercase letter" },
  { test: (value) => /[a-z]/.test(value), label: "One lowercase letter" },
  { test: (value) => /\d/.test(value), label: "One number" },
];

/** Returns how many of the four rules a password satisfies, 0–4. */
export const getPasswordStrength = (password = "") =>
  PASSWORD_RULES.filter((rule) => rule.test(password)).length;
