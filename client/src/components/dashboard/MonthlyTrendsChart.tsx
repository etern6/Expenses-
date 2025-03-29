import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency-helpers";

export default function MonthlyTrendsChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/reports/by-month", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/reports/by-month?year=${selectedYear}`);
      if (!res.ok) throw new Error("Failed to fetch monthly data");
      return res.json();
    }
  });
  
  // Transform data for chart
  const chartData = data
    ? Object.entries(data).map(([month, amount]) => ({
        month,
        amount: Number(amount),
      }))
    : [];
  
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded">
        <div className="text-center text-red-500">
          Failed to load chart data
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }
  
  // Calculate years for selector (current year and 4 years back)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  return (
    <div className="w-full h-full">
      <div className="flex justify-end mb-4">
        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, false)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value as number), "Amount"]}
            labelFormatter={(label) => `${label} ${selectedYear}`}
          />
          <Bar 
            dataKey="amount" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
