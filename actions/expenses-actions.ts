"use server";

import { createExpense, deleteExpense, getExpenseById, getExpensesByUserId, updateExpense } from "@/db/queries/expenses-queries";
import { InsertExpense } from "@/db/schema/expenses-schema";
import { ActionState } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createExpenseAction(data: Omit<InsertExpense, "id" | "userId">): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const expenseData: InsertExpense = {
      ...data,
      id: uuidv4(),
      userId
    };

    const newExpense = await createExpense(expenseData);
    
    // Ensure all paths are revalidated
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    revalidatePath("/");
    
    console.log("Expense created and paths revalidated:", newExpense.id);
    
    return { status: "success", message: "Expense created successfully", data: newExpense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { status: "error", message: "Error creating expense" };
  }
}

export async function getExpenseByIdAction(id: string): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const expense = await getExpenseById(id);
    if (!expense) {
      return { status: "error", message: "Expense not found" };
    }

    if (expense.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    return { status: "success", message: "Expense retrieved successfully", data: expense };
  } catch (error) {
    return { status: "error", message: "Failed to get expense" };
  }
}

export async function getExpensesByUserIdAction(): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const expenses = await getExpensesByUserId(userId);
    return { status: "success", message: "Expenses retrieved successfully", data: expenses };
  } catch (error) {
    return { status: "error", message: "Failed to get expenses" };
  }
}

export async function updateExpenseAction(id: string, data: Partial<InsertExpense>): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const expense = await getExpenseById(id);
    if (!expense) {
      return { status: "error", message: "Expense not found" };
    }

    if (expense.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const updatedExpense = await updateExpense(id, data);
    
    // Ensure all paths are revalidated
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    revalidatePath("/");
    
    console.log("Expense updated and paths revalidated:", id);
    
    return { status: "success", message: "Expense updated successfully", data: updatedExpense };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { status: "error", message: "Failed to update expense" };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: "error", message: "Unauthorized" };
    }

    const expense = await getExpenseById(id);
    if (!expense) {
      return { status: "error", message: "Expense not found" };
    }

    if (expense.userId !== userId) {
      return { status: "error", message: "Unauthorized" };
    }

    await deleteExpense(id);
    
    // Ensure all paths are revalidated
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/forms");
    revalidatePath("/");
    
    console.log("Expense deleted and paths revalidated:", id);
    
    return { status: "success", message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { status: "error", message: "Failed to delete expense" };
  }
} 