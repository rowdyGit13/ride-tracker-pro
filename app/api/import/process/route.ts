import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRideAction } from "@/actions/rides-actions";
import { createExpenseAction } from "@/actions/expenses-actions";
import { getVehicleById } from "@/db/queries/vehicles-queries";
import { parse as csvParse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const confirm = formData.get("confirm") as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!type || !["rides", "expenses"].includes(type)) {
      return NextResponse.json({ message: "Invalid import type" }, { status: 400 });
    }

    if (!vehicleId) {
      return NextResponse.json({ message: "Vehicle ID is required" }, { status: 400 });
    }

    if (!confirm || confirm !== "true") {
      return NextResponse.json({ message: "Import not confirmed" }, { status: 400 });
    }

    // Validate vehicle exists and belongs to user
    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 400 });
    }

    if (vehicle.userId !== userId) {
      return NextResponse.json({ message: "Unauthorized - Vehicle does not belong to user" }, { status: 401 });
    }

    // Read file content
    const fileContent = await file.text();
    let data: any[] = [];

    // Parse file based on format
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt === "csv") {
      data = csvParse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } else if (fileExt === "json") {
      data = JSON.parse(fileContent);
      if (!Array.isArray(data)) {
        return NextResponse.json({ message: "JSON file must contain an array of records" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: "Only CSV and JSON formats are currently supported" }, { status: 400 });
    }

    // Process data based on type
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; message: string }[]
    };

    if (type === "rides") {
      // Process rides with the selected vehicleId
      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          
          // Parse and validate the date
          let sessionDate: Date;
          try {
            if (!record.sessionDate) {
              throw new Error("Session date is required");
            }
            sessionDate = new Date(record.sessionDate);
            if (isNaN(sessionDate.getTime())) {
              throw new Error("Invalid session date format");
            }
          } catch (error) {
            const dateError = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid session date: ${dateError}`);
          }
          
          // Create ride data using the selected vehicleId
          const rideData = {
            vehicleId, // Use the selected vehicleId from the form
            rideType: record.rideType || "other",
            sessionDate: sessionDate,
            timeOnline: String(parseFloat(record.timeOnline) || 0),
            timeBooked: String(parseFloat(record.timeBooked) || 0),
            distanceOnline: String(parseFloat(record.distanceOnline) || 0),
            distanceBooked: String(parseFloat(record.distanceBooked) || 0),
            totalAmount: String(parseFloat(record.totalAmount) || 0),
            notes: record.notes || ""
          };

          console.log("Creating ride with data:", JSON.stringify(rideData));
          const result = await createRideAction(rideData);
          
          console.log("Ride creation result:", result);
          if (result.status === "error") {
            results.failed++;
            results.errors.push({
              row: i,
              message: result.message || "Failed to create ride"
            });
          } else {
            results.success++;
          }
        } catch (error) {
          console.error("Error creating ride:", error);
          results.failed++;
          results.errors.push({
            row: i,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    } else if (type === "expenses") {
      // Process expenses with the selected vehicleId
      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          
          // Parse and validate the date
          let expenseDate: Date;
          try {
            if (!record.date) {
              throw new Error("Date is required");
            }
            expenseDate = new Date(record.date);
            if (isNaN(expenseDate.getTime())) {
              throw new Error("Invalid date format");
            }
          } catch (error) {
            const dateError = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid expense date: ${dateError}`);
          }
          
          // Create expense data using the selected vehicleId
          const expenseData = {
            vehicleId, // Use the selected vehicleId from the form
            expenseType: record.expenseType || "other",
            date: expenseDate,
            amount: String(parseFloat(record.amount) || 0),
            description: record.description || ""
          };

          console.log("Creating expense with data:", JSON.stringify(expenseData));
          const result = await createExpenseAction(expenseData);
          
          console.log("Expense creation result:", result);
          if (result.status === "error") {
            results.failed++;
            results.errors.push({
              row: i,
              message: result.message || "Failed to create expense"
            });
          } else {
            results.success++;
          }
        } catch (error) {
          console.error("Error creating expense:", error);
          results.failed++;
          results.errors.push({
            row: i,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    }

    return NextResponse.json({
      message: `Import completed with ${results.success} successful records and ${results.failed} failures`,
      imported: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 20) // Limit errors to first 20
    });

  } catch (error) {
    console.error("Error processing import:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error processing import" },
      { status: 500 }
    );
  }
}