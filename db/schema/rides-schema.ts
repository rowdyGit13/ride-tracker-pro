import { pgEnum, pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const rideTypeEnum = pgEnum("ride_type", ["uber", "lyft", "other"]);
export const rideStatusEnum = pgEnum("ride_status", ["completed", "canceled", "no_show"]);

export const ridesTable = pgTable("rides", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  rideType: rideTypeEnum("ride_type").notNull(),
  rideStatus: rideStatusEnum("ride_status").default("completed").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  pickupLocation: text("pickup_location"),
  dropoffLocation: text("dropoff_location"),
  distance: numeric("distance"),
  fareAmount: numeric("fare_amount").notNull(),
  tipAmount: numeric("tip_amount").default("0"),
  totalAmount: numeric("total_amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertRide = typeof ridesTable.$inferInsert;
export type SelectRide = typeof ridesTable.$inferSelect; 