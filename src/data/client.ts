import { env } from "@/env";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export const db = drizzle(new Database(env.DB_URL));
