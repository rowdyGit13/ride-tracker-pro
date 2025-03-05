import { eq } from "drizzle-orm";
import { db } from "../db";
import { InsertVehicle, SelectVehicle, vehiclesTable } from "../schema/vehicles-schema";

export const createVehicle = async (data: InsertVehicle) => {
  try {
    const [newVehicle] = await db.insert(vehiclesTable).values(data).returning();
    return newVehicle;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw new Error("Failed to create vehicle");
  }
};

export const getVehicleById = async (id: string) => {
  try {
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehiclesTable.id, id)
    });
    return vehicle;
  } catch (error) {
    console.error("Error getting vehicle by ID:", error);
    throw new Error("Failed to get vehicle");
  }
};

export const getVehiclesByUserId = async (userId: string): Promise<SelectVehicle[]> => {
  try {
    const vehicles = await db.query.vehicles.findMany({
      where: eq(vehiclesTable.userId, userId)
    });
    return vehicles;
  } catch (error) {
    console.error("Error getting vehicles by user ID:", error);
    throw new Error("Failed to get vehicles");
  }
};

export const updateVehicle = async (id: string, data: Partial<InsertVehicle>) => {
  try {
    const [updatedVehicle] = await db.update(vehiclesTable).set(data).where(eq(vehiclesTable.id, id)).returning();
    return updatedVehicle;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw new Error("Failed to update vehicle");
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw new Error("Failed to delete vehicle");
  }
}; 