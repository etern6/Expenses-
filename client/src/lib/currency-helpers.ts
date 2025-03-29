/**
 * Format a number as currency
 * @param amount Number to format
 * @param showSymbol Whether to include the currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showSymbol = true): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Parse a currency string to a number
 * @param value Currency string to parse
 * @returns Parsed number value
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol, commas, and any other non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleanValue);
}

/**
 * Calculate percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
