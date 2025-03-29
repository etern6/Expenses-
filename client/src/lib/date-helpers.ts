import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

// Format date in a readable format
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }
  
  return format(dateObj, 'MMM d, yyyy');
}

// Format relative time (e.g., "5 minutes ago")
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Get month name
export function getMonthName(month: number, short = false): string {
  const date = new Date();
  date.setMonth(month);
  return format(date, short ? 'MMM' : 'MMMM');
}

// Parse ISO string to date object
export function parseISODate(dateString: string): Date {
  return parseISO(dateString);
}

// Format date for input fields (YYYY-MM-DD)
export function formatForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
