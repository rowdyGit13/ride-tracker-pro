"use server";

import { createRide, deleteRide, getRideById, getRidesByUserId, updateRide } from "@/db/queries/rides-queries";
import { InsertRide } from "@/db/schema/rides-schema";
import { ActionState } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createRideAction(data: Omit<InsertRide, "id" | "userId">): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const rideData: InsertRide = {
      ...data,
      id: uuidv4(),
      userId
    };

    const newRide = await createRide(rideData);
    
    // Ensure all paths are revalidated
    revalidatePath("/dashboard/rides");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    revalidatePath("/");
    
    console.log("Ride created and paths revalidated:", newRide.id);
    
    return { status: "success", message: "Ride created successfully", data: newRide };
  } catch (error) {
    console.error("Error creating ride:", error);
    return { status: "error", message: "Error creating ride" };
  }
}

export async function getRideByIdAction(id: string): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const ride = await getRideById(id);
    if (!ride) {
      return { status: "error", message: "Ride not found" };
    }

    if (ride.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    return { status: "success", message: "Ride retrieved successfully", data: ride };
  } catch (error) {
    return { status: "error", message: "Failed to get ride" };
  }
}

export async function getRidesByUserIdAction(): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const rides = await getRidesByUserId(userId);
    return { status: "success", message: "Rides retrieved successfully", data: rides };
  } catch (error) {
    return { status: "error", message: "Failed to get rides" };
  }
}

export async function updateRideAction(id: string, data: Partial<InsertRide>): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const ride = await getRideById(id);
    if (!ride) {
      return { status: "error", message: "Ride not found" };
    }

    if (ride.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const updatedRide = await updateRide(id, data);
    
    // Ensure all paths are revalidated
    revalidatePath("/dashboard/rides");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    revalidatePath("/");
    
    console.log("Ride updated and paths revalidated:", id);
    
    return { status: "success", message: "Ride updated successfully", data: updatedRide };
  } catch (error) {
    console.error("Error updating ride:", error);
    return { status: "error", message: "Failed to update ride" };
  }
}

export async function deleteRideAction(id: string): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const ride = await getRideById(id);
    if (!ride) {
      return { status: "error", message: "Ride not found" };
    }

    if (ride.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    await deleteRide(id);
    
    // Ensure all paths are revalidated
    revalidatePath("/dashboard/rides");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    revalidatePath("/");
    
    console.log("Ride deleted and paths revalidated:", id);
    
    return { status: "success", message: "Ride deleted successfully" };
  } catch (error) {
    console.error("Error deleting ride:", error);
    return { status: "error", message: "Failed to delete ride" };
  }
} 