"use client";

import { createVehicleAction, updateVehicleAction } from "@/actions/vehicles-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectVehicle } from "@/db/schema/vehicles-schema";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(1900, "Year must be at least 1900").max(new Date().getFullYear() + 1, `Year must be at most ${new Date().getFullYear() + 1}`),
  color: z.string().optional(),
  nickname: z.string().optional(),
  isActive: z.coerce.number().default(1)
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  initialData?: SelectVehicle;
  closeDialog?: () => void;
}

export function VehicleForm({ initialData, closeDialog }: VehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialData ? {
      make: initialData.make,
      model: initialData.model,
      year: initialData.year,
      color: initialData.color || "",
      nickname: initialData.nickname || "",
      isActive: initialData.isActive
    } : {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      nickname: "",
      isActive: 1
    }
  });

  async function onSubmit(values: VehicleFormValues) {
    setIsLoading(true);
    console.log("Submitting vehicle form with values:", values);
    try {
      if (initialData) {
        // Update existing vehicle
        const result = await updateVehicleAction(initialData.id, values);
        if (result.status === "error") {
          console.error("Vehicle update error:", result);
          toast({
            title: "Error",
            description: result.message || "Failed to update vehicle",
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Success",
          description: "Vehicle updated successfully"
        });
      } else {
        // Create new vehicle
        console.log("Creating new vehicle with data:", values);
        const result = await createVehicleAction(values);
        console.log("Vehicle creation result:", result);
        if (result.status === "error") {
          toast({
            title: "Error",
            description: result.message || "Failed to create vehicle",
            variant: "destructive"
          });
          console.error("Vehicle creation error details:", result);
          return;
        }
        toast({
          title: "Success",
          description: "Vehicle created successfully"
        });
        form.reset();
      }

      if (closeDialog) {
        closeDialog();
      } else {
        router.push("/forms");
      }
    } catch (error) {
      console.error("Vehicle form submission error:", error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null ? JSON.stringify(error) : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="Camry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname</FormLabel>
                <FormControl>
                  <Input placeholder="My Ride" {...field} />
                </FormControl>
                <FormDescription>
                  Optional nickname for your vehicle
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog || (() => router.back())}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Vehicle" : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 