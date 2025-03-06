import { pgEnum, pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const expenseTypeEnum = pgEnum("expense_type", ["fuel", "maintenance", "insurance", "car_payment", "cleaning", "parking", "tolls", "other"]);

export const expensesTable = pgTable("expenses", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  // DEPRECATED: These fields are kept for backward compatibility but are no longer used in the UI
  receiptUrl: text("receipt_url"),
  isTaxDeductible: text("is_tax_deductible"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertExpense = typeof expensesTable.$inferInsert;
export type SelectExpense = typeof expensesTable.$inferSelect; 