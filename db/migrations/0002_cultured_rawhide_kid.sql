ALTER TABLE "rides" ADD COLUMN "session_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "time_online" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "time_booked" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "distance_online" numeric;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "distance_booked" numeric;--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "ride_status";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "pickup_location";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "dropoff_location";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "distance";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "fare_amount";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "tip_amount";--> statement-breakpoint
DROP TYPE "public"."ride_status";