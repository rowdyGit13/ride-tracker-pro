import { getRidesByUserIdAction } from "@/actions/rides-actions";
import { getExpensesByUserIdAction } from "@/actions/expenses-actions";
import { getVehiclesByUserIdAction } from "@/actions/vehicles-actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


type Props = {
  params?: Promise<{ [key: string]: string | string[] }>;
  searchParams?: Promise<{ 
    startDate?: string; 
    endDate?: string;
  }>;
};

export default async function DashboardPage({ 
  searchParams: searchParamsPromise 
}: Props) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Await the searchParams Promise
  const searchParams = await searchParamsPromise || {};

  // Get date range from URL or use defaults
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : getDefaultStartDate();
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : new Date();

  // Serialize dates to ensure they're valid
  const initialStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : getDefaultStartDate();
  const initialEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : new Date();

  // Fetch all the data needed for the dashboard
  const [ridesResponse, expensesResponse, vehiclesResponse] = await Promise.all([
    getRidesByUserIdAction(),
    getExpensesByUserIdAction(),
    getVehiclesByUserIdAction()
  ]);

  const rides = ridesResponse.status === "success" ? ridesResponse.data : [];
  const expenses = expensesResponse.status === "success" ? expensesResponse.data : [];
  const vehicles = vehiclesResponse.status === "success" ? vehiclesResponse.data : [];


  
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
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
      />
    </div>
  );
}

// Helper function to get default start date (first day of current month)
function getDefaultStartDate(): Date {
  const date = new Date();
  date.setDate(1); // First day of month
  return date;
} 