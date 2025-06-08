import { Counter, Gauge, Histogram, Registry } from "prom-client";

const register = new Registry();

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

// System metrics
export const processCpuTotal = new Counter({
  name: "process_cpu_seconds_total",
  help: "Total user and system CPU time spent in seconds",
  registers: [register],
});

export const processMemoryUsage = new Gauge({
  name: "process_resident_memory_bytes",
  help: "Resident memory size in bytes",
  registers: [register],
});

export const processHeapSize = new Gauge({
  name: "process_heap_size_bytes",
  help: "Process heap size in bytes",
  registers: [register],
});

export { register };
