import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  disabledDays?: Date[];
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  fromDate,
  toDate,
  disabledDays,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value ? format(value, "PPP") : ""}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pr-10", className)}
            readOnly
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          disabled={disabledDays}
          fromDate={fromDate}
          toDate={toDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  disabledDays?: Date[];
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled = false,
  className,
  fromDate,
  toDate,
  disabledDays,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "HH:mm") : "00:00"
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }

    const [hours, minutes] = timeValue.split(":");
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    onChange?.(newDate);
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (value) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(value);
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      onChange?.(newDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value ? format(value, "PPP 'at' p") : ""}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pr-10", className)}
            readOnly
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            fromDate={fromDate}
            toDate={toDate}
            initialFocus
          />
          <div className="border-t pt-3">
            <label className="text-sm font-medium mb-2 block">Time</label>
            <input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface DatePickerWithRangeProps {
  className?: string;
  from?: Date;
  to?: Date;
  onSelect?: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  from,
  to,
  onSelect,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from || new Date(),
    to: to || addDays(new Date(), 7),
  });

  React.useEffect(() => {
    if (from !== undefined && to !== undefined) {
      setDate({ from, to });
    }
  }, [from, to]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    onSelect?.(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      setOpen(false);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={
                date?.from
                  ? date.to
                    ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                    : format(date.from, "LLL dd, y")
                  : ""
              }
              placeholder="Pick a date range"
              className={cn("w-[300px] pr-10", className)}
              readOnly
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600"
              onClick={() => setOpen(true)}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}