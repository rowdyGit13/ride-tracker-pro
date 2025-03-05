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
        const rideDate = parseISO(ride.sessionDate.toString());
        return isSameMonth(rideDate, month);
      });

      const totalEarnings = monthRides.reduce((sum, ride) => sum + Number(ride.totalAmount), 0);
      const totalHoursOnline = monthRides.reduce((sum, ride) => sum + Number(ride.timeOnline), 0);
      const totalHoursBooked = monthRides.reduce((sum, ride) => sum + Number(ride.timeBooked), 0);
      
      // Calculate hourly rates
      const hourlyRateOnline = totalHoursOnline > 0 ? totalEarnings / totalHoursOnline : 0;
      const hourlyRateBooked = totalHoursBooked > 0 ? totalEarnings / totalHoursBooked : 0;

      return {
        month: format(month, "MMM yyyy"),
        earnings: parseFloat(totalEarnings.toFixed(2)),
        hoursOnline: parseFloat(totalHoursOnline.toFixed(1)),
        hoursBooked: parseFloat(totalHoursBooked.toFixed(1)),
        hourlyOnline: parseFloat(hourlyRateOnline.toFixed(2)),
        hourlyBooked: parseFloat(hourlyRateBooked.toFixed(2))
      };
    });
  }, [rides, dateRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">Earnings: ${payload[0]?.value?.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Hours Online: {payload[1]?.value?.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">Hours Booked: {payload[2]?.value?.toFixed(1)}</p>
          <p className="text-sm font-semibold">Hourly (Online): ${payload[3]?.value?.toFixed(2)}</p>
          <p className="text-sm font-semibold">Hourly (Booked): ${payload[4]?.value?.toFixed(2)}</p>
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
        <Bar dataKey="earnings" name="Earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="hoursOnline" name="Hours Online" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="hoursBooked" name="Hours Booked" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
} 