import nodemailer from "nodemailer";

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

let transporter = null;

const getTransporter = () => {
  if (!isSmtpConfigured()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }

  return transporter;
};

/**
 * Sends an email, or — when SMTP isn't configured — logs a safe summary and
 * the link to the console so local development keeps working without a mail
 * server. This console fallback is a development convenience only; a
 * production deployment must configure real SMTP credentials.
 */
const sendEmail = async ({ to, subject, html, devFallbackUrl }) => {
  const client = getTransporter();

  if (!client) {
    console.log(`[emailService] SMTP not configured — logging email instead of sending.`);
    console.log(`[emailService] To: ${to} | Subject: ${subject}`);
    if (devFallbackUrl) console.log(`[emailService] Link: ${devFallbackUrl}`);
    return;
  }

  await client.sendMail({
    from: process.env.EMAIL_FROM || "Smart Bionote Reader <no-reply@smartbionotereader.com>",
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your Smart Bionote Reader account",
    html: `
      <p>Hi ${user.fullName},</p>
      <p>Welcome to Smart Bionote Reader! Please verify your email address to activate your account:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `,
    devFallbackUrl: verifyUrl,
  });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Smart Bionote Reader password",
    html: `
      <p>Hi ${user.fullName},</p>
      <p>We received a request to reset your password. This link expires in 1 hour:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email — your password will not change.</p>
    `,
    devFallbackUrl: resetUrl,
  });
};

export const sendInvitationEmail = async (teacher, rawToken) => {
  const acceptUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${rawToken}`;

  await sendEmail({
    to: teacher.email,
    subject: "You've been invited to join Smart Bionote Reader as a Teacher",
    html: `
      <p>Hi ${teacher.fullName},</p>
      <p>You have been invited to join <strong>Smart Bionote Reader</strong> as a teacher.</p>
      <p>Click the link below to set your password and activate your account:</p>
      <p><a href="${acceptUrl}">${acceptUrl}</a></p>
      <p>This invitation expires in <strong>48 hours</strong>. If you did not expect this invitation, you can ignore this email.</p>
    `,
    devFallbackUrl: acceptUrl,
  });
};
