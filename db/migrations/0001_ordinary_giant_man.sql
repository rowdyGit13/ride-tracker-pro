CREATE TYPE "public"."ride_status" AS ENUM('completed', 'canceled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."ride_type" AS ENUM('uber', 'lyft', 'other');--> statement-breakpoint
CREATE TYPE "public"."expense_type" AS ENUM('fuel', 'maintenance', 'insurance', 'car_payment', 'cleaning', 'parking', 'tolls', 'other');--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"license_plate" text,
	"color" text,
	"nickname" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"ride_type" "ride_type" NOT NULL,
	"ride_status" "ride_status" DEFAULT 'completed' NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"pickup_location" text,
	"dropoff_location" text,
	"distance" numeric,
	"fare_amount" numeric NOT NULL,
	"tip_amount" numeric DEFAULT '0',
	"total_amount" numeric NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"expense_type" "expense_type" NOT NULL,
	"amount" numeric NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"receipt_url" text,
	"is_tax_deductible" text DEFAULT 'yes',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
