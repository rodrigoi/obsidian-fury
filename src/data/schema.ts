import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { InferInsertModel } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const trulyRemote = sqliteTable("truly-remote", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listingId").notNull().unique(),
  companyName: text("companyName").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  regions: text("regions"),
  url: text("url").notNull(),
  publishedAt: text("publishedAt").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type TrulyRemote = InferInsertModel<typeof trulyRemote>;

export const hackernews = sqliteTable("hackernews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("postid").notNull().unique(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  publishedAt: text("publishedat").notNull(),
  createdAt: text("createdat")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
