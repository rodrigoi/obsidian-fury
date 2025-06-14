import { register } from "@/metrics/client";
import { env } from "bun";

export const startMetricsServer = async () => {
  const server = Bun.serve({
    port: env.METRICS_PORT,
    hostname: "0.0.0.0",
    async fetch(request) {
      if (request.url.endsWith("/metrics")) {
        return new Response(await register.metrics(), {
          headers: {
            "Content-Type": register.contentType,
          },
        });
      }
      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`Metrics server listening on ${server.url}`);
};
