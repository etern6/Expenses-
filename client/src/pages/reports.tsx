import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyTrendsChart from "@/components/dashboard/MonthlyTrendsChart";
import CategoryBreakdownChart from "@/components/dashboard/CategoryBreakdownChart";
import ExpenseList from "@/components/expenses/ExpenseList";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { type ExpenseSummary } from "@shared/schema";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: summary, isLoading: isSummaryLoading } = useQuery<ExpenseSummary>({
    queryKey: ["/api/summary"],
  });
  
  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Analyze your spending patterns and trends</p>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Spending</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <MonthlyTrendsChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CategoryBreakdownChart />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                  {isSummaryLoading ? (
                    <Skeleton className="h-7 w-28 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{formatCurrency(summary?.totalExpenses || 0)}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">This Month</h3>
                  {isSummaryLoading ? (
                    <Skeleton className="h-7 w-28 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{formatCurrency(summary?.monthlyExpenses || 0)}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Top Category</h3>
                  {isSummaryLoading ? (
                    <Skeleton className="h-7 w-28 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{summary?.topCategory || 'None'}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Monthly Change</h3>
                  {isSummaryLoading ? (
                    <Skeleton className="h-7 w-28 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${summary?.percentChange && summary.percentChange < 0 ? 'text-success-500' : 'text-red-500'}`}>
                      {summary?.percentChange 
                        ? `${summary.percentChange < 0 ? '' : '+'}${Math.round(summary.percentChange)}%` 
                        : 'N/A'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <MonthlyTrendsChart />
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <ExpenseList 
              showHeader={true} 
              title="Expenses by Month" 
              showFilters={true} 
              showPagination={true}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <CategoryBreakdownChart />
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <ExpenseList 
              showHeader={true} 
              title="Expenses by Category" 
              showFilters={true} 
              showPagination={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
