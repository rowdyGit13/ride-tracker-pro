import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, parse } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a date from various formats
 * @param dateValue Date value which could be a string, Date object, or other format
 * @returns A valid Date object or null if parsing fails
 */
export function parseDate(dateValue: any): Date | null {
  // If it's already a Date object
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }
  
  // Handle string dates
  if (typeof dateValue === 'string') {
    // Try standard Date constructor
    let parsedDate = new Date(dateValue);
    
    // If valid, return it
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // Try parseISO for ISO format strings
    try {
      parsedDate = parseISO(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (e) {
      // If parseISO fails, continue to other methods
    }
    
    // Try parsing common formats
    const formats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy-MM-dd HH:mm:ss',
      'MM/dd/yyyy HH:mm:ss',
    ];
    
    for (const format of formats) {
      try {
        parsedDate = parse(dateValue, format, new Date());
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      } catch (e) {
        // If this format fails, try the next one
      }
    }
  }
  
  // Handle numeric timestamps
  if (typeof dateValue === 'number') {
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  // If all parsing attempts fail
  return null;
}
