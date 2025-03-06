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

  // Debug logs
  console.log("Dashboard data fetched:");
  console.log(`Vehicles: ${vehicles.length}`);
  console.log(`Rides: ${rides.length}`);
  console.log(`Expenses: ${expenses.length}`);
  
  if (vehicles.length > 0) {
    console.log("First vehicle:", {
      id: vehicles[0].id,
      make: vehicles[0].make,
      model: vehicles[0].model
    });
  } else {
    console.log("No vehicles found");
  }
  
  if (rides.length > 0) {
    console.log("First ride:", {
      id: rides[0].id,
      vehicleId: rides[0].vehicleId,
      date: rides[0].sessionDate,
      amount: rides[0].totalAmount
    });
  } else {
    console.log("No rides found");
  }
  
  if (expenses.length > 0) {
    console.log("First expense:", {
      id: expenses[0].id,
      vehicleId: expenses[0].vehicleId,
      date: expenses[0].date,
      amount: expenses[0].amount
    });
  } else {
    console.log("No expenses found");
  }

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