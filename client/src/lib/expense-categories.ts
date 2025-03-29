// Category definitions
export const CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "housing", label: "Housing & Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "healthcare", label: "Healthcare" },
  { value: "travel", label: "Travel" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

// Category colors for badges and charts
export const CATEGORY_COLORS: Record<string, { bg: string, text: string, fill: string }> = {
  food: { 
    bg: "bg-green-100", 
    text: "text-green-800",
    fill: "#10b981" // success-500
  },
  transportation: { 
    bg: "bg-yellow-100", 
    text: "text-yellow-800",
    fill: "#f59e0b" // amber-500
  },
  housing: { 
    bg: "bg-blue-100", 
    text: "text-blue-800",
    fill: "#3b82f6" // blue-500
  },
  entertainment: { 
    bg: "bg-purple-100", 
    text: "text-purple-800",
    fill: "#8b5cf6" // violet-500
  },
  shopping: { 
    bg: "bg-red-100", 
    text: "text-red-800",
    fill: "#ef4444" // red-500
  },
  healthcare: { 
    bg: "bg-indigo-100", 
    text: "text-indigo-800",
    fill: "#6366f1" // indigo-500
  },
  travel: { 
    bg: "bg-cyan-100", 
    text: "text-cyan-800",
    fill: "#06b6d4" // cyan-500
  },
  education: { 
    bg: "bg-emerald-100", 
    text: "text-emerald-800",
    fill: "#10b981" // emerald-500
  },
  other: { 
    bg: "bg-gray-100", 
    text: "text-gray-800",
    fill: "#6b7280" // gray-500
  },
};

// Helper to get category label
export function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find(c => c.value === category);
  return found ? found.label : "Uncategorized";
}

// Helper to get category color classes
export function getCategoryColor(category: string, type: "bg" | "text" | "fill" = "bg"): string {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return colors[type];
}
