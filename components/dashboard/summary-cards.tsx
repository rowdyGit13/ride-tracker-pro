"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Car, TrendingUp, Wallet, BarChart, Clock, Timer } from "lucide-react";

interface SummaryMetrics {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  totalSessions: number;
  avgEarningsPerSession: number;
  totalHoursOnline: number;
  totalHoursBooked: number;
  hourlyRateOnline: number;
  hourlyRateBooked: number;
}

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalEarnings)}</div>
          <p className="text-xs text-muted-foreground">
            From {metrics.totalSessions} driving sessions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            Including depreciation
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.netProfit < 0 ? 'text-destructive' : ''}`}>
            {formatCurrency(metrics.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            Earnings minus expenses
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Per Session</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.avgEarningsPerSession)}</div>
          <p className="text-xs text-muted-foreground">
            Average earnings per session
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hours (Online)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(metrics.totalHoursOnline)}</div>
          <p className="text-xs text-muted-foreground">
            Total time online
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hours (Booked)</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(metrics.totalHoursBooked)}</div>
          <p className="text-xs text-muted-foreground">
            Total time with passengers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hourly (Online)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.hourlyRateOnline)}</div>
          <p className="text-xs text-muted-foreground">
            Earnings per hour online
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hourly (Booked)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.hourlyRateBooked)}</div>
          <p className="text-xs text-muted-foreground">
            Earnings per hour with passengers
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 