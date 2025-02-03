import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { env } from "@/env";

const client = new SQL(env.DB_URL);
const db = drizzle({ client });
