"use client";

import { SelectRide } from "@/db/schema/rides-schema";
import { SelectExpense } from "@/db/schema/expenses-schema";
import { SelectVehicle } from "@/db/schema/vehicles-schema";
import { useState, useMemo } from "react";
import { parseISO, isWithinInterval, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { ExpensesChart } from "@/components/dashboard/expenses-chart";
import { VehicleValueChart } from "@/components/dashboard/vehicle-value-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    return rides.filter(ride => {
      const rideDate = parseISO(ride.sessionDate.toString());
      return dateRange?.from && dateRange?.to && isWithinInterval(rideDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  }, [rides, dateRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date.toString());
      return dateRange?.from && dateRange?.to && isWithinInterval(expenseDate, {
        start: dateRange.from,
        end: dateRange.to
      });
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
    </div>
  );
} 