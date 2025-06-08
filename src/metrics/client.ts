import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

const register = new Registry();

// Collect default metrics like process memory, CPU usage, etc.
collectDefaultMetrics({ prefix: "obsidian_fury_", register });

// Worker metrics
export const workerExecutionDuration = new Histogram({
  name: "worker_execution_duration_seconds",
  help: "Duration of worker execution in seconds",
  labelNames: ["worker_name"],
  registers: [register],
});

export const workerExecutionTotal = new Counter({
  name: "worker_execution_total",
  help: "Total number of worker executions",
  labelNames: ["worker_name"],
  registers: [register],
});

export const workerErrorsTotal = new Counter({
  name: "worker_errors_total",
  help: "Total number of worker errors",
  labelNames: ["worker_name"],
  registers: [register],
});

export const newStoriesFound = new Counter({
  name: "new_stories_found_total",
  help: "Total number of new stories found",
  labelNames: ["worker_name"],
  registers: [register],
});

// Database metrics
export const dbOperationDuration = new Histogram({
  name: "db_operation_duration_seconds",
  help: "Duration of database operations in seconds",
  labelNames: ["operation"],
  registers: [register],
});

// Email metrics
export const emailSendDuration = new Histogram({
  name: "email_send_duration_seconds",
  help: "Duration of email sending in seconds",
  registers: [register],
});

export const emailSendTotal = new Counter({
  name: "email_send_total",
  help: "Total number of emails sent",
  registers: [register],
});

export const emailSendErrors = new Counter({
  name: "email_send_errors_total",
  help: "Total number of email sending errors",
  registers: [register],
});

export { register };
