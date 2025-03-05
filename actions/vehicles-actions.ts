"use server";

import { createVehicle, deleteVehicle, getVehicleById, getVehiclesByUserId, updateVehicle } from "@/db/queries/vehicles-queries";
import { InsertVehicle } from "@/db/schema/vehicles-schema";
import { ActionState } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createVehicleAction(data: Omit<InsertVehicle, "id" | "userId">): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const vehicleData: InsertVehicle = {
      ...data,
      id: uuidv4(),
      userId
    };

    const newVehicle = await createVehicle(vehicleData);
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    return { status: "success", message: "Vehicle created successfully", data: newVehicle };
  } catch (error) {
    return { status: "error", message: "Error creating vehicle" };
  }
}

export async function getVehicleByIdAction(id: string): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return { status: "error", message: "Vehicle not found" };
    }

    if (vehicle.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    return { status: "success", message: "Vehicle retrieved successfully", data: vehicle };
  } catch (error) {
    return { status: "error", message: "Failed to get vehicle" };
  }
}

export async function getVehiclesByUserIdAction(): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const vehicles = await getVehiclesByUserId(userId);
    return { status: "success", message: "Vehicles retrieved successfully", data: vehicles };
  } catch (error) {
    return { status: "error", message: "Failed to get vehicles" };
  }
}

export async function updateVehicleAction(id: string, data: Partial<InsertVehicle>): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return { status: "error", message: "Vehicle not found" };
    }

    if (vehicle.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const updatedVehicle = await updateVehicle(id, data);
    revalidatePath("/dashboard/vehicles");
    return { status: "success", message: "Vehicle updated successfully", data: updatedVehicle };
  } catch (error) {
    return { status: "error", message: "Failed to update vehicle" };
  }
}

export async function deleteVehicleAction(id: string): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return { status: "error", message: "Vehicle not found" };
    }

    if (vehicle.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    await deleteVehicle(id);
    revalidatePath("/dashboard/vehicles");
    return { status: "success", message: "Vehicle deleted successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to delete vehicle" };
  }
}