import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRideAction } from "@/actions/rides-actions";
import { createExpenseAction } from "@/actions/expenses-actions";
import { createVehicleAction } from "@/actions/vehicles-actions";
import { parse as csvParse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";

// Templates structure for validation
const templates = {
  rides: [
    "vehicleId", 
    "rideType", 
    "sessionDate", 
    "timeOnline", 
    "timeBooked", 
    "distanceOnline", 
    "distanceBooked", 
    "totalAmount", 
    "notes"
  ],
  expenses: [
    "vehicleId", 
    "expenseType", 
    "date", 
    "amount", 
    "description"
  ],
  vehicles: [
    "make", 
    "model", 
    "year", 
    "licensePlate", 
    "color", 
    "nickname"
  ]
};

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
    const confirm = formData.get("confirm") as string;

    // Validate file and type
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!type || !["rides", "expenses", "vehicles"].includes(type)) {
      return NextResponse.json({ message: "Invalid import type" }, { status: 400 });
    }

    // Check if this is a confirmed import
    if (!confirm || confirm !== "true") {
      return NextResponse.json({ message: "Import not confirmed" }, { status: 400 });
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
      // For now, only support CSV and JSON
      return NextResponse.json({ message: "Only CSV and JSON formats are currently supported" }, { status: 400 });
    }

    // Validate and import data
    const template = templates[type as keyof typeof templates];
    const results = {
      totalRecords: data.length,
      imported: 0,
      failed: 0,
      errors: [] as { row: number; message: string }[]
    };

    // Process each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      try {
        // Basic validation
        let isValid = true;
        const recordKeys = Object.keys(record);

        // Check required fields
        for (const field of template) {
          if (!recordKeys.includes(field)) {
            isValid = false;
            results.errors.push({
              row: i,
              message: `Missing required field: ${field}`
            });
            break;
          }
        }

        if (!isValid) {
          results.failed++;
          continue;
        }

        // Process based on type
        if (type === "rides") {
          // Format ride data
          const rideData = {
            vehicleId: record.vehicleId,
            rideType: record.rideType as "uber" | "lyft" | "other",
            sessionDate: new Date(record.sessionDate),
            timeOnline: String(record.timeOnline),
            timeBooked: String(record.timeBooked),
            distanceOnline: record.distanceOnline ? String(record.distanceOnline) : undefined,
            distanceBooked: record.distanceBooked ? String(record.distanceBooked) : undefined,
            totalAmount: String(record.totalAmount),
            notes: record.notes || ""
          };

          // Create ride
          const result = await createRideAction(rideData);
          if (result.status === "error") {
            throw new Error(result.message);
          }
          
          results.imported++;

        } else if (type === "expenses") {
          // Format expense data
          const expenseData = {
            vehicleId: record.vehicleId,
            expenseType: record.expenseType as "fuel" | "maintenance" | "insurance" | "car_payment" | "cleaning" | "parking" | "tolls" | "other",
            date: new Date(record.date),
            amount: String(record.amount),
            description: record.description || ""
          };

          // Create expense
          const result = await createExpenseAction(expenseData);
          if (result.status === "error") {
            throw new Error(result.message);
          }
          
          results.imported++;

        } else if (type === "vehicles") {
          // Format vehicle data
          const vehicleData = {
            make: record.make,
            model: record.model,
            year: Number(record.year),
            licensePlate: record.licensePlate || "",
            color: record.color || "",
            nickname: record.nickname || "",
            isActive: 1
          };

          // Create vehicle
          const result = await createVehicleAction(vehicleData);
          if (result.status === "error") {
            throw new Error(result.message);
          }
          
          results.imported++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i,
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Return results
    return NextResponse.json({
      message: "Import completed",
      imported: results.imported,
      failed: results.failed,
      errors: results.errors.slice(0, 20) // Limit errors to first 20
    });

  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error importing data" },
      { status: 500 }
    );
  }
} 