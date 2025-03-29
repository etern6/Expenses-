import { format } from "date-fns";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { expenses, users } from "@shared/schema";
import type { Expense, InsertExpense, UpdateExpense, ExpenseSummary, User, InsertUser } from "@shared/schema";
import { categoryDisplayNames } from "@shared/schema";
import { IStorage } from "./storage";

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    // Convert amount to string if it's a number
    const amountStr = typeof expense.amount === 'number' ? String(expense.amount) : expense.amount;
    
    const result = await db.insert(expenses).values({
      description: expense.description,
      amount: amountStr,
      category: expense.category as any, // Type cast to handle category enum validation
      date: expense.date,
      notes: expense.notes
    }).returning();
    
    return result[0];
  }

  async updateExpense(expense: UpdateExpense): Promise<Expense | undefined> {
    // Check if expense exists
    const existingExpense = await this.getExpenseById(expense.id);
    if (!existingExpense) {
      return undefined;
    }

    // Convert amount to string if it's a number
    const amountStr = typeof expense.amount === 'number' ? String(expense.amount) : expense.amount;

    // Update expense
    const result = await db
      .update(expenses)
      .set({
        description: expense.description,
        amount: amountStr,
        category: expense.category,
        date: expense.date,
        notes: expense.notes
      })
      .where(eq(expenses.id, expense.id))
      .returning();

    return result[0];
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id)).returning({ id: expenses.id });
    return result.length > 0;
  }

  // Summary methods
  async getExpenseSummary(): Promise<ExpenseSummary> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get first day of current month
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    // Get first day of previous month
    const firstDayOfPreviousMonth = new Date(previousMonthYear, previousMonth, 1);
    // Get first day of next month (for range query)
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // Calculate total expenses
    const totalResult = await db
      .select({ total: sql<number>`sum(${expenses.amount}) as total` })
      .from(expenses);
    const totalExpenses = totalResult[0]?.total || 0;

    // Calculate this month's expenses
    const thisMonthResult = await db
      .select({ total: sql<number>`sum(${expenses.amount}) as total` })
      .from(expenses)
      .where(
        and(
          gte(expenses.date, firstDayOfCurrentMonth),
          sql`${expenses.date} < ${firstDayOfNextMonth}`
        )
      );
    const thisMonthExpenses = thisMonthResult[0]?.total || 0;

    // Calculate last month's expenses
    const lastMonthResult = await db
      .select({ total: sql<number>`sum(${expenses.amount}) as total` })
      .from(expenses)
      .where(
        and(
          gte(expenses.date, firstDayOfPreviousMonth),
          sql`${expenses.date} < ${firstDayOfCurrentMonth}`
        )
      );
    const lastMonthExpenses = lastMonthResult[0]?.total || 0;

    // Calculate percent change from last month
    const percentChange = lastMonthExpenses === 0 
      ? 0 
      : ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

    // Find top category
    const categoryResults = await db
      .select({
        category: expenses.category,
        total: sql<number>`sum(${expenses.amount}) as total`
      })
      .from(expenses)
      .groupBy(expenses.category)
      .orderBy(sql`sum(${expenses.amount}) desc`)
      .limit(1);

    const topCategory = categoryResults.length > 0
      ? String(categoryResults[0].category)
      : "other";

    // Get last entry
    const lastEntryResult = await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.date))
      .limit(1);

    const lastEntry = lastEntryResult.length > 0
      ? lastEntryResult[0].description
      : "No expenses yet";

    return {
      totalExpenses: Number(totalExpenses),
      monthlyExpenses: Number(thisMonthExpenses),
      topCategory: categoryDisplayNames[topCategory] || topCategory,
      lastEntry,
      percentChange: Number(percentChange)
    };
  }

  async getExpensesByCategory(): Promise<Record<string, number>> {
    const results = await db
      .select({
        category: expenses.category,
        total: sql<number>`sum(${expenses.amount}) as total`
      })
      .from(expenses)
      .groupBy(expenses.category);

    const categoryTotals: Record<string, number> = {};
    results.forEach(result => {
      categoryTotals[String(result.category)] = Number(result.total);
    });

    return categoryTotals;
  }

  async getExpensesByMonth(year: number): Promise<Record<string, number>> {
    // Initialize monthly totals with zero values
    const monthlyTotals: Record<string, number> = {};
    for (let month = 0; month < 12; month++) {
      const monthName = format(new Date(year, month, 1), 'MMM');
      monthlyTotals[monthName] = 0;
    }

    // Extract month from date and group by month
    const results = await db
      .select({
        month: sql<string>`to_char(${expenses.date}, 'Mon') as month`,
        total: sql<number>`sum(${expenses.amount}) as total`
      })
      .from(expenses)
      .where(sql`extract(year from ${expenses.date}) = ${year}`)
      .groupBy(sql`to_char(${expenses.date}, 'Mon')`);

    // Update monthly totals with actual data
    results.forEach(result => {
      monthlyTotals[result.month] = Number(result.total);
    });

    return monthlyTotals;
  }

  // Filter methods
  async filterExpenses(dateFrom?: Date, dateTo?: Date, category?: string): Promise<Expense[]> {
    let queryBuilder = db.select().from(expenses);
    let conditions = [];
    
    // Build conditions array
    if (dateFrom) {
      conditions.push(gte(expenses.date, dateFrom));
    }
    
    if (dateTo) {
      conditions.push(lte(expenses.date, dateTo));
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(expenses.category, category));
    }
    
    // Apply all conditions at once if they exist
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    // Execute query with ordering
    return await queryBuilder.orderBy(desc(expenses.date));
  }

  // Helper method to seed initial data if needed
  async seedInitialExpenses(): Promise<void> {
    // Check if there are any expenses
    const existingExpenses = await db.select().from(expenses).limit(1);
    
    // Only seed if there are no expenses
    if (existingExpenses.length === 0) {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const sampleExpenses = [
        {
          description: "Grocery Shopping",
          amount: "67.52",
          category: "food",
          date: today,
          notes: "Weekly groceries from Trader Joe's"
        },
        {
          description: "Netflix Subscription",
          amount: "14.99",
          category: "entertainment",
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
          notes: "Monthly subscription"
        },
        {
          description: "Gas Station",
          amount: "42.75",
          category: "transportation",
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
          notes: "Filled up the tank"
        },
        {
          description: "Electricity Bill",
          amount: "124.30",
          category: "housing",
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
          notes: "Monthly utility bill"
        },
        {
          description: "New Shoes",
          amount: "89.99",
          category: "shopping",
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
          notes: "Running shoes from Nike"
        },
        {
          description: "Dentist Appointment",
          amount: "75.00",
          category: "healthcare",
          date: lastMonth,
          notes: "Regular checkup"
        },
        {
          description: "Restaurant",
          amount: "48.35",
          category: "food",
          date: lastMonth,
          notes: "Dinner with friends"
        },
        {
          description: "Internet Bill",
          amount: "65.99",
          category: "housing",
          date: lastMonth,
          notes: "Monthly internet service"
        }
      ];
      
      // Insert sample expenses
      for (const expense of sampleExpenses) {
        try {
          await db.insert(expenses).values({
            description: expense.description,
            amount: expense.amount,
            category: expense.category as any, // Type cast to handle category validation
            date: expense.date,
            notes: expense.notes
          });
        } catch (error) {
          console.error(`Failed to insert expense: ${expense.description}`, error);
        }
      }
    }
  }
}