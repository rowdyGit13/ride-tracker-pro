import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, DollarSign, MapPin } from "lucide-react";

export default function FormsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Driving Sessions
          </CardTitle>
          <CardDescription>
            Track your driving sessions and earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">
            Add details about your driving sessions including total earnings, 
            time online, time booked, and distance driven.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forms/rides/new">Add New Driving Session</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Vehicles
          </CardTitle>
          <CardDescription>
            Manage your vehicles for ride tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">
            Add details about your vehicles including make, model, year, 
            color, and license plate.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forms/vehicles/new">Add New Vehicle</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Expenses
          </CardTitle>
          <CardDescription>
            Track your business expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">
            Record expenses like gas, maintenance, insurance, and other 
            costs related to your rideshare business.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forms/expenses/new">Add New Expense</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 