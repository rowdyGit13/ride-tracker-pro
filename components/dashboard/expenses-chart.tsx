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
import { SelectRide } from "@/db/schema/rides-schema";

interface ExpensesChartProps {
  expenses: SelectExpense[];
  dateRange: DateRange | undefined;
  rides?: SelectRide[]; // Add rides as an optional prop for depreciation calculation
}

export function ExpensesChart({ expenses, dateRange, rides = [] }: ExpensesChartProps) {
  // Group expenses by type for the chart
  const chartData = useMemo(() => {
    // Debug log
    console.log("ExpensesChart - Preparing chart data");
    console.log(`Expenses count: ${expenses.length}`);
    console.log(`Rides count: ${rides.length}`);
    console.log("Date range:", dateRange);
    
    try {
      // If we have a date range but no expenses, still show the empty months in range
      if (dateRange?.from && dateRange?.to && expenses.length === 0 && rides.length === 0) {
        console.log("Date range selected but no expenses or rides - showing empty months");
        
        // Create an array of months in the date range
        const months = eachMonthOfInterval({
          start: startOfMonth(dateRange.from),
          end: endOfMonth(dateRange.to)
        });
        
        console.log("Empty months in range:", months);
        
        // Return empty data for each month
        return months.map(month => ({
          month: format(month, 'MMM yyyy'),
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          car_payment: 0,
          cleaning: 0,
          parking: 0,
          tolls: 0,
          other: 0,
          depreciation: 0, // Add depreciation category
          total: 0
        }));
      }
      
      // If no expenses and no rides at all, return empty array
      if (expenses.length === 0 && rides.length === 0) {
        console.log("No expenses or rides to display");
        return [];
      }
      
      if (!dateRange?.from || !dateRange?.to) {
        console.log("No date range selected, using all expenses and rides");
        
        // Get min and max dates from expenses and rides with our utility
        const validExpenseDates = expenses
          .map(expense => parseDate(expense.date))
          .filter(date => date !== null) as Date[];
        
        const validRideDates = rides
          .map(ride => parseDate(ride.sessionDate))
          .filter(date => date !== null) as Date[];
        
        const validDates = [...validExpenseDates, ...validRideDates];
        
        if (validDates.length === 0) {
          console.log("No valid dates found in expenses or rides");
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
            depreciation: 0, // Add depreciation category
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
          
          // Calculate depreciation based on miles driven in this month
          const monthRides = rides.filter(ride => {
            const rideDate = parseDate(ride.sessionDate);
            return rideDate && isSameMonth(rideDate, month);
          });
          
          let totalMilesOnline = 0;
          monthRides.forEach(ride => {
            const miles = Number(ride.distanceOnline || 0);
            if (!isNaN(miles)) {
              totalMilesOnline += miles;
            }
          });
          
          // Calculate depreciation at 5 cents per mile
          const depreciation = totalMilesOnline * 0.05;
          monthData.depreciation = Number(depreciation.toFixed(2));
          monthData.total += monthData.depreciation;
          
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
            depreciation: 0, // Add depreciation category
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
          
          // Calculate depreciation based on miles driven in this month
          const monthRides = rides.filter(ride => {
            const rideDate = parseDate(ride.sessionDate);
            return rideDate && isSameMonth(rideDate, month);
          });
          
          let totalMilesOnline = 0;
          monthRides.forEach(ride => {
            const miles = Number(ride.distanceOnline || 0);
            if (!isNaN(miles)) {
              totalMilesOnline += miles;
            }
          });
          
          // Calculate depreciation at 5 cents per mile
          const depreciation = totalMilesOnline * 0.05;
          monthData.depreciation = Number(depreciation.toFixed(2));
          monthData.total += monthData.depreciation;
          
          return monthData;
        });
      }
    } catch (error) {
      console.error("Error processing expenses chart data:", error);
      return [];
    }
  }, [expenses, rides, dateRange]);

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
    if (active && payload && payload.length > 0) {
      console.log("Expenses tooltip payload:", payload);
      
      // Get all non-zero, non-total values
      const validEntries = payload.filter(entry => 
        entry && 
        entry.dataKey !== 'total' && 
        entry.value && 
        Number(entry.value) > 0
      );
      
      // Calculate total
      const total = validEntries.reduce((sum, entry) => 
        sum + (Number(entry.value) || 0), 0
      );
      
      return (
        <div
          style={{
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            color: 'black',
            fontSize: '13px',
            fontWeight: 'normal'
          }}
        >
          <div style={{ 
            marginBottom: '8px', 
            fontWeight: 'bold', 
            color: '#333',
            fontSize: '14px'
          }}>
            {label}
          </div>
          
          {validEntries.length > 0 ? (
            validEntries.map((entry, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '5px'
                }}
              >
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: entry.color, 
                  borderRadius: '50%' 
                }}></div>
                <div>{entry.name}: <strong>${Number(entry.value).toFixed(2)}</strong></div>
              </div>
            ))
          ) : (
            <div>No expenses in this period</div>
          )}
          
          {validEntries.length > 0 && (
            <div 
              style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid #eee',
                fontWeight: 'bold'
              }}
            >
              Total: ${total.toFixed(2)}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate domain for Y axis
  const getYAxisDomain = (): AxisDomain => {
    if (chartData.length === 0) return [0, 100];
    
    const maxValue = Math.max(...chartData.map(d => d.total || 0));
    // Round up to the next multiple of 10 and ensure it's at least $10 greater than max value
    const roundedMax = Math.ceil((maxValue + 10) / 10) * 10;
    return [0, roundedMax];
  };

  // Generate evenly spaced ticks for the Y axis
  const getYAxisTicks = (): number[] => {
    if (chartData.length === 0) return [0, 20, 40, 60, 80, 100];
    
    const maxValue = Math.max(...chartData.map(d => d.total || 0));
    // Round up to the next multiple of 10 and ensure it's at least $10 greater than max value
    const roundedMax = Math.ceil((maxValue + 10) / 10) * 10;
    
    // Target 5-6 tick marks total for aesthetically pleasing chart
    const preferredTickCount = 5;
    
    // Calculate the ideal interval (must be divisible by 10)
    let tickInterval = Math.ceil(roundedMax / preferredTickCount / 10) * 10;
    if (tickInterval === 0) tickInterval = 10;
    
    // Create ticks in calculated interval
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += tickInterval) {
      ticks.push(i);
    }
    
    return ticks;
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
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
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
            ticks={getYAxisTicks()}
            allowDecimals={false}
            scale="linear"
            allowDataOverflow={false}
            includeHidden={true}
            padding={{ bottom: 0 }}
            axisLine={true}
            minTickGap={0}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            wrapperStyle={{ 
              zIndex: 1000,
              visibility: 'visible',
              position: 'absolute'
            }}
            cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}
            isAnimationActive={false}
          />
          <Legend />
          <Bar dataKey="fuel" name="Fuel" stackId="a" fill="#3b82f6" />
          <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="#10b981" />
          <Bar dataKey="insurance" name="Insurance" stackId="a" fill="#f59e0b" />
          <Bar dataKey="car_payment" name="Car Payment" stackId="a" fill="#ef4444" />
          <Bar dataKey="cleaning" name="Cleaning" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="parking" name="Parking" stackId="a" fill="#ec4899" />
          <Bar dataKey="tolls" name="Tolls" stackId="a" fill="#64748b" />
          <Bar dataKey="other" name="Other" stackId="a" fill="#9ca3af" />
          <Bar dataKey="depreciation" name="Depreciation" stackId="a" fill="#374151" />
        </BarChart>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 text-center mb-2">No expense data available</p>
          {expenses.length === 0 && rides.length === 0 ? (
            <p className="text-sm text-gray-400">Record your first expense or ride to see data here</p>
          ) : (
            <p className="text-sm text-gray-400">Try selecting a different date range</p>
          )}
        </div>
      )}
    </ResponsiveContainer>
  );
} 