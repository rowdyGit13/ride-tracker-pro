"use client";

import { SelectRide } from "@/db/schema/rides-schema";
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

interface EarningsChartProps {
  rides: SelectRide[];
  dateRange: DateRange | undefined;
}

export function EarningsChart({ rides, dateRange }: EarningsChartProps) {
  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Debug log
    console.log("EarningsChart - Preparing chart data");
    console.log(`Rides count: ${rides.length}`);
    console.log("Date range:", dateRange);
    
    try {
      // If we have a date range but no rides, still show the empty months in range
      if (dateRange?.from && dateRange?.to && rides.length === 0) {
        console.log("No earnings in date range");
        
        // Create an array of months in the date range
        const months = eachMonthOfInterval({
          start: startOfMonth(dateRange.from),
          end: endOfMonth(dateRange.to)
        });
        
        console.log("Empty months in range:", months);
        
        // Return empty data for each month
        return months.map(month => ({
          month: format(month, 'MMM yyyy'),
          earnings: 0
        }));
      }
      
      // If no rides at all, return empty array
      if (rides.length === 0) {
        console.log("No rides to display");
        return [];
      }
      
      if (!dateRange?.from || !dateRange?.to) {
        console.log("No date range selected, using all rides");
        // If no date range, use all rides grouped by month
        
        // Get min and max dates from rides with our utility
        const validDates = rides
          .map(ride => parseDate(ride.sessionDate))
          .filter(date => date !== null) as Date[];
        
        if (validDates.length === 0) {
          console.log("No valid dates found in rides");
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
          const earnings = monthRides.reduce((sum, ride) => sum + Number(ride.totalAmount), 0);
          
          return {
            month: format(month, 'MMM yyyy'),
            earnings: earnings
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
          const earnings = monthRides.reduce((sum, ride) => sum + Number(ride.totalAmount), 0);
          
          return {
            month: format(month, 'MMM yyyy'),
            earnings: earnings
          };
        });
      }
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [rides, dateRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium text-sm mb-1">{label}</p>
          <p className="text-sm mb-1">
            <span className="inline-block w-3 h-3 bg-[#10b981] mr-2 rounded-full"></span>
            Earnings: ${payload[0].value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate domain for Y axis
  const getYAxisDomain = (): AxisDomain => {
    if (chartData.length === 0) return [0, 10];
    
    const maxValue = Math.max(...chartData.map(d => d.earnings));
    // Add 10% padding to the top
    return [0, Math.ceil(maxValue * 1.1)];
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No earnings data available for the selected period</p>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="earnings" 
            name="Earnings" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 text-center mb-2">No earnings data available</p>
          {rides.length === 0 ? (
            <p className="text-sm text-gray-400">Record your first ride to see data here</p>
          ) : (
            <p className="text-sm text-gray-400">Try selecting a different date range</p>
          )}
        </div>
      )}
    </ResponsiveContainer>
  );
} 