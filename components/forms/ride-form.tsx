"use client";

import { createRideAction, updateRideAction } from "@/actions/rides-actions";
import { getVehiclesByUserIdAction } from "@/actions/vehicles-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SelectRide } from "@/db/schema/rides-schema";
import { SelectVehicle } from "@/db/schema/vehicles-schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const rideFormSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  rideType: z.enum(["uber", "lyft", "other"], {
    required_error: "Ride type is required",
  }),
  rideStatus: z.enum(["completed", "canceled", "no_show"], {
    required_error: "Ride status is required",
  }).default("completed"),
  startTime: z.date({
    required_error: "Start time is required",
  }),
  endTime: z.date().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  distance: z.coerce.number().min(0).optional(),
  fareAmount: z.coerce.number().min(0, "Fare amount is required"),
  tipAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0, "Total amount is required"),
  notes: z.string().optional(),
});

type RideFormValues = z.infer<typeof rideFormSchema>;

interface RideFormProps {
  initialData?: SelectRide;
  closeDialog?: () => void;
}

export function RideForm({ initialData, closeDialog }: RideFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<SelectVehicle[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      const result = await getVehiclesByUserIdAction();
      if (result.status === "success" && result.data) {
        setVehicles(result.data);
      }
    };
    fetchVehicles();
  }, []);

  const form = useForm<RideFormValues>({
    resolver: zodResolver(rideFormSchema),
    defaultValues: initialData ? {
      vehicleId: initialData.vehicleId,
      rideType: initialData.rideType,
      rideStatus: initialData.rideStatus,
      startTime: new Date(initialData.startTime),
      endTime: initialData.endTime ? new Date(initialData.endTime) : undefined,
      pickupLocation: initialData.pickupLocation || "",
      dropoffLocation: initialData.dropoffLocation || "",
      distance: initialData.distance ? Number(initialData.distance) : undefined,
      fareAmount: Number(initialData.fareAmount),
      tipAmount: Number(initialData.tipAmount),
      totalAmount: Number(initialData.totalAmount),
      notes: initialData.notes || "",
    } : {
      vehicleId: "",
      rideType: "uber",
      rideStatus: "completed",
      startTime: new Date(),
      endTime: undefined,
      pickupLocation: "",
      dropoffLocation: "",
      distance: undefined,
      fareAmount: 0,
      tipAmount: 0,
      totalAmount: 0,
      notes: "",
    }
  });

  // Calculate total amount when fare or tip changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "fareAmount" || name === "tipAmount") {
        const fare = value.fareAmount || 0;
        const tip = value.tipAmount || 0;
        form.setValue("totalAmount", Number(fare) + Number(tip));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: RideFormValues) {
    setIsLoading(true);
    try {
      // Convert numeric values to strings for database compatibility
      const formattedValues = {
        ...values,
        distance: values.distance !== undefined ? String(values.distance) : undefined,
        fareAmount: String(values.fareAmount),
        tipAmount: String(values.tipAmount),
        totalAmount: String(values.totalAmount)
      };

      if (initialData) {
        // Update existing ride
        const result = await updateRideAction(initialData.id, formattedValues);
        if (result.status === "error") {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Success",
          description: "Ride updated successfully"
        });
      } else {
        // Create new ride
        const result = await createRideAction(formattedValues);
        if (result.status === "error") {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Success",
          description: "Ride created successfully"
        });
        form.reset();
      }

      if (closeDialog) {
        closeDialog();
      } else {
        router.push("/dashboard/rides");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rideType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ride Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ride type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="uber">Uber</SelectItem>
                    <SelectItem value="lyft">Lyft</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rideStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ride Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ride status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          if (!field.value) return;
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>Optional end time</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dropoff Location</FormLabel>
                <FormControl>
                  <Input placeholder="456 Oak Ave" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (miles)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fareAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fare Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tip Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} readOnly />
                </FormControl>
                <FormDescription>
                  Automatically calculated from fare and tip
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about this ride" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            {isLoading ? "Saving..." : initialData ? "Update Ride" : "Add Ride"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 