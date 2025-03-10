import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { InsertExpense, SelectExpense, expensesTable } from "../schema/expenses-schema";

export const createExpense = async (data: InsertExpense) => {
  try {
    console.log("Creating expense in database with data:", JSON.stringify(data));
    const [newExpense] = await db.insert(expensesTable).values(data).returning();
    console.log("Successfully created expense:", newExpense.id);
    return newExpense;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw new Error("Failed to create expense");
  }
};

export const getExpenseById = async (id: string) => {
  try {
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, id)
    });
    return expense;
  } catch (error) {
    console.error("Error getting expense by ID:", error);
    throw new Error("Failed to get expense");
  }
};

export const getExpensesByUserId = async (userId: string): Promise<SelectExpense[]> => {
  try {
    const expenses = await db.query.expenses.findMany({
      where: eq(expensesTable.userId, userId),
      orderBy: [desc(expensesTable.date)]
    });
    return expenses;
  } catch (error) {
    console.error("Error getting expenses by user ID:", error);
    throw new Error("Failed to get expenses");
  }
};

export const getExpensesByVehicleId = async (vehicleId: string, userId: string): Promise<SelectExpense[]> => {
  try {
    const expenses = await db.query.expenses.findMany({
      where: and(
        eq(expensesTable.vehicleId, vehicleId),
        eq(expensesTable.userId, userId)
      ),
      orderBy: [desc(expensesTable.date)]
    });
    return expenses;
  } catch (error) {
    console.error("Error getting expenses by vehicle ID:", error);
    throw new Error("Failed to get expenses");
  }
};

export const updateExpense = async (id: string, data: Partial<InsertExpense>) => {
  try {
    const [updatedExpense] = await db.update(expensesTable).set(data).where(eq(expensesTable.id, id)).returning();
    return updatedExpense;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw new Error("Failed to update expense");
  }
};

export const deleteExpense = async (id: string) => {
  try {
    await db.delete(expensesTable).where(eq(expensesTable.id, id));
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw new Error("Failed to delete expense");
  }
}; 