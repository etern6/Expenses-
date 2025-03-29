import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/expense-categories";

interface FilterBarProps {
  category: string;
  timeRange: string;
  onCategoryChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  className?: string;
}

export default function FilterBar({
  category,
  timeRange,
  onCategoryChange,
  onTimeRangeChange,
  className = ""
}: FilterBarProps) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      <div className="relative min-w-[130px]">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative min-w-[130px]">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
