import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRideAction } from "@/actions/rides-actions";
import { createExpenseAction } from "@/actions/expenses-actions";
import { createVehicleAction } from "@/actions/vehicles-actions";
import { getVehicleByNickname, getVehicleByDetails } from "@/db/queries/vehicles-queries";
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

    // Validate file and type
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!type || !["rides", "expenses", "vehicles"].includes(type)) {
      return NextResponse.json({ message: "Invalid import type" }, { status: 400 });
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

    if (type === "vehicles") {
      // Process vehicles
      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          
          // Check if required fields exist
          if (!record.make || !record.model || !record.year || !record.nickname) {
            results.failed++;
            results.errors.push({
              row: i,
              message: "Missing required fields (make, model, year, or nickname)"
            });
            continue;
          }

          // Create vehicle
          const vehicleData = {
            make: record.make,
            model: record.model,
            year: parseInt(record.year),
            color: record.color || "",
            nickname: record.nickname,
            isActive: 1
          };

          const result = await createVehicleAction(vehicleData);
          if (result.status === "error") {
            results.failed++;
            results.errors.push({
              row: i,
              message: result.message || "Failed to create vehicle"
            });
          } else {
            results.success++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    } else if (type === "rides") {
      // Process rides
      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          
          // Find or create vehicle by nickname
          if (!record.vehicleNickname) {
            results.failed++;
            results.errors.push({
              row: i,
              message: "Missing vehicle nickname"
            });
            continue;
          }
          
          // Find vehicle by nickname
          const vehicle = await getVehicleByNickname(userId, record.vehicleNickname);
          if (!vehicle) {
            results.failed++;
            results.errors.push({
              row: i,
              message: `Vehicle with nickname "${record.vehicleNickname}" not found`
            });
            continue;
          }
          
          // Create ride with found vehicle ID
          const rideData = {
            vehicleId: vehicle.id,
            rideType: record.rideType || "other",
            sessionDate: record.sessionDate,
            timeOnline: String(parseFloat(record.timeOnline) || 0),
            timeBooked: String(parseFloat(record.timeBooked) || 0),
            distanceOnline: String(parseFloat(record.distanceOnline) || 0),
            distanceBooked: String(parseFloat(record.distanceBooked) || 0),
            totalAmount: String(parseFloat(record.totalAmount) || 0),
            notes: record.notes || ""
          };

          const result = await createRideAction(rideData);
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
          results.failed++;
          results.errors.push({
            row: i,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    } else if (type === "expenses") {
      // Process expenses
      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          
          // Find vehicle by nickname
          if (!record.vehicleNickname) {
            results.failed++;
            results.errors.push({
              row: i,
              message: "Missing vehicle nickname"
            });
            continue;
          }
          
          const vehicle = await getVehicleByNickname(userId, record.vehicleNickname);
          if (!vehicle) {
            results.failed++;
            results.errors.push({
              row: i,
              message: `Vehicle with nickname "${record.vehicleNickname}" not found`
            });
            continue;
          }
          
          // Create expense with found vehicle ID
          const expenseData = {
            vehicleId: vehicle.id,
            expenseType: record.expenseType || "other",
            date: record.date,
            amount: String(parseFloat(record.amount) || 0),
            description: record.description || ""
          };

          const result = await createExpenseAction(expenseData);
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
      results
    });

  } catch (error) {
    console.error("Error processing import:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error processing import" },
      { status: 500 }
    );
  }
}