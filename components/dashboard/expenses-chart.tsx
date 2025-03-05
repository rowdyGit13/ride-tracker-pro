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

interface ExpensesChartProps {
  expenses: SelectExpense[];
  dateRange: DateRange | undefined;
}

export function ExpensesChart({ expenses, dateRange }: ExpensesChartProps) {
  // Group expenses by type for the chart
  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return [];
    }

    // Create an array of months in the date range
    const months = eachMonthOfInterval({
      start: startOfMonth(dateRange.from),
      end: endOfMonth(dateRange.to)
    });

    // Group expenses by month and type
    return months.map(month => {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date.toString());
        return isSameMonth(expenseDate, month);
      });

      // Group by expense type
      const expensesByType = monthExpenses.reduce((acc, expense) => {
        const type = expense.expenseType;
        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += Number(expense.amount);
        return acc;
      }, {} as Record<string, number>);

      // Calculate total for the month
      const total = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

      return {
        month: format(month, "MMM yyyy"),
        ...expensesByType,
        total: parseFloat(total.toFixed(2))
      };
    });
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
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
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
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" />
        <YAxis 
          tickFormatter={(value) => `$${value}`}
          domain={getYAxisDomain()}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {expenseTypes.map((type, index) => (
          <Bar 
            key={type} 
            dataKey={type} 
            name={type.charAt(0).toUpperCase() + type.slice(1)} 
            fill={colors[index % colors.length]} 
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
} 