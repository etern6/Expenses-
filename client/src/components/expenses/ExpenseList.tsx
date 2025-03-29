import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor, getCategoryLabel } from "@/lib/expense-categories";
import { formatCurrency } from "@/lib/currency-helpers";
import FilterBar from "./FilterBar";
import EditExpenseDialog from "./EditExpenseDialog";
import { type Expense } from "@shared/schema";

interface ExpenseListProps {
  pageSize?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  showHeader?: boolean;
  title?: string;
}

export default function ExpenseList({
  pageSize = 10,
  showFilters = true,
  showPagination = true,
  showHeader = true,
  title = "Recent Expenses"
}: ExpenseListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("month");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch expenses based on filters
  const { data: expenses, isLoading, isError } = useQuery({
    queryKey: ["/api/expenses"],
    select: (data: Expense[]) => {
      // Client-side filtering
      if (filterCategory !== "all") {
        data = data.filter(expense => expense.category === filterCategory);
      }
      
      return data;
    }
  });

  // Calculate pagination
  const totalExpenses = expenses?.length || 0;
  const totalPages = Math.ceil(totalExpenses / pageSize);
  const paginatedExpenses = expenses?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page changes
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle edit expense
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  // Handle edit dialog close
  const handleCloseDialog = () => {
    setEditingExpense(null);
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow">
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
            
            {showFilters && (
              <FilterBar 
                category={filterCategory}
                timeRange={filterTimeRange}
                onCategoryChange={setFilterCategory}
                onTimeRangeChange={setFilterTimeRange}
              />
            )}
          </CardHeader>
        )}
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-3">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-500">
                      Error loading expenses. Please try again later.
                    </td>
                  </tr>
                ) : paginatedExpenses?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No expenses found. Add a new expense to get started.
                    </td>
                  </tr>
                ) : (
                  paginatedExpenses?.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge 
                          variant="outline" 
                          className={`${getCategoryColor(expense.category as string)} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                        >
                          {getCategoryLabel(expense.category as string)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(Number(expense.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingExpense(expense);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {showPagination && totalExpenses > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalExpenses)}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalExpenses)}</span> of{" "}
                    <span className="font-medium">{totalExpenses}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <span className="material-icons text-sm">chevron_left</span>
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (totalPages > 5 && i === 0 && pageNum > 1) {
                        return (
                          <Button
                            key={`page-1`}
                            variant="outline"
                            size="sm"
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                              ${1 === currentPage ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </Button>
                        );
                      }
                      
                      if (totalPages > 5 && i === 0 && pageNum > 2) {
                        return (
                          <span key="ellipsis-1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <Button
                          key={`page-${pageNum}`}
                          variant="outline"
                          size="sm"
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium
                            ${pageNum === currentPage ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <span className="material-icons text-sm">chevron_right</span>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          isOpen={editingExpense !== null}
          isDeleteDialogOpen={isDeleteDialogOpen}
          onClose={handleCloseDialog}
          onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
}
