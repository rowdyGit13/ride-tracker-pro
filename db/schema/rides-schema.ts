import { pgEnum, pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const rideTypeEnum = pgEnum("ride_type", ["uber", "lyft", "other"]);

export const ridesTable = pgTable("rides", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  rideType: rideTypeEnum("ride_type").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  timeOnline: numeric("time_online").notNull(), // Hours online
  timeBooked: numeric("time_booked").notNull(), // Hours booked
  distanceOnline: numeric("distance_online"), // Miles driven while online
  distanceBooked: numeric("distance_booked"), // Miles driven while booked
  totalAmount: numeric("total_amount").notNull(), // Total earnings for the session
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertRide = typeof ridesTable.$inferInsert;
export type SelectRide = typeof ridesTable.$inferSelect; 