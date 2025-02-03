import { env } from "@/env";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/data/schema.ts",
  out: "./src/data/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_URL,
  },
} satisfies Config;
