import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { expenses, users } from '@shared/schema';
import type { Expense, InsertExpense, UpdateExpense, ExpenseSummary, User, InsertUser } from '@shared/schema';
import { categoryDisplayNames } from '@shared/schema';
import * as fs from 'fs';
import * as path from 'path';

// Configure neon to use SSL
neonConfig.fetchConnectionCache = true;

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Initialize the database schema
export async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Read migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '0000_condemned_phalanx.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL statements by the statement-breakpoint
    const statements = migrationSql.split('--> statement-breakpoint');
    
    // Execute each statement separately
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        await sql(trimmedStatement);
      }
    }
    
    console.log('Database migration completed successfully');
    return true;
  } catch (error) {
    console.error('Database migration failed:', error);
    return false;
  }
}