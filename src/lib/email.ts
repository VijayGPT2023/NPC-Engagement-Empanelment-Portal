import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_HOST) {
      console.warn("[Email] SMTP_HOST not configured. Email not sent:", options.subject);
      return false;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@npcindia.gov.in",
      ...options,
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

// Template helpers
export function applicationSubmittedEmail(name: string, appNo: string, postTitle: string): EmailOptions {
  return {
    to: "", // caller sets this
    subject: `Application ${appNo} Submitted - NPC Portal`,
    html: `<p>Dear ${name},</p><p>Your application <strong>${appNo}</strong> for <strong>${postTitle}</strong> has been submitted successfully.</p><p>You can track the status from your dashboard.</p><p>Regards,<br/>National Productivity Council</p>`,
    text: `Dear ${name}, Your application ${appNo} for ${postTitle} has been submitted successfully. Track status from your dashboard. Regards, NPC`,
  };
}

export function statusChangeEmail(name: string, appNo: string, newStatus: string): EmailOptions {
  return {
    to: "",
    subject: `Application ${appNo} Status Update - NPC Portal`,
    html: `<p>Dear ${name},</p><p>Your application <strong>${appNo}</strong> status has been updated to: <strong>${newStatus}</strong>.</p><p>Login to your dashboard for details.</p><p>Regards,<br/>National Productivity Council</p>`,
    text: `Dear ${name}, Your application ${appNo} status updated to: ${newStatus}. Login for details. Regards, NPC`,
  };
}
