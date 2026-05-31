import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const subscriptionPlanTypeEnum = pgEnum("subscription_plan_type", [
  "FREE",
  "PRO",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELED",
  "PAST_DUE",
]);

export const subscription = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planType: subscriptionPlanTypeEnum("plan_type").notNull().default("FREE"),
    status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    customerKey: text("customer_key"),
    billingKey: text("billing_key"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    lastPaymentAt: timestamp("last_payment_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("subscription_user_id_idx").on(table.userId)],
);
