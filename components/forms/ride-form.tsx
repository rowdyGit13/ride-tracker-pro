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
  sessionDate: z.date({
    required_error: "Session date is required",
  }),
  timeOnline: z.coerce.number().min(0, "Time online is required"),
  timeBooked: z.coerce.number().min(0, "Time booked is required"),
  distanceOnline: z.coerce.number().min(0).optional(),
  distanceBooked: z.coerce.number().min(0).optional(),
  totalAmount: z.coerce.number().min(0, "Total earnings is required"),
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
      sessionDate: new Date(initialData.sessionDate),
      timeOnline: Number(initialData.timeOnline),
      timeBooked: Number(initialData.timeBooked),
      distanceOnline: initialData.distanceOnline ? Number(initialData.distanceOnline) : undefined,
      distanceBooked: initialData.distanceBooked ? Number(initialData.distanceBooked) : undefined,
      totalAmount: Number(initialData.totalAmount),
      notes: initialData.notes || "",
    } : {
      vehicleId: "",
      rideType: "uber",
      sessionDate: new Date(),
      timeOnline: 0,
      timeBooked: 0,
      distanceOnline: undefined,
      distanceBooked: undefined,
      totalAmount: 0,
      notes: "",
    }
  });

  async function onSubmit(values: RideFormValues) {
    setIsLoading(true);
    try {
      // Convert numeric values to strings for database compatibility
      const formattedValues = {
        ...values,
        timeOnline: String(values.timeOnline),
        timeBooked: String(values.timeBooked),
        distanceOnline: values.distanceOnline !== undefined ? String(values.distanceOnline) : undefined,
        distanceBooked: values.distanceBooked !== undefined ? String(values.distanceBooked) : undefined,
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
          description: "Driving session updated successfully"
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
          description: "Driving session created successfully"
        });
        form.reset();
      }

      if (closeDialog) {
        closeDialog();
      } else {
        router.push("/forms");
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
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
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
            name="sessionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Session Date</FormLabel>
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
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
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
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeOnline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Online (hours)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Total hours spent online
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeBooked"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Booked (hours)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Hours spent with passengers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distanceOnline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance Online (miles)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    placeholder="0.0" 
                    {...field} 
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Total miles driven while online
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distanceBooked"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance Booked (miles)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    placeholder="0.0" 
                    {...field} 
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Miles driven with passengers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Earnings ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Total earnings for this session
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
                <Textarea
                  placeholder="Add any additional notes here..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/forms")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : initialData ? "Update Session" : "Add Session"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 