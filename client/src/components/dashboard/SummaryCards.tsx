import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency-helpers";
import { type ExpenseSummary } from "@shared/schema";

export default function SummaryCards() {
  const { data: summary, isLoading, isError } = useQuery<ExpenseSummary>({
    queryKey: ["/api/summary"],
  });

  if (isError) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-center text-red-500 py-4">
              Failed to load summary data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Expenses Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-primary-100">
              <span className="material-icons text-primary-600">account_balance_wallet</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 truncate">Total Expenses</p>
              {isLoading ? (
                <Skeleton className="h-6 w-28 mt-1" />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary?.totalExpenses || 0)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-2">
          <div className="text-sm">
            <a href="/expenses" className="font-medium text-primary-500 hover:text-primary-600">
              View all
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* This Month Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
              <span className="material-icons text-success-500">date_range</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 truncate">This Month</p>
              {isLoading ? (
                <Skeleton className="h-6 w-28 mt-1" />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary?.monthlyExpenses || 0)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-2">
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <div className={`text-sm flex items-center ${summary?.percentChange && summary.percentChange < 0 ? 'text-success-500' : 'text-red-500'}`}>
              <span className="material-icons text-sm mr-1">
                {summary?.percentChange && summary.percentChange < 0 ? 'trending_down' : 'trending_up'}
              </span>
              <span>
                {summary?.percentChange 
                  ? `${Math.abs(Math.round(summary.percentChange))}% ${summary.percentChange < 0 ? 'less' : 'more'} than last month` 
                  : 'No data from last month'}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Top Category Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
              <span className="material-icons text-blue-600">category</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 truncate">Top Category</p>
              {isLoading ? (
                <Skeleton className="h-6 w-28 mt-1" />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {summary?.topCategory || 'None'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-2">
          <div className="text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-gray-500">
                View in reports
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Last Entry Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
              <span className="material-icons text-purple-600">receipt</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 truncate">Last Entry</p>
              {isLoading ? (
                <Skeleton className="h-6 w-28 mt-1" />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {summary?.lastEntry || 'No entries yet'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-2">
          <div className="text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <span className="text-gray-500">
                View recent expenses below
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
