import { createFileRoute } from "@tanstack/react-router";
import { metrics } from "@/utils/metrics";

export const Route = createFileRoute("/api/metrics")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
          },
          application: metrics.getAllStats(),
        });
      },
    },
  },
});
