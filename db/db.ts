import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
//import { notesTable } from "./schema";
import { profilesTable } from "./schema/profiles-schema";
import { vehiclesTable } from "./schema/vehicles-schema";
import { ridesTable } from "./schema/rides-schema";
import { expensesTable } from "./schema/expenses-schema";

config({ path: ".env.local" });

const schema = {
  profiles: profilesTable,
  vehicles: vehiclesTable,
  rides: ridesTable,
  expenses: expensesTable
  //notes: notesTable
};

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });