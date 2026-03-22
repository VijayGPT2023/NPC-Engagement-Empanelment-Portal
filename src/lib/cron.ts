import prisma from "@/lib/prisma";
import { log } from "@/lib/logger";

let initialized = false;

export function initScheduledTasks() {
  if (initialized) return;
  initialized = true;

  // Run daily at midnight equivalent (check every hour, run tasks if due)
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0) {
      await runDailyTasks();
    }
  }, 60 * 60 * 1000); // every hour

  log("info", "Scheduled tasks initialized");
}

async function runDailyTasks() {
  await cleanupExpiredTokens();
  await checkDocumentExpiry();
  await closeExpiredPosts();
}

// Clean up expired data (sessions older than 30 days, etc.)
async function cleanupExpiredTokens() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Clean up old notifications (read, older than 30 days)
    const deleted = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    log("info", `Token cleanup: removed ${deleted.count} old notifications`);
  } catch (error) {
    log("error", "Token cleanup failed", { error: String(error) });
  }
}

// Check for document/certificate expiry (certifications with validTill)
async function checkDocumentExpiry() {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();

    // Find certifications expiring in next 30 days
    const expiringCerts = await prisma.certification.findMany({
      where: {
        validTill: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        application: {
          select: { userId: true, fullName: true },
        },
      },
    });

    // Create notifications for expiring certifications
    for (const cert of expiringCerts) {
      await prisma.notification.create({
        data: {
          userId: cert.application.userId,
          title: "Certificate Expiring Soon",
          message: `Your certification "${cert.certificationName}" is expiring on ${cert.validTill?.toLocaleDateString()}. Please renew and update your profile.`,
          type: "general",
        },
      });
    }

    log("info", `Document expiry check: ${expiringCerts.length} expiring certifications found`);
  } catch (error) {
    log("error", "Document expiry check failed", { error: String(error) });
  }
}

// Auto-close posts past their application deadline
async function closeExpiredPosts() {
  try {
    const now = new Date();
    const closed = await prisma.postRequirement.updateMany({
      where: {
        status: "active",
        applicationDeadline: { lt: now },
      },
      data: { status: "closed" },
    });

    if (closed.count > 0) {
      log("info", `Auto-closed ${closed.count} expired post(s)`);
    }
  } catch (error) {
    log("error", "Close expired posts failed", { error: String(error) });
  }
}
