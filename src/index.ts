#!/usr/bin/env bun

import { startMetricsServer } from "@/metrics/server";
import hackerNews from "@/workers/hacker-news";
import trulyRemote from "@/workers/truly-remote";
import arg from "arg";
import cron from "node-cron";
import { z } from "zod";
import { version } from "../package.json";

/**
 * available worker names validation schema
 */
const workersSchema = z.enum(["hacker-news", "truly-remote"]);
type Workers = z.infer<typeof workersSchema>;

/**
 * Schema for validating array of worker names
 */
const workersArraySchema = z.array(workersSchema);

/**
 * available workers mappings with strong typing
 */
const availableWorkers: Record<Workers, () => Promise<void>> = {
  "hacker-news": hackerNews,
  "truly-remote": trulyRemote,
} as const;

/**
 * process arguments
 */
const args = arg(
  {
    // Types
    "--help": Boolean,
    "--version": Boolean,
    "--metrics": Boolean,
    "--worker": [String], // --worker <string> or --worker=<string> (can be specified multiple times)

    // Aliases
    "-w": "--worker", // -w <string>; result is stored in --worker
  },
  {
    argv: Bun.argv,
  }
);

/**
 * Application entry point.
 */
const main = async () => {
  if (args["--version"]) {
    console.log(`v${version}`);
    process.exit(0);
  }

  if (args["--metrics"]) {
    await startMetricsServer();
  }

  if (args["--worker"]) {
    // Validate array of worker names
    const parsedWorkers = workersArraySchema.safeParse(args["--worker"]);

    if (!parsedWorkers.success) {
      console.log("Invalid worker names provided");
      process.exit(1);
    }

    // Execute each worker sequentially
    for (const workerName of parsedWorkers.data) {
      /**
       * schedule cron job to run every 30 minutes
       */
      cron.schedule("* * * * *", async () => {
        console.log("Running worker", workerName);
        const worker = availableWorkers[workerName];
        // start the worker process
        await worker();
      });

      // const worker = availableWorkers[workerName];
      // // start the worker process
      // await worker();
    }
  }
};

/**
 * Global error handler.
 */
main().catch((err) => {
  console.log("Something went wrong...");

  if (err instanceof Error) {
    console.error(err);
  } else {
    console.error("Unknown error");
    console.log(err);
  }

  process.exit(1);
});
