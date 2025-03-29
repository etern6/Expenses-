import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, updateExpenseSchema } from "@shared/schema";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - all prefixed with /api
  const apiRouter = express.Router();
  
  // Get all expenses
  apiRouter.get("/expenses", async (req: Request, res: Response) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error getting expenses:", error);
      res.status(500).json({ message: "Failed to get expenses" });
    }
  });
  
  // Export expenses as CSV
  apiRouter.get("/expenses/export", async (_req: Request, res: Response) => {
    try {
      const expenses = await storage.getAllExpenses();
      
      // Convert expenses to CSV format
      const csvHeader = "Date,Description,Amount,Category,Notes\n";
      const csvRows = expenses.map(expense => {
        const date = format(new Date(expense.date), 'yyyy-MM-dd');
        return `${date},"${expense.description}",${expense.amount},"${expense.category}","${expense.notes || ''}"`;
      }).join('\n');
      
      const csv = csvHeader + csvRows;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
      
      res.send(csv);
    } catch (error) {
      console.error("Error exporting expenses:", error);
      res.status(500).json({ message: "Failed to export expenses" });
    }
  });
  
  // Get expense by ID
  apiRouter.get("/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error getting expense:", error);
      res.status(500).json({ message: "Failed to get expense" });
    }
  });
  
  // Create a new expense
  apiRouter.post("/expenses", async (req: Request, res: Response) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const newExpense = await storage.createExpense(validatedData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid expense data", 
          errors: error.errors 
        });
      }
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
  
  // Update an expense
  apiRouter.put("/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const validatedData = updateExpenseSchema.parse({
        ...req.body,
        id
      });
      
      const updatedExpense = await storage.updateExpense(validatedData);
      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid expense data", 
          errors: error.errors 
        });
      }
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });
  
  // Delete an expense
  apiRouter.delete("/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  
  // Filter expenses
  apiRouter.get("/expenses/filter", async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, category, timeRange } = req.query;
      
      let fromDate: Date | undefined;
      let toDate: Date | undefined;
      
      // Process time range parameter for common date ranges
      if (timeRange) {
        const today = new Date();
        
        switch(timeRange) {
          case 'week':
            fromDate = startOfWeek(today);
            toDate = endOfWeek(today);
            break;
          case 'month':
            fromDate = startOfMonth(today);
            toDate = endOfMonth(today);
            break;
          case 'quarter':
            fromDate = startOfQuarter(today);
            toDate = endOfQuarter(today);
            break;
          case 'year':
            fromDate = startOfYear(today);
            toDate = endOfYear(today);
            break;
          // If 'all', don't set any date filters
        }
      } else {
        // Process explicit date parameters
        if (dateFrom) {
          fromDate = parseISO(dateFrom as string);
        }
        
        if (dateTo) {
          toDate = parseISO(dateTo as string);
        }
      }
      
      const expenses = await storage.filterExpenses(
        fromDate, 
        toDate, 
        category as string
      );
      
      res.json(expenses);
    } catch (error) {
      console.error("Error filtering expenses:", error);
      res.status(500).json({ message: "Failed to filter expenses" });
    }
  });
  
  // Get expense summary
  apiRouter.get("/summary", async (_req: Request, res: Response) => {
    try {
      const summary = await storage.getExpenseSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error getting expense summary:", error);
      res.status(500).json({ message: "Failed to get expense summary" });
    }
  });
  
  // Get expenses by category
  apiRouter.get("/reports/by-category", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getExpensesByCategory();
      res.json(categories);
    } catch (error) {
      console.error("Error getting expenses by category:", error);
      res.status(500).json({ message: "Failed to get expenses by category" });
    }
  });
  
  // Get expenses by month
  apiRouter.get("/reports/by-month", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const monthlyData = await storage.getExpensesByMonth(year);
      res.json(monthlyData);
    } catch (error) {
      console.error("Error getting expenses by month:", error);
      res.status(500).json({ message: "Failed to get expenses by month" });
    }
  });

  // Export all code as CSV (for development purposes)
  apiRouter.get("/code/export", async (_req: Request, res: Response) => {
    try {
      const { execSync } = require('child_process');
      
      // Generate code CSV if it doesn't exist or needs to be refreshed
      execSync('mkdir -p /tmp/code_csv && echo "file_path,content" > /tmp/code_csv/code.csv && find . -type f -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | while read file; do echo "\\"$file\\",\\"$(cat "$file" | tr -d \'\\r\' | sed \'s/"/"""/g\' | tr \'\\n\' \'☯\' | sed \'s/☯/\\\\n/g\')\\"" >> /tmp/code_csv/code.csv; done');
      
      // Read the generated CSV file
      const fs = require('fs');
      const csvContent = fs.readFileSync('/tmp/code_csv/code.csv', 'utf8');
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=application_code.csv');
      
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting code as CSV:", error);
      res.status(500).json({ message: "Failed to export code as CSV" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
