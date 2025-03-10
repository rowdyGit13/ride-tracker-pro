"use client";

import { SelectRide } from "@/db/schema/rides-schema";
import { SelectExpense } from "@/db/schema/expenses-schema";
import { SelectVehicle } from "@/db/schema/vehicles-schema";
import { useState, useMemo, useEffect } from "react";
import { isWithinInterval, subMonths, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { ExpensesChart } from "@/components/dashboard/expenses-chart";
import { NetProfitChart } from "@/components/dashboard/net-profit-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseDate } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";


interface DashboardClientProps {
  rides: SelectRide[];
  expenses: SelectExpense[];
  vehicles: SelectVehicle[];
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function DashboardClient({ 
  rides, 
  expenses, 
  vehicles,
  initialStartDate,
  initialEndDate 
}: DashboardClientProps) {
  // Use router to update URL without navigation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize date range from props or default values
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Use provided initial dates, or default to current month
    const startDate = initialStartDate || (() => {
      const date = new Date();
      date.setDate(1); // First day of month
      return date;
    })();
    
    const endDate = initialEndDate || new Date();
    
    return {
      from: startDate,
      to: endDate
    };
  });

  // Update URL when date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    
    if (range?.from) {
      // Create new URL parameters
      const params = new URLSearchParams(searchParams.toString());
      params.set('startDate', range.from.toISOString().split('T')[0]);
      
      if (range.to) {
        params.set('endDate', range.to.toISOString().split('T')[0]);
      } else {
        params.delete('endDate');
      }
      
      // Update URL without forcing a navigation
      router.push(`/dashboard?${params.toString()}`, { scroll: false });
    }
  };

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

    // Calculate total regular expenses
    const totalRegularExpenses = filteredExpenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);
    
    // Calculate depreciation from miles driven (5 cents per mile)
    const totalDepreciation = filteredRides.reduce((sum, ride) => {
      const milesOnline = Number(ride.distanceOnline || 0);
      if (!isNaN(milesOnline)) {
        return sum + (milesOnline * 0.05);
      }
      return sum;
    }, 0);
    
    // Add depreciation to expenses
    const totalExpenses = totalRegularExpenses + totalDepreciation;

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
      totalRegularExpenses,
      totalDepreciation,
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

  // React to date range changes
  useEffect(() => {
    console.log("Date range changed:", dateRange);
    
    // If date range is undefined, ensure we're showing all data
    if (!dateRange) {
      // No need to filter the data, just log it
      console.log("Date range cleared, showing all data");
    }
  }, [dateRange]);

  // Create a useEffect to handle fallback to all data if filters result in no data
  useEffect(() => {
    if (rides.length > 0 && filteredRides.length === 0) {
      console.log("No rides match the filter, showing a warning");
    }
    
    if (expenses.length > 0 && filteredExpenses.length === 0) {
      console.log("No expenses match the filter, showing a warning");
    }
  }, [rides, filteredRides, expenses, filteredExpenses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            Performance overview of your driving sessions and expenses
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Filter data by date range
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} setDateRange={handleDateRangeChange} />
      </div>

      <SummaryCards metrics={summaryMetrics} />

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
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
              <EarningsChart 
                rides={filteredRides} 
                dateRange={dateRange} 
              />
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
              <ExpensesChart 
                expenses={filteredExpenses} 
                dateRange={dateRange}
                rides={filteredRides}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Overview</CardTitle>
              <CardDescription>
                Monthly breakdown of your net profit (earnings minus expenses)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <NetProfitChart 
                rides={filteredRides} 
                expenses={filteredExpenses}
                dateRange={dateRange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 