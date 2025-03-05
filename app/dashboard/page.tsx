import { getRidesByUserIdAction } from "@/actions/rides-actions";
import { getExpensesByUserIdAction } from "@/actions/expenses-actions";
import { getVehiclesByUserIdAction } from "@/actions/vehicles-actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch all the data needed for the dashboard
  const [ridesResponse, expensesResponse, vehiclesResponse] = await Promise.all([
    getRidesByUserIdAction(),
    getExpensesByUserIdAction(),
    getVehiclesByUserIdAction()
  ]);

  const rides = ridesResponse.status === "success" ? ridesResponse.data : [];
  const expenses = expensesResponse.status === "success" ? expensesResponse.data : [];
  const vehicles = vehiclesResponse.status === "success" ? vehiclesResponse.data : [];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardClient 
        rides={rides} 
        expenses={expenses} 
        vehicles={vehicles} 
      />
    </div>
  );
} 