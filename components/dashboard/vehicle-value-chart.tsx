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
import { parseDate } from "@/lib/utils";

interface VehicleValueChartProps {
  vehicles: SelectVehicle[];
  rides: SelectRide[];
  expenses: SelectExpense[];
}

export function VehicleValueChart({ vehicles, rides, expenses }: VehicleValueChartProps) {
  // Calculate metrics for each vehicle
  const vehicleData = useMemo(() => {
    // Debug log
    console.log("VehicleValueChart - Preparing chart data");
    console.log(`Vehicles count: ${vehicles.length}`);
    console.log(`Rides count: ${rides.length}`);
    console.log(`Expenses count: ${expenses.length}`);
    
    // Log the structure of the first item of each array
    if (vehicles.length > 0) {
      console.log("First vehicle structure:", JSON.stringify(vehicles[0]));
    }
    
    if (rides.length > 0) {
      console.log("First ride structure:", JSON.stringify(rides[0]));
    }
    
    if (expenses.length > 0) {
      console.log("First expense structure:", JSON.stringify(expenses[0]));
    }
    
    if (vehicles.length === 0) {
      console.log("No vehicles found");
      return [];
    }
    
    if (rides.length === 0) {
      console.log("No rides found");
      return [];
    }
    
    try {
      const data = vehicles.map(vehicle => {
        // Get rides for this vehicle
        const vehicleRides = rides.filter(ride => {
          const isMatch = ride.vehicleId === vehicle.id;
          if (!isMatch) {
            console.log(`ID mismatch: ride.vehicleId: ${ride.vehicleId} vs vehicle.id: ${vehicle.id}`);
          }
          return isMatch;
        });
        
        console.log(`Vehicle ${vehicle.id} (${vehicle.make} ${vehicle.model}) has ${vehicleRides.length} rides`);
        
        // Calculate total earnings for this vehicle
        let earnings = 0;
        try {
          earnings = vehicleRides.reduce((sum, ride) => {
            const amount = Number(ride.totalAmount);
            if (isNaN(amount)) {
              console.log(`Invalid amount for ride ${ride.id}: ${ride.totalAmount}`);
              return sum;
            }
            return sum + amount;
          }, 0);
        } catch (error) {
          console.error("Error calculating earnings:", error);
        }
      
        // Get expenses for this vehicle
        const vehicleExpenses = expenses.filter(expense => expense.vehicleId === vehicle.id);
        
        console.log(`Vehicle ${vehicle.id} has ${vehicleExpenses.length} expenses`);
        
        // Calculate total expenses for this vehicle
        let totalExpenses = 0;
        try {
          totalExpenses = vehicleExpenses.reduce((sum, expense) => {
            const amount = Number(expense.amount);
            if (isNaN(amount)) {
              console.log(`Invalid amount for expense ${expense.id}: ${expense.amount}`);
              return sum;
            }
            return sum + amount;
          }, 0);
        } catch (error) {
          console.error("Error calculating expenses:", error);
        }
        
        // Calculate net profit
        const netProfit = earnings - totalExpenses;
        
        // Calculate total hours and miles
        const totalHoursOnline = vehicleRides.reduce((sum, ride) => {
          return sum + Number(ride.timeOnline || 0);
        }, 0);
        
        const totalHoursBooked = vehicleRides.reduce((sum, ride) => {
          return sum + Number(ride.timeBooked || 0);
        }, 0);
        
        const totalMilesOnline = vehicleRides.reduce((sum, ride) => {
          return sum + Number(ride.distanceOnline || 0);
        }, 0);
        
        const totalMilesBooked = vehicleRides.reduce((sum, ride) => {
          return sum + Number(ride.distanceBooked || 0);
        }, 0);

        return {
          name: vehicle.nickname || `${vehicle.make} ${vehicle.model}`, // Use nickname or make+model
          value: netProfit,
          earnings,
          expenses: totalExpenses,
          sessions: vehicleRides.length,
          hoursOnline: totalHoursOnline,
          hoursBooked: totalHoursBooked,
          milesOnline: totalMilesOnline,
          milesBooked: totalMilesBooked,
          id: vehicle.id
        };
      });
      
      // Filter to only include vehicles with sessions
      const filteredData = data.filter(vehicle => vehicle.sessions > 0);
      console.log(`Filtered to ${filteredData.length} vehicles with sessions`);
      
      return filteredData;
    } catch (error) {
      console.error("Error calculating vehicle data:", error);
      return [];
    }
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
          <p className="text-sm text-muted-foreground">Sessions: {data.sessions}</p>
          <p className="text-sm text-muted-foreground">Hours Online: {data.hoursOnline.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">Hours Booked: {data.hoursBooked.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">Miles Online: {data.milesOnline.toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">Miles Booked: {data.milesBooked.toFixed(0)}</p>
        </div>
      );
    }
    return null;
  };

  // Colors for different vehicles
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // If no data to display, show a message
  if (vehicleData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500 text-center mb-2">No vehicle performance data available</p>
        <ul className="text-sm text-gray-400 list-disc list-inside">
          {vehicles.length === 0 && <li>No vehicles in your garage</li>}
          {rides.length === 0 && <li>No ride sessions recorded</li>}
          {vehicles.length > 0 && rides.length > 0 && (
            <li>Your rides may not be assigned to the correct vehicles</li>
          )}
        </ul>
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