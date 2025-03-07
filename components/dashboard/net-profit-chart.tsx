"use client";

import { SelectRide } from "@/db/schema/rides-schema";
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
  ReferenceLine,
  TooltipProps
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { parseDate } from "@/lib/utils";

interface NetProfitChartProps {
  rides: SelectRide[];
  expenses: SelectExpense[];
  dateRange: DateRange | undefined;
}

export function NetProfitChart({ rides, expenses, dateRange }: NetProfitChartProps) {
  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Debug log
    console.log("NetProfitChart - Preparing chart data");
    console.log(`Rides count: ${rides.length}`);
    console.log(`Expenses count: ${expenses.length}`);
    console.log("Date range:", dateRange);
    
    try {
      // If we have a date range but no data, still show the empty months in range
      if (dateRange?.from && dateRange?.to && rides.length === 0 && expenses.length === 0) {
        console.log("No data in date range");
        
        // Create an array of months in the date range
        const months = eachMonthOfInterval({
          start: startOfMonth(dateRange.from),
          end: endOfMonth(dateRange.to)
        });
        
        console.log("Empty months in range:", months);
        
        // Return empty data for each month
        return months.map(month => ({
          month: format(month, 'MMM yyyy'),
          netProfit: 0
        }));
      }
      
      // If no data at all, return empty array
      if (rides.length === 0 && expenses.length === 0) {
        console.log("No data to display");
        return [];
      }
      
      if (!dateRange?.from || !dateRange?.to) {
        console.log("No date range selected, using all data");
        
        // Get min and max dates from rides and expenses with our utility
        const ridesDates = rides
          .map(ride => parseDate(ride.sessionDate))
          .filter(date => date !== null) as Date[];
          
        const expensesDates = expenses
          .map(expense => parseDate(expense.date))
          .filter(date => date !== null) as Date[];
          
        const validDates = [...ridesDates, ...expensesDates];
        
        if (validDates.length === 0) {
          console.log("No valid dates found");
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
          // Get rides for this month
          const monthRides = rides.filter(ride => {
            const rideDate = parseDate(ride.sessionDate);
            return rideDate && isSameMonth(rideDate, month);
          });
          
          // Calculate total earnings for this month
          const earnings = monthRides.reduce((sum, ride) => 
            sum + Number(ride.totalAmount), 0);
          
          // Get expenses for this month
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = parseDate(expense.date);
            return expenseDate && isSameMonth(expenseDate, month);
          });
          
          // Calculate total expenses for this month
          const regularExpenses = monthExpenses.reduce((sum, expense) => 
            sum + Number(expense.amount), 0);
            
          // Calculate depreciation for this month (5 cents per mile)
          const depreciation = monthRides.reduce((sum, ride) => {
            const milesOnline = Number(ride.distanceOnline || 0);
            if (!isNaN(milesOnline)) {
              return sum + (milesOnline * 0.05);
            }
            return sum;
          }, 0);
          
          // Total expenses including depreciation
          const totalExpenses = regularExpenses + depreciation;
          
          // Calculate net profit
          const netProfit = earnings - totalExpenses;
          
          return {
            month: format(month, 'MMM yyyy'),
            earnings,
            expenses: totalExpenses,
            netProfit,
            isProfit: netProfit >= 0
          };
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
          // Get rides for this month
          const monthRides = rides.filter(ride => {
            const rideDate = parseDate(ride.sessionDate);
            return rideDate && isSameMonth(rideDate, month);
          });
          
          // Calculate total earnings for this month
          const earnings = monthRides.reduce((sum, ride) => 
            sum + Number(ride.totalAmount), 0);
          
          // Get expenses for this month
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = parseDate(expense.date);
            return expenseDate && isSameMonth(expenseDate, month);
          });
          
          // Calculate total expenses for this month
          const regularExpenses = monthExpenses.reduce((sum, expense) => 
            sum + Number(expense.amount), 0);
            
          // Calculate depreciation for this month (5 cents per mile)
          const depreciation = monthRides.reduce((sum, ride) => {
            const milesOnline = Number(ride.distanceOnline || 0);
            if (!isNaN(milesOnline)) {
              return sum + (milesOnline * 0.05);
            }
            return sum;
          }, 0);
          
          // Total expenses including depreciation
          const totalExpenses = regularExpenses + depreciation;
          
          // Calculate net profit
          const netProfit = earnings - totalExpenses;
          
          return {
            month: format(month, 'MMM yyyy'),
            earnings,
            expenses: totalExpenses,
            netProfit,
            isProfit: netProfit >= 0
          };
        });
      }
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [rides, expenses, dateRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0) {
      // Log payload for debugging
      console.log("NetProfit tooltip payload:", payload);
      
      const data = payload[0]?.payload;
      if (!data) return null;
      
      const { earnings, expenses, netProfit } = data;
      const isProfit = netProfit >= 0;
      
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: '#10b981', 
              borderRadius: '50%' 
            }}></div>
            <div>Earnings: <strong>${earnings.toFixed(2)}</strong></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: '#ef4444', 
              borderRadius: '50%' 
            }}></div>
            <div>Expenses: <strong>${expenses.toFixed(2)}</strong></div>
          </div>
          <div 
            style={{ 
              marginTop: '8px', 
              paddingTop: '8px', 
              borderTop: '1px solid #eee',
              fontWeight: 'bold',
              color: isProfit ? '#10b981' : '#ef4444'
            }}
          >
            Net Profit: ${netProfit.toFixed(2)}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate domain for Y axis that accounts for negative values
  const getYAxisDomain = (): AxisDomain => {
    if (chartData.length === 0) return [-100, 100];
    
    const values = chartData.map(d => d.netProfit);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    
    // Ensure y-max is at least $10 greater than the largest bar value and divisible by 10
    const roundedMax = Math.ceil((maxValue + 10) / 10) * 10;
    
    // Ensure y-min is at least $10 less than the smallest bar value and divisible by 10
    const roundedMin = Math.floor((minValue - 10) / 10) * 10;
    
    return [roundedMin, roundedMax];
  };

  // Generate evenly spaced ticks for the Y axis that include zero
  const getYAxisTicks = (): number[] => {
    if (chartData.length === 0) return [-80, -60, -40, -20, 0, 20, 40, 60, 80, 100];
    
    const values = chartData.map(d => d.netProfit);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    
    // Ensure y-max is at least $10 greater than the largest bar value and divisible by 10
    const roundedMax = Math.ceil((maxValue + 10) / 10) * 10;
    
    // Ensure y-min is at least $10 less than the smallest bar value and divisible by 10
    const roundedMin = Math.floor((minValue - 10) / 10) * 10;
    
    // Target 5-6 tick marks in each direction from zero for aesthetically pleasing chart
    const preferredTickCount = 5;
    
    // Calculate the ideal interval (must be divisible by 10)
    const range = Math.max(Math.abs(roundedMax), Math.abs(roundedMin));
    let tickInterval = Math.ceil(range / preferredTickCount / 10) * 10;
    if (tickInterval === 0) tickInterval = 10;
    
    // Create ticks in calculated interval including zero
    const ticks = [0]; // Always include zero
    
    // Add positive ticks
    for (let i = tickInterval; i <= roundedMax; i += tickInterval) {
      ticks.push(i);
    }
    
    // Add negative ticks
    for (let i = -tickInterval; i >= roundedMin; i -= tickInterval) {
      ticks.push(i);
    }
    
    // Sort ticks in ascending order
    return ticks.sort((a, b) => a - b);
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No profit/loss data available for the selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData.length > 0 ? (
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
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
            padding={{ bottom: 0, top: 0 }}
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
          <ReferenceLine y={0} stroke="#666" />
          <Bar 
            dataKey={(entry) => entry.netProfit >= 0 ? entry.netProfit : 0} 
            name="Profit" 
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey={(entry) => entry.netProfit < 0 ? entry.netProfit : 0} 
            name="Loss" 
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 text-center mb-2">No profit/loss data available</p>
          <p className="text-sm text-gray-400">Try selecting a different date range</p>
        </div>
      )}
    </ResponsiveContainer>
  );
} 