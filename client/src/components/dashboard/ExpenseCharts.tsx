import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import CategoryBreakdownChart from "./CategoryBreakdownChart";

export default function ExpenseCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Monthly Trends Chart */}
      <Card className="bg-white p-6 rounded-lg shadow">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-medium text-gray-900">Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="h-[200px]">
            <MonthlyTrendsChart />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card className="bg-white p-6 rounded-lg shadow">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-medium text-gray-900">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="h-[200px]">
            <CategoryBreakdownChart />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
