import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { subscription } from "./subscription";

export const paymentStatusEnum = pgEnum("payment_status", [
  "DONE",
  "FAILED",
  "CANCELED",
]);

export const payment = pgTable("payment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscription.id, { onDelete: "cascade" }),
  orderId: text("order_id").notNull().unique(),
  paymentKey: text("payment_key"),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  status: paymentStatusEnum("status").notNull(),
  paidAt: timestamp("paid_at"),
  failureMessage: text("failure_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
