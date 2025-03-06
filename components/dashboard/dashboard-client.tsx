"use client";

import { SelectRide } from "@/db/schema/rides-schema";
import { SelectExpense } from "@/db/schema/expenses-schema";
import { SelectVehicle } from "@/db/schema/vehicles-schema";
import { useState, useMemo, useEffect } from "react";
import { parseISO, isWithinInterval, subMonths, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { ExpensesChart } from "@/components/dashboard/expenses-chart";
import { VehicleValueChart } from "@/components/dashboard/vehicle-value-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseDate } from "@/lib/utils";

// Debug component to show data counts
function DataDebugger({ 
  rides, 
  filteredRides, 
  expenses, 
  filteredExpenses, 
  vehicles 
}: { 
  rides: SelectRide[], 
  filteredRides: SelectRide[], 
  expenses: SelectExpense[], 
  filteredExpenses: SelectExpense[], 
  vehicles: SelectVehicle[] 
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="p-4 my-4 border border-dashed border-yellow-400 bg-yellow-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Data Validation</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-2">
        <div>
          <p><strong>Vehicles:</strong> {vehicles.length}</p>
          {vehicles.length === 0 && <p className="text-red-500 text-xs">No vehicles found</p>}
        </div>
        <div>
          <p><strong>Total Rides:</strong> {rides.length}</p>
          <p><strong>Filtered Rides:</strong> {filteredRides.length}</p>
          {rides.length === 0 && <p className="text-red-500 text-xs">No rides found</p>}
        </div>
        <div>
          <p><strong>Total Expenses:</strong> {expenses.length}</p>
          <p><strong>Filtered Expenses:</strong> {filteredExpenses.length}</p>
          {expenses.length === 0 && <p className="text-red-500 text-xs">No expenses found</p>}
        </div>
      </div>
      
      {showDetails && vehicles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Vehicle IDs:</h4>
          <ul className="text-xs">
            {vehicles.map(v => (
              <li key={v.id}>{v.id}: {v.make} {v.model}</li>
            ))}
          </ul>
        </div>
      )}
      
      {showDetails && filteredRides.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">First Ride:</h4>
          <pre className="text-xs overflow-auto max-h-20">
            {JSON.stringify(filteredRides[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

interface DashboardClientProps {
  rides: SelectRide[];
  expenses: SelectExpense[];
  vehicles: SelectVehicle[];
}

export function DashboardClient({ rides, expenses, vehicles }: DashboardClientProps) {
  // Set default date range to last 3 months
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  // Filter rides and expenses based on date range
  const filteredRides = useMemo(() => {
    // Log the first ride's date type and structure to debug
    if (rides.length > 0) {
      const firstRide = rides[0];
      console.log("First ride date debug:");
      console.log("- Date value:", firstRide.sessionDate);
      console.log("- Date type:", typeof firstRide.sessionDate);
      console.log("- ToString:", firstRide.sessionDate.toString());
      console.log("- ToJSON:", JSON.stringify(firstRide.sessionDate));
      console.log("- Parsed with utility:", parseDate(firstRide.sessionDate));
    }
    
    console.log("Filtering rides with date range:", dateRange);
    
    if (!dateRange?.from && !dateRange?.to) {
      console.log("No date range selected, returning all rides:", rides.length);
      // If no date range is selected, return all rides
      return rides;
    }
    
    const filtered = rides.filter(ride => {
      try {
        // Use our robust date parsing utility
        const rideDate = parseDate(ride.sessionDate);
        
        console.log(`Ride date: ${ride.sessionDate} parsed as: ${rideDate}`);
        
        // Check if the date is valid
        if (!rideDate) {
          console.error(`Invalid date for ride ${ride.id}: ${ride.sessionDate}`);
          return false;
        }
        
        if (!dateRange.from || !dateRange.to) {
          return true;
        }
        
        // Add one day to the end date to include the end date in the range
        const adjustedEndDate = addDays(dateRange.to, 1);
        
        const isInRange = isWithinInterval(rideDate, {
          start: dateRange.from,
          end: adjustedEndDate
        });
        
        console.log(`Ride ${ride.id}: in range? ${isInRange} (${dateRange.from} - ${adjustedEndDate})`);
        return isInRange;
      } catch (error) {
        console.error("Error parsing ride date:", error, ride.sessionDate);
        return false;
      }
    });
    
    console.log(`Filtered rides: ${filtered.length} out of ${rides.length}`);
    return filtered;
  }, [rides, dateRange]);

  const filteredExpenses = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) {
      // If no date range is selected, return all expenses
      return expenses;
    }
    
    return expenses.filter(expense => {
      try {
        // Use our robust date parsing utility
        const expenseDate = parseDate(expense.date);
        
        // Check if the date is valid
        if (!expenseDate) {
          console.error(`Invalid date for expense ${expense.id}: ${expense.date}`);
          return false;
        }
        
        if (!dateRange.from || !dateRange.to) {
          return true;
        }
        
        // Add one day to the end date to include the end date in the range
        const adjustedEndDate = addDays(dateRange.to, 1);
        
        return isWithinInterval(expenseDate, {
          start: dateRange.from,
          end: adjustedEndDate
        });
      } catch (error) {
        console.error("Error parsing expense date:", error, expense.date);
        return false;
      }
    });
  }, [expenses, dateRange]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalEarnings = filteredRides.reduce((sum, ride) => {
      return sum + Number(ride.totalAmount);
    }, 0);

    const totalExpenses = filteredExpenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    const netProfit = totalEarnings - totalExpenses;
    const totalSessions = filteredRides.length;
    const avgEarningsPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0;

    // Calculate total hours online and booked
    const totalHoursOnline = filteredRides.reduce((sum, ride) => {
      return sum + Number(ride.timeOnline);
    }, 0);
    
    const totalHoursBooked = filteredRides.reduce((sum, ride) => {
      return sum + Number(ride.timeBooked);
    }, 0);
    
    // Calculate hourly rates
    const hourlyRateOnline = totalHoursOnline > 0 ? totalEarnings / totalHoursOnline : 0;
    const hourlyRateBooked = totalHoursBooked > 0 ? totalEarnings / totalHoursBooked : 0;

    // Debug logging
    console.log("Dashboard filtering debug:");
    console.log("Date range:", dateRange);
    console.log(`Total rides: ${rides.length}, Filtered rides: ${filteredRides.length}`);
    console.log(`Total expenses: ${expenses.length}, Filtered expenses: ${filteredExpenses.length}`);
    console.log("First filtered ride:", filteredRides[0] || "None");
    console.log("First filtered expense:", filteredExpenses[0] || "None");
    console.log("Summary metrics:", {
      totalEarnings,
      totalExpenses,
      netProfit,
      totalSessions,
      avgEarningsPerSession,
      totalHoursOnline,
      totalHoursBooked,
      hourlyRateOnline,
      hourlyRateBooked
    });

    return {
      totalEarnings,
      totalExpenses,
      netProfit,
      totalSessions,
      avgEarningsPerSession,
      totalHoursOnline,
      totalHoursBooked,
      hourlyRateOnline,
      hourlyRateBooked
    };
  }, [filteredRides, filteredExpenses]);

  // Add debug component to show first ride in pure data form
  const addDebugPanel = () => {
    if (rides.length > 0 && filteredRides.length === 0) {
      console.log("Dashboard filtering debug:");
      console.log("Date range:", dateRange);
      console.log(`Total rides: ${rides.length}, Filtered rides: ${filteredRides.length}`);
      console.log(`Total expenses: ${expenses.length}, Filtered expenses: ${filteredExpenses.length}`);
      console.log("First filtered ride:", filteredRides.length > 0 ? filteredRides[0] : "None");
      console.log("First filtered expense:", filteredExpenses.length > 0 ? filteredExpenses[0] : "None");
      console.log("Summary metrics:", summaryMetrics);
    }
  };

  // Call the debug function
  addDebugPanel();

  // Create a useEffect to handle fallback to all data if filters result in no data
  useEffect(() => {
    if (rides.length > 0 && filteredRides.length === 0) {
      console.log("No rides match the filter, showing a warning");
    }
    
    if (expenses.length > 0 && filteredExpenses.length === 0) {
      console.log("No expenses match the filter, showing a warning");
    }
  }, [rides, filteredRides, expenses, filteredExpenses]);

  // Show data warning banner if needed
  const renderDataWarning = () => {
    if ((rides.length > 0 && filteredRides.length === 0) || 
        (expenses.length > 0 && filteredExpenses.length === 0)) {
      return (
        <div className="p-4 mb-4 border border-yellow-300 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Data Filter Warning</h3>
          <p className="text-sm text-yellow-700">
            Some of your data couldn't be displayed with the current date filter. This is likely due to 
            date format issues. Try selecting "All Time" in the date picker to see all your data.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
            onClick={() => setDateRange(undefined)}
          >
            Show All Data
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Performance overview of your driving sessions and expenses
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {renderDataWarning()}

      <SummaryCards metrics={summaryMetrics} />

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Monthly breakdown of your earnings from driving sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <EarningsChart rides={filteredRides} dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses Overview</CardTitle>
              <CardDescription>
                Monthly breakdown of your expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ExpensesChart expenses={filteredExpenses} dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Performance</CardTitle>
              <CardDescription>
                Comparison of earnings and expenses by vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <VehicleValueChart 
                vehicles={vehicles} 
                rides={filteredRides} 
                expenses={filteredExpenses} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DataDebugger rides={rides} filteredRides={filteredRides} expenses={expenses} filteredExpenses={filteredExpenses} vehicles={vehicles} />
    </div>
  );
} 