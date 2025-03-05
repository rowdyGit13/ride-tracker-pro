import { ExpenseForm } from "@/components/forms/expense-form";
import { getVehiclesByUserIdAction } from "@/actions/vehicles-actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewExpensePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Get vehicles for the user
  const vehiclesResponse = await getVehiclesByUserIdAction();
  const vehicles = vehiclesResponse.data || [];
  
  // Check if user has any vehicles
  if (vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">Add New Expense</h2>
        </div>
        
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">No Vehicles Found</h3>
          <p className="text-muted-foreground mb-4">
            You need to add a vehicle before you can add an expense.
          </p>
          <Button asChild>
            <Link href="/forms/vehicles/new">Add a Vehicle</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Add New Expense</h2>
      </div>
      
      <ExpenseForm />
    </div>
  );
} 