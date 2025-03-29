import { format } from "date-fns";
import { expenses, type Expense, type InsertExpense, type UpdateExpense, categoryDisplayNames, type ExpenseSummary, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods from original storage
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Expense methods
  getAllExpenses(): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(expense: UpdateExpense): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Summary methods
  getExpenseSummary(): Promise<ExpenseSummary>;
  getExpensesByCategory(): Promise<Record<string, number>>;
  getExpensesByMonth(year: number): Promise<Record<string, number>>;
  
  // Filter methods
  filterExpenses(dateFrom?: Date, dateTo?: Date, category?: string): Promise<Expense[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private expenses: Map<number, Expense>;
  private userCurrentId: number;
  private expenseCurrentId: number;

  constructor() {
    this.users = new Map();
    this.expenses = new Map();
    this.userCurrentId = 1;
    this.expenseCurrentId = 1;
    
    // Add some initial expenses (purely for development purposes)
    this.seedInitialExpenses();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseCurrentId++;
    const now = new Date();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: now,
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(updateExpense: UpdateExpense): Promise<Expense | undefined> {
    const existingExpense = this.expenses.get(updateExpense.id);
    if (!existingExpense) {
      return undefined;
    }

    const updatedExpense: Expense = {
      ...existingExpense,
      description: updateExpense.description,
      amount: updateExpense.amount,
      category: updateExpense.category,
      date: updateExpense.date,
      notes: updateExpense.notes,
    };

    this.expenses.set(updateExpense.id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Summary methods
  async getExpenseSummary(): Promise<ExpenseSummary> {
    const expenses = Array.from(this.expenses.values());
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate this month's expenses
    const thisMonthExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate last month's expenses
    const lastMonthExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousMonthYear;
      })
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate percent change from last month
    const percentChange = lastMonthExpenses === 0 ? 0 : ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    
    // Find top category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = String(expense.category);
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });
    
    let topCategory = "other";
    let maxAmount = 0;
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCategory = category;
      }
    });
    
    // Get last entry
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastEntry = sortedExpenses.length > 0 ? sortedExpenses[0].description : "No expenses yet";
    
    return {
      totalExpenses,
      monthlyExpenses: thisMonthExpenses,
      topCategory: categoryDisplayNames[topCategory] || topCategory,
      lastEntry,
      percentChange
    };
  }

  async getExpensesByCategory(): Promise<Record<string, number>> {
    const expenses = Array.from(this.expenses.values());
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = String(expense.category);
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });
    
    return categoryTotals;
  }

  async getExpensesByMonth(year: number): Promise<Record<string, number>> {
    const expenses = Array.from(this.expenses.values());
    const monthlyTotals: Record<string, number> = {};
    
    for (let month = 0; month < 12; month++) {
      const monthName = format(new Date(year, month, 1), 'MMM');
      monthlyTotals[monthName] = 0;
    }
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === year) {
        const monthName = format(expenseDate, 'MMM');
        monthlyTotals[monthName] = (monthlyTotals[monthName] || 0) + Number(expense.amount);
      }
    });
    
    return monthlyTotals;
  }

  // Filter methods
  async filterExpenses(dateFrom?: Date, dateTo?: Date, category?: string): Promise<Expense[]> {
    const expenses = Array.from(this.expenses.values());
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      const matchesDateFrom = !dateFrom || expenseDate >= dateFrom;
      const matchesDateTo = !dateTo || expenseDate <= dateTo;
      const matchesCategory = !category || category === 'all' || String(expense.category) === category;
      
      return matchesDateFrom && matchesDateTo && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Helper to seed initial expenses (for development purposes)
  private seedInitialExpenses() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const sampleExpenses: InsertExpense[] = [
      {
        description: "Grocery Shopping",
        amount: 67.52,
        category: "food",
        date: today,
        notes: "Weekly groceries from Trader Joe's"
      },
      {
        description: "Netflix Subscription",
        amount: 14.99,
        category: "entertainment",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        notes: "Monthly subscription"
      },
      {
        description: "Gas Station",
        amount: 42.75,
        category: "transportation",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
        notes: "Filled up the tank"
      },
      {
        description: "Electricity Bill",
        amount: 124.30,
        category: "housing",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
        notes: "Monthly utility bill"
      },
      {
        description: "New Shoes",
        amount: 89.99,
        category: "shopping",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
        notes: "Running shoes from Nike"
      },
      {
        description: "Dentist Appointment",
        amount: 75.00,
        category: "healthcare",
        date: lastMonth,
        notes: "Regular checkup"
      },
      {
        description: "Restaurant",
        amount: 48.35,
        category: "food",
        date: lastMonth,
        notes: "Dinner with friends"
      },
      {
        description: "Internet Bill",
        amount: 65.99,
        category: "housing",
        date: lastMonth,
        notes: "Monthly internet service"
      }
    ];
    
    sampleExpenses.forEach(expense => {
      const id = this.expenseCurrentId++;
      const now = new Date();
      const newExpense: Expense = {
        ...expense,
        id,
        createdAt: now
      };
      
      this.expenses.set(id, newExpense);
    });
  }
}

// Import PgStorage 
import { PgStorage } from "./pg-storage";

// Use PgStorage instead of MemStorage for persistent storage with PostgreSQL
export const storage = new PgStorage();
