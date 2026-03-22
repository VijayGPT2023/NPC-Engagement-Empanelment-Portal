export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initScheduledTasks } = await import("@/lib/cron");
    initScheduledTasks();
  }
}
