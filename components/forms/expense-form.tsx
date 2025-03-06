"use client";

import { createExpenseAction, updateExpenseAction } from "@/actions/expenses-actions";
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
import { SelectExpense } from "@/db/schema/expenses-schema";
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

const expenseFormSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  expenseType: z.enum(["fuel", "maintenance", "insurance", "car_payment", "cleaning", "parking", "tolls", "other"], {
    required_error: "Expense type is required",
  }),
  amount: z.coerce.number().min(0.01, "Amount is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  initialData?: SelectExpense;
  closeDialog?: () => void;
}

export function ExpenseForm({ initialData, closeDialog }: ExpenseFormProps) {
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

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData ? {
      vehicleId: initialData.vehicleId,
      expenseType: initialData.expenseType,
      amount: Number(initialData.amount),
      date: new Date(initialData.date),
      description: initialData.description || "",
    } : {
      vehicleId: "",
      expenseType: "fuel",
      amount: 0,
      date: new Date(),
      description: "",
    }
  });

  async function onSubmit(values: ExpenseFormValues) {
    setIsLoading(true);
    try {
      // Convert numeric values to strings for database compatibility
      const formattedValues = {
        ...values,
        amount: String(values.amount)
      };

      if (initialData) {
        // Update existing expense
        const result = await updateExpenseAction(initialData.id, formattedValues);
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
          description: "Expense updated successfully"
        });
      } else {
        // Create new expense
        const result = await createExpenseAction(formattedValues);
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
          description: "Expense created successfully"
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
            name="expenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="car_payment">Car Payment</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="tolls">Tolls</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about this expense" {...field} />
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
            {isLoading ? "Saving..." : initialData ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 