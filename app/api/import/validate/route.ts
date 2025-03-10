import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getVehicleById } from "@/db/queries/vehicles-queries";
import { parse as csvParse } from "csv-parse/sync";

// Templates structure for validation - remove vehicleId and vehicles template
const templates = {
  rides: [
    "rideType", // Must be one of: "uber", "lyft", "other"
    "sessionDate", // Date format: YYYY-MM-DD or MM/DD/YYYY
    "timeOnline", // Numeric value in hours (e.g., 5.5)
    "timeBooked", // Numeric value in hours (e.g., 4.2)
    "distanceOnline", // Numeric value in miles (e.g., 120)
    "distanceBooked", // Numeric value in miles (e.g., 95)
    "totalAmount", // Numeric value in dollars (e.g., 180.50)
    "notes" // Optional text
  ],
  expenses: [
    "expenseType", // Must be one of: "fuel", "maintenance", "insurance", "car_payment", "cleaning", "parking", "tolls", "other"
    "date", // Date format: YYYY-MM-DD or MM/DD/YYYY
    "amount", // Numeric value in dollars (e.g., 45.75)
    "description" // Optional text
  ]
  // vehicles template removed completely
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
    const vehicleId = formData.get("vehicleId") as string;

    // Validate file and type
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!type || !["rides", "expenses"].includes(type)) {
      return NextResponse.json({ message: "Invalid import type" }, { status: 400 });
    }

    // Validate vehicle exists and belongs to user
    if (!vehicleId) {
      return NextResponse.json({ message: "Vehicle ID is required" }, { status: 400 });
    }

    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 400 });
    }

    if (vehicle.userId !== userId) {
      return NextResponse.json({ message: "Unauthorized - Vehicle does not belong to user" }, { status: 401 });
    }

    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !["csv", "xlsx", "json"].includes(fileExt)) {
      return NextResponse.json({ message: "Unsupported file format" }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    let data: any[] = [];

    // Parse file based on format
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

    // Validate data against template
    const template = templates[type as keyof typeof templates];
    const headers = template;
    
    // Check if data is empty
    if (data.length === 0) {
      return NextResponse.json({ message: "No data found in the file" }, { status: 400 });
    }

    // Validate each record
    const errors: { row: number; column: string; message: string }[] = [];
    let validRows = 0;
    let invalidRows = 0;

    data.forEach((record, index) => {
      let isValid = true;
      const recordKeys = Object.keys(record);

      // Check required fields
      template.forEach(field => {
        if (!recordKeys.includes(field)) {
          errors.push({
            row: index,
            column: field,
            message: `Missing required field: ${field}`
          });
          isValid = false;
        }
      });

      // Validate specific fields based on import type
      if (type === "rides") {
        // Validate ride data
        if (record.rideType && !["uber", "lyft", "other"].includes(record.rideType)) {
          errors.push({
            row: index,
            column: "rideType",
            message: "Ride type must be one of: uber, lyft, other"
          });
          isValid = false;
        }

        const dateFields = ["sessionDate"];
        dateFields.forEach(field => {
          if (record[field] && isNaN(Date.parse(record[field]))) {
            errors.push({
              row: index,
              column: field,
              message: "Invalid date format"
            });
            isValid = false;
          }
        });

        const numericFields = ["timeOnline", "timeBooked", "distanceOnline", "distanceBooked", "totalAmount"];
        numericFields.forEach(field => {
          if (record[field] && isNaN(Number(record[field]))) {
            errors.push({
              row: index,
              column: field,
              message: "Must be a valid number"
            });
            isValid = false;
          }
        });
      } else if (type === "expenses") {
        // Validate expense data
        const validExpenseTypes = ["fuel", "maintenance", "insurance", "car_payment", "cleaning", "parking", "tolls", "other"];
        if (record.expenseType && !validExpenseTypes.includes(record.expenseType)) {
          errors.push({
            row: index,
            column: "expenseType",
            message: `Expense type must be one of: ${validExpenseTypes.join(", ")}`
          });
          isValid = false;
        }

        if (record.date && isNaN(Date.parse(record.date))) {
          errors.push({
            row: index,
            column: "date",
            message: "Invalid date format"
          });
          isValid = false;
        }

        if (record.amount && isNaN(Number(record.amount))) {
          errors.push({
            row: index,
            column: "amount",
            message: "Amount must be a valid number"
          });
          isValid = false;
        }
      }

      if (isValid) {
        validRows++;
      } else {
        invalidRows++;
      }
    });

    // Format the response
    return NextResponse.json({
      message: "File validated",
      data: {
        headers,
        rows: data.slice(0, 10), // Limit preview to first 10 rows
        validRows,
        invalidRows,
        errors: errors.slice(0, 20) // Limit errors to first 20
      }
    });

  } catch (error) {
    console.error("Error validating import file:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error validating file" },
      { status: 500 }
    );
  }
} 