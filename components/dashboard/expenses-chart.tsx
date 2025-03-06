"use client";

import { SelectExpense } from "@/db/schema/expenses-schema";
import { DateRange } from "react-day-picker";
import { useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { parseDate } from "@/lib/utils";

interface ExpensesChartProps {
  expenses: SelectExpense[];
  dateRange: DateRange | undefined;
}

export function ExpensesChart({ expenses, dateRange }: ExpensesChartProps) {
  // Group expenses by type for the chart
  const chartData = useMemo(() => {
    // Debug log
    console.log("ExpensesChart - Preparing chart data");
    console.log(`Expenses count: ${expenses.length}`);
    console.log("Date range:", dateRange);
    
    if (expenses.length === 0) {
      console.log("No expenses to display");
      return [];
    }
    
    try {
      if (!dateRange?.from || !dateRange?.to) {
        console.log("No date range selected, using all expenses");
        
        // Get min and max dates from expenses with our utility
        const validDates = expenses
          .map(expense => parseDate(expense.date))
          .filter(date => date !== null) as Date[];
        
        if (validDates.length === 0) {
          console.log("No valid dates found in expenses");
          return [];
        }
        
        const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));
        
        console.log("Min date:", minDate, "Max date:", maxDate);
        
        // Create an array of months between min and max dates
        const months = eachMonthOfInterval({
          start: startOfMonth(minDate),
          end: endOfMonth(maxDate)
        });
        
        console.log("Months in range:", months);
        
        // Create data for each month
        return months.map(month => {
          // Initialize expense types
          const monthData = {
            month: format(month, 'MMM yyyy'),
            fuel: 0,
            maintenance: 0,
            insurance: 0,
            car_payment: 0,
            cleaning: 0,
            parking: 0,
            tolls: 0,
            other: 0,
            total: 0
          };
          
          // Get expenses for this month
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = parseDate(expense.date);
            return expenseDate && isSameMonth(expenseDate, month);
          });
          
          // Sum expenses by type
          monthExpenses.forEach(expense => {
            const amount = Number(expense.amount);
            if (!isNaN(amount)) {
              // @ts-ignore - We know these properties exist
              monthData[expense.expenseType] += amount;
              monthData.total += amount;
            }
          });
          
          return monthData;
        });
      } else {
        // If date range is provided, group by month within that range
        const months = eachMonthOfInterval({
          start: startOfMonth(dateRange.from),
          end: endOfMonth(dateRange.to)
        });
        
        console.log("Months in range:", months);
        
        // Create data for each month
        return months.map(month => {
          // Initialize expense types
          const monthData = {
            month: format(month, 'MMM yyyy'),
            fuel: 0,
            maintenance: 0,
            insurance: 0,
            car_payment: 0,
            cleaning: 0,
            parking: 0,
            tolls: 0,
            other: 0,
            total: 0
          };
          
          // Get expenses for this month
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = parseDate(expense.date);
            return expenseDate && isSameMonth(expenseDate, month);
          });
          
          // Sum expenses by type
          monthExpenses.forEach(expense => {
            const amount = Number(expense.amount);
            if (!isNaN(amount)) {
              // @ts-ignore - We know these properties exist
              monthData[expense.expenseType] += amount;
              monthData.total += amount;
            }
          });
          
          return monthData;
        });
      }
    } catch (error) {
      console.error("Error processing expenses chart data:", error);
      return [];
    }
  }, [expenses, dateRange]);

  // Get unique expense types for chart configuration
  const expenseTypes = useMemo(() => {
    const types = new Set<string>();
    expenses.forEach(expense => {
      types.add(expense.expenseType);
    });
    return Array.from(types);
  }, [expenses]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      // Filter out zero values
      const nonZeroPayload = payload.filter(entry => entry.value && entry.value > 0);
      
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium text-sm mb-1">{label}</p>
          {nonZeroPayload.map((entry, index) => (
            <p key={index} className="text-sm mb-1">
              <span 
                className="inline-block w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name}: ${entry.value?.toFixed(2) || '0.00'}
            </p>
          ))}
          {payload.find(p => p.dataKey === 'total' && p.value) && (
            <p className="text-sm font-semibold mt-1 border-t pt-1">
              Total: ${payload.find(p => p.dataKey === 'total')?.value?.toFixed(2) || '0.00'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate domain for Y axis
  const getYAxisDomain = (): AxisDomain => {
    if (chartData.length === 0) return [0, 10];
    
    const maxValue = Math.max(...chartData.map(d => d.total || 0));
    // Add 10% padding to the top
    return [0, Math.ceil(maxValue * 1.1)];
  };

  // Colors for different expense types
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ec4899", // pink
  ];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No expense data available for the selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData.length > 0 ? (
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          stackOffset="sign"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`} 
            domain={getYAxisDomain()}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="fuel" name="Fuel" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="insurance" name="Insurance" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="car_payment" name="Car Payment" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
          <Bar dataKey="cleaning" name="Cleaning" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="parking" name="Parking" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
          <Bar dataKey="tolls" name="Tolls" stackId="a" fill="#64748b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="other" name="Other" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} />
        </BarChart>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 text-center mb-2">No expense data available</p>
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-400">Record your first expense to see data here</p>
          ) : (
            <p className="text-sm text-gray-400">Try selecting a different date range</p>
          )}
        </div>
      )}
    </ResponsiveContainer>
  );
} 