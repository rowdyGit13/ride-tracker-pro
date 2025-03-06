"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateRangePicker({ dateRange, setDateRange }: DateRangePickerProps) {
  // State to track if we're selecting the start or end date
  const [selectingMode, setSelectingMode] = React.useState<'start' | 'end'>('start');
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(dateRange);
  
  // Predefined date ranges
  const handlePredefinedRange = (value: string) => {
    const today = new Date();
    
    switch (value) {
      case "last-month":
        setDateRange({
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1))
        });
        break;
      case "last-3-months":
        setDateRange({
          from: startOfMonth(subMonths(today, 2)),
          to: today
        });
        break;
      case "last-6-months":
        setDateRange({
          from: startOfMonth(subMonths(today, 5)),
          to: today
        });
        break;
      case "last-year":
        setDateRange({
          from: startOfMonth(subMonths(today, 11)),
          to: today
        });
        break;
      case "all-time":
        // For all time, set to undefined to show all data
        setDateRange(undefined);
        break;
    }
    
    // Debug log the selected range
    console.log("Date range selected:", value, dateRange);
  };

  // Custom date selection handler
  const handleSelect = (range: DateRange | undefined) => {
    setTempRange(range);
    
    // Switch mode to end date selection after selecting start date
    if (range?.from && !range.to && selectingMode === 'start') {
      setSelectingMode('end');
    }
    
  };

  // Reset the selection
  const resetSelection = () => {
    setTempRange(undefined);
    setSelectingMode('start');
  };

  // Apply the current selection
  const applySelection = () => {
    if (tempRange?.from) {
      setDateRange(tempRange);
      setPopoverOpen(false);
      setSelectingMode('start'); // Reset for next time
    }
  };

  // Reset button in the popover
  const ResetButton = () => (
    <div className="p-3 border-t border-gray-200 flex justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={resetSelection}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4 mr-2" />
        Reset
      </Button>
      
      <Button
        variant="default"
        size="sm"
        onClick={applySelection}
        disabled={!tempRange?.from}
      >
        Apply
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <Select onValueChange={handlePredefinedRange} defaultValue="last-3-months">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          <SelectItem value="last-6-months">Last 6 Months</SelectItem>
          <SelectItem value="last-year">Last Year</SelectItem>
          <SelectItem value="all-time">All Time</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid gap-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b border-gray-200">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Select Date Range</h4>
                <p className="text-xs text-gray-500">
                  {selectingMode === 'start' ? 'Select start date' : 'Select end date'}
                </p>
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tempRange?.from || dateRange?.from || new Date()}
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
            <ResetButton />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 