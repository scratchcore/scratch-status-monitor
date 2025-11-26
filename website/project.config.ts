export type ProjectConfig = {
  origin: string;
  // Cron interval in minutes used by scheduled handler and alignment logic
  cronIntervalMinutes: number;
  // Human-friendly cron expression for wrangler.jsonc (not auto-synced)
  cronExpression: string;
};

export const projectConfig: ProjectConfig = {
  origin: "scratch-status-monitor.scratchcore.org",
  // Cloudflare cron configuration used by server code. Update here to change
  // scheduled behavior (minutes and cron expression used for documentation/deploy).
  cronIntervalMinutes: 5,
  cronExpression: "*/5 * * * *",
};
