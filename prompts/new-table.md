# New Table Instructions

Follow these instructions to create a new table in the database.

## Guidelines

- User ids should be like this `userID: text("user_id").notNull()` because we are using Clerk for authentication.

## Step 1: Create the Schema

This is an example of how to create a new table in the database.

This file should be named like `profiles-schema.ts`

This file should be in the `db/schema` folder.

Make sure to export the `profiles-schema.ts` file in the `db/schema/index.ts` file.

Make sure to add the table to the `schema` object in the `db/db.ts` file.

```typescript
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const membershipEnum = pgEnum("membership", ["free", "pro"]);

export const profilesTable = pgTable("profiles", {
  userID: text("user_id").primaryKey(),
  membership: membershipEnum("membership").default("free").notNull(),
  stripeCustomerID: text("stripe_customer_id"),
  stripeSubscriptionID: text("stripe_subscription_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
```

## Step 2: Create the queries

This is an example of how to create the queries for the table.

This file should be named like `profiles-queries.ts`

This file should be in the `db/queries` folder.

```typescript
import { eq } from "drizzle-orm";
import { db } from "../db";
import { profilesTable, InsertProfile, SelectProfile } from "../schema/profiles-schema";

export const createProfile = async (data: InsertProfile) => {
    try{
        const [newProfile] = await db.insert(profilesTable).values(data).returning();
        return newProfile;
    } catch (error) {
        console.error("Error creating profile:", error);
        throw new Error("Failed to create profile");
    }
};

export const getProfileByUserId = async (userID: string) => {
    try {
      const profile = await db.query.profiles.findFirst({
        where: eq(profilesTable.userID, userID)
      });
  
      return profile;
    } catch (error) {
      console.error("Error getting profile by user ID:", error);
      throw new Error("Failed to get profile");
    }
  };
  
  export const getAllProfiles = async (): Promise<SelectProfile[]> => {
    return db.query.profiles.findMany();
  };

  export const updateProfile = async (userID: string, data: Partial<InsertProfile>) => {
    try {
      const [updatedProfile] = await db.update(profilesTable).set(data).where(eq(profilesTable.userID, userID)).returning();
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }
  };

  export const updateProfileByStripeCustomerId = async (stripeCustomerID: string, data: Partial<InsertProfile>) => {
    try {
      const [updatedProfile] = await db.update(profilesTable).set(data).where(eq(profilesTable.stripeCustomerID, stripeCustomerID)).returning();
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile by stripe customer ID:", error);
      throw new Error("Failed to update profile");
    }
  };
  
  export const deleteProfile = async (userID: string) => {
    try {
      await db.delete(profilesTable).where(eq(profilesTable.userID, userID));
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw new Error("Failed to delete profile");
    }
  };
```

## Step 3: Create the server actions

This is an example of how to create the server actions for the table.

This file should be named like `profiles-actions.ts`

This file should be in the `actions` folder.

```typescript
"use server";

import { createProfile, deleteProfile, getAllProfiles, getProfileByUserId, updateProfile } from "@/db/queries/profiles-queries";
import { InsertProfile } from "@/db/schema/profiles-schema";
import { ActionState } from "@/types/actions/action-types";
import console from "console";
import { revalidatePath } from "next/cache";

export async function createProfileAction(data: InsertProfile): Promise<ActionState> {
  try {
    const newProfile = await createProfile(data);
    console.log("New profile created", newProfile);
    revalidatePath("/");
    return { status: "success", message: "Profile created successfully", data: newProfile };
  } catch (error) {
    return { status: "error", message: "Error creating profile" };
  }
}

export async function getProfileByUserIdAction(userId: string): Promise<ActionState> {
  try {
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return { status: "error", message: "Profile not found" };
    }
    return { status: "success", message: "Profile retrieved successfully", data: profile };
  } catch (error) {
    return { status: "error", message: "Failed to get profile" };
  }
}

export async function getAllProfilesAction(): Promise<ActionState> {
  try {
    const profiles = await getAllProfiles();
    return { status: "success", message: "Profiles retrieved successfully", data: profiles };
  } catch (error) {
    return { status: "error", message: "Failed to get profiles" };
  }
}

export async function updateProfileAction(userId: string, data: Partial<InsertProfile>): Promise<ActionState> {
  try {
    const updatedProfile = await updateProfile(userId, data);
    revalidatePath("/profile");
    return { status: "success", message: "Profile updated successfully", data: updatedProfile };
  } catch (error) {
    return { status: "error", message: "Failed to update profile" };
  }
}

export async function deleteProfileAction(userId: string): Promise<ActionState> {
  try {
    await deleteProfile(userId);
    revalidatePath("/profile");
    return { status: "success", message: "Profile deleted successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to delete profile" };
  }
}
```

## Step 4: Generate the SQL file and migrate the database

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```



