import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { InsertRide, SelectRide, ridesTable } from "../schema/rides-schema";

export const createRide = async (data: InsertRide) => {
  try {
    const [newRide] = await db.insert(ridesTable).values(data).returning();
    return newRide;
  } catch (error) {
    console.error("Error creating ride:", error);
    throw new Error("Failed to create ride");
  }
};

export const getRideById = async (id: string) => {
  try {
    const ride = await db.query.rides.findFirst({
      where: eq(ridesTable.id, id)
    });
    return ride;
  } catch (error) {
    console.error("Error getting ride by ID:", error);
    throw new Error("Failed to get ride");
  }
};

export const getRidesByUserId = async (userId: string): Promise<SelectRide[]> => {
  try {
    const rides = await db.query.rides.findMany({
      where: eq(ridesTable.userId, userId),
      orderBy: [desc(ridesTable.startTime)]
    });
    return rides;
  } catch (error) {
    console.error("Error getting rides by user ID:", error);
    throw new Error("Failed to get rides");
  }
};

export const getRidesByVehicleId = async (vehicleId: string, userId: string): Promise<SelectRide[]> => {
  try {
    const rides = await db.query.rides.findMany({
      where: and(
        eq(ridesTable.vehicleId, vehicleId),
        eq(ridesTable.userId, userId)
      ),
      orderBy: [desc(ridesTable.startTime)]
    });
    return rides;
  } catch (error) {
    console.error("Error getting rides by vehicle ID:", error);
    throw new Error("Failed to get rides");
  }
};

export const updateRide = async (id: string, data: Partial<InsertRide>) => {
  try {
    const [updatedRide] = await db.update(ridesTable).set(data).where(eq(ridesTable.id, id)).returning();
    return updatedRide;
  } catch (error) {
    console.error("Error updating ride:", error);
    throw new Error("Failed to update ride");
  }
};

export const deleteRide = async (id: string) => {
  try {
    await db.delete(ridesTable).where(eq(ridesTable.id, id));
  } catch (error) {
    console.error("Error deleting ride:", error);
    throw new Error("Failed to delete ride");
  }
}; 