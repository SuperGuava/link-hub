import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const link = pgTable("link", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  originalUrl: text("original_url").notNull(),
  slug: text("slug").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  clickLimit: integer("click_limit"),
  clickCount: integer("click_count").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
