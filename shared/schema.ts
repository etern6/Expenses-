import { pgTable, text, serial, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define expense categories
export const categoryEnum = pgEnum('category', [
  'food',
  'transportation',
  'housing',
  'entertainment',
  'shopping',
  'healthcare',
  'travel',
  'education',
  'other'
]);

// Define expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: categoryEnum("category").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define insert schema for expense validation
export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.number().positive("Amount must be positive"),
    date: z.coerce.date(),
  });

export const updateExpenseSchema = insertExpenseSchema.extend({
  id: z.number(),
});

// Types
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

// Category mapping for display names
export const categoryDisplayNames: Record<string, string> = {
  food: "Food & Dining",
  transportation: "Transportation",
  housing: "Housing & Utilities",
  entertainment: "Entertainment",
  shopping: "Shopping",
  healthcare: "Healthcare",
  travel: "Travel",
  education: "Education",
  other: "Other",
};

// Summary statistics types
export interface ExpenseSummary {
  totalExpenses: number;
  monthlyExpenses: number;
  topCategory: string;
  lastEntry: string;
  percentChange: number;
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
