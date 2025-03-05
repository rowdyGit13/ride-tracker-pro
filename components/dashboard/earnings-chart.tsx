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

interface EarningsChartProps {
  rides: SelectRide[];
  dateRange: DateRange | undefined;
}

export function EarningsChart({ rides, dateRange }: EarningsChartProps) {
  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return [];
    }

    // Create an array of months in the date range
    const months = eachMonthOfInterval({
      start: startOfMonth(dateRange.from),
      end: endOfMonth(dateRange.to)
    });

    // Group rides by month and calculate totals
    return months.map(month => {
      const monthRides = rides.filter(ride => {
        const rideDate = parseISO(ride.startTime.toString());
        return isSameMonth(rideDate, month);
      });

      const fareTotal = monthRides.reduce((sum, ride) => sum + Number(ride.fareAmount), 0);
      const tipTotal = monthRides.reduce((sum, ride) => sum + Number(ride.tipAmount), 0);
      const total = fareTotal + tipTotal;

      return {
        month: format(month, "MMM yyyy"),
        fare: parseFloat(fareTotal.toFixed(2)),
        tips: parseFloat(tipTotal.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      };
    });
  }, [rides, dateRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">Fare: ${payload[0]?.value?.toFixed(2)}</p>
          <p className="text-sm text-secondary">Tips: ${payload[1]?.value?.toFixed(2)}</p>
          <p className="text-sm font-semibold">Total: ${payload[2]?.value?.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate domain for Y axis
  const getYAxisDomain = (): AxisDomain => {
    if (chartData.length === 0) return [0, 10];
    
    const maxValue = Math.max(...chartData.map(d => d.total));
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
        <Bar dataKey="fare" name="Fare" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="tips" name="Tips" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
} 