import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor, getCategoryLabel } from "@/lib/expense-categories";
import { formatCurrency } from "@/lib/currency-helpers";

export default function CategoryBreakdownChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/reports/by-category"],
  });
  
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
  
  // Transform data for chart
  const chartData = data
    ? Object.entries(data).map(([category, amount]) => ({
        name: getCategoryLabel(category),
        value: Number(amount),
        category,
      }))
    : [];
  
  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // If no data, display a message
  if (chartData.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded">
        <div className="text-center text-gray-500">
          No expense data available
        </div>
      </div>
    );
  }
  
  // Calculate percentages
  const dataWithPercent = chartData.map(item => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(0) + '%'
  }));
  
  // Custom tooltip that shows amount and percentage
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
          <p className="text-gray-500">
            {((payload[0].value / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          dataKey="value"
          nameKey="name"
        >
          {dataWithPercent.map((entry) => (
            <Cell 
              key={`cell-${entry.category}`} 
              fill={getCategoryColor(entry.category, "fill")}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value, entry: any) => {
            return (
              <span className="text-xs">
                {value} ({entry.payload.percent})
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
