#!/usr/bin/env bun

import arg from "arg";
import { z } from "zod";

/**
 * available worker names validation schema
 */
const workersSchema = z.enum(["hacker-news", "truly-remote"]);
type Workers = z.infer<typeof workersSchema>;

/**
 * available workers mappings
 */
const availableWorkers: Record<Workers, string> = {
  "hacker-news": "hacker-news.ts",
  "truly-remote": "truly-remote.ts",
};

/**
 * process arguments
 */
const args = arg(
  {
    // Types
    "--help": Boolean,
    "--version": Boolean,
    "--worker": String, // --worker <string> or --worker=<string>

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
  if (args["--worker"]) {
    const parsedWorker = workersSchema.safeParse(args["--worker"]);

    if (!parsedWorker.success) {
      console.log("invalid worker");
      process.exit(1);
    }

    const workerFile = availableWorkers[parsedWorker.data];

    // import the worker file. This will start the worker process.
    await import(`@/workers/${workerFile}`);
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
