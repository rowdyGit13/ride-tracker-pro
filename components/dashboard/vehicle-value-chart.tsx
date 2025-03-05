"use client";

import { SelectVehicle } from "@/db/schema/vehicles-schema";
import { SelectRide } from "@/db/schema/rides-schema";
import { SelectExpense } from "@/db/schema/expenses-schema";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";

interface VehicleValueChartProps {
  vehicles: SelectVehicle[];
  rides: SelectRide[];
  expenses: SelectExpense[];
}

export function VehicleValueChart({ vehicles, rides, expenses }: VehicleValueChartProps) {
  // Calculate metrics for each vehicle
  const vehicleData = useMemo(() => {
    return vehicles.map(vehicle => {
      // Get rides for this vehicle
      const vehicleRides = rides.filter(ride => ride.vehicleId === vehicle.id);
      
      // Calculate total earnings for this vehicle
      const earnings = vehicleRides.reduce((sum, ride) => {
        return sum + Number(ride.fareAmount) + Number(ride.tipAmount);
      }, 0);
      
      // Get expenses for this vehicle
      const vehicleExpenses = expenses.filter(expense => expense.vehicleId === vehicle.id);
      
      // Calculate total expenses for this vehicle
      const expenseTotal = vehicleExpenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);
      
      // Calculate net profit
      const netProfit = earnings - expenseTotal;
      
      // Calculate total miles
      const totalMiles = vehicleRides.reduce((sum, ride) => {
        return sum + Number(ride.distance || 0); // Changed from mileage to distance
      }, 0);

      return {
        name: vehicle.nickname || `${vehicle.make} ${vehicle.model}`, // Use nickname or make+model
        value: netProfit,
        earnings,
        expenses: expenseTotal,
        rides: vehicleRides.length,
        miles: totalMiles,
        id: vehicle.id
      };
    }).filter(vehicle => vehicle.rides > 0); // Only include vehicles with rides
  }, [vehicles, rides, expenses]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-primary">Earnings: ${data.earnings.toFixed(2)}</p>
          <p className="text-sm text-destructive">Expenses: ${data.expenses.toFixed(2)}</p>
          <p className="text-sm font-semibold">Net Profit: ${data.value.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Rides: {data.rides}</p>
          <p className="text-sm text-muted-foreground">Miles: {data.miles.toFixed(0)}</p>
        </div>
      );
    }
    return null;
  };

  // Colors for different vehicles
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (vehicleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No vehicle data available for the selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={vehicleData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {vehicleData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
} 