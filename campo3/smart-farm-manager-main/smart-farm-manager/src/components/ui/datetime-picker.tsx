"use client";

import { FC, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

type Mode = "date" | "time" | "datetime";

export type DateTimePickerProps = {
  mode?: Mode; // 'date' | 'time' | 'datetime'
  value: Date | null; // controlled value
  onChange: (d: Date | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  isPopoverModal?: boolean;

  // Time grid options
  minuteStep?: number;
  hourStart?: number;
  hourEnd?: number;
  timePickerMaxMinLimit?: boolean;

  // Date bounds / disabling
  minDate?: Date | null;
  maxDate?: Date | null;
  disabledDate?: (d: Date) => boolean;

  // UI classes
  className?: string; // popover content
  buttonClassName?: string; // trigger button
};

export const DateTimePicker: FC<DateTimePickerProps> = ({
  mode = "datetime",
  value,
  onChange,
  placeholder = mode === "time"
    ? "HH:mm"
    : mode === "date"
    ? "Pick a date"
    : "Pick date & time",
  label,
  required,
  disabled,
  minuteStep = 5,
  hourStart = 0,
  hourEnd = 23,
  timePickerMaxMinLimit = true,
  minDate,
  maxDate,
  disabledDate,
  className,
  buttonClassName,
  isPopoverModal = false, // if true, popover behaves like a modal (closes on outside click or Escape key)
}) => {
  const [open, setOpen] = useState(false);

  const formatBtn = useMemo(() => {
    if (!value) return "";
    if (mode === "date") return dayjs(value).format("MMM D, YYYY");
    if (mode === "time") return dayjs(value).format("HH:mm");
    return `${dayjs(value).format("MMM D, YYYY")} • ${dayjs(value).format(
      "HH:mm"
    )}`;
  }, [value, mode]);

  // ----- mutations -----
  const setDateOnly = (picked?: Date) => {
    if (!picked) return onChange(null);
    if (mode === "date") {
      // pure date mode: normalize to start of day
      return onChange(dayjs(picked).startOf("day").toDate());
    }
    // preserve time portion if present
    const base = value ?? picked;
    const next = dayjs(picked)
      .hour(dayjs(base).hour())
      .minute(dayjs(base).minute())
      .second(0)
      .millisecond(0)
      .toDate();
    onChange(next);
  };

  const setHour = (hour: number) => {
    const base = value ?? new Date();
    const next = dayjs(base).hour(hour).second(0).millisecond(0).toDate();
    onChange(next);
  };

  const setMinute = (minute: number) => {
    const base = value ?? new Date();
    const next = dayjs(base).minute(minute).second(0).millisecond(0).toDate();
    onChange(next);
  };

  const clear = () => onChange(null);

  // ----- derived state -----
  const selectedHour = value ? dayjs(value).hour() : null;
  const selectedMinute = value ? dayjs(value).minute() : null;

  // Helper function to check if hour/minute should be disabled based on min/max dates
  const isTimeDisabled = useMemo(() => {
    const currentDate = value ? dayjs(value).startOf("day") : null;
    const minDateTime = minDate ? dayjs(minDate) : null;
    const maxDateTime = maxDate ? dayjs(maxDate) : null;

    return {
      isHourDisabled: (hour: number) => {
        if (!currentDate) return false;

        // If current date is the same as min date, disable hours before min hour
        if (
          minDateTime &&
          currentDate.isSame(minDateTime.startOf("day"), "day")
        ) {
          if (hour < minDateTime.hour()) return true;
        }

        // If current date is the same as max date, disable hours after max hour
        if (
          maxDateTime &&
          currentDate.isSame(maxDateTime.startOf("day"), "day")
        ) {
          if (hour > maxDateTime.hour()) return true;
        }

        return false;
      },

      isMinuteDisabled: (minute: number) => {
        if (!currentDate || selectedHour === null) return false;

        // If current date and hour match min date/hour, disable minutes before min minute
        if (
          minDateTime &&
          currentDate.isSame(minDateTime.startOf("day"), "day")
        ) {
          if (
            selectedHour === minDateTime.hour() &&
            minute < minDateTime.minute()
          ) {
            return true;
          }
        }

        // If current date and hour match max date/hour, disable minutes after max minute
        if (
          maxDateTime &&
          currentDate.isSame(maxDateTime.startOf("day"), "day")
        ) {
          if (
            selectedHour === maxDateTime.hour() &&
            minute > maxDateTime.minute()
          ) {
            return true;
          }
        }

        return false;
      },
    };
  }, [value, minDate, maxDate, selectedHour]);

  // build hours and minutes lists
  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = hourStart; h <= hourEnd; h++) arr.push(h);
    return arr;
  }, [hourStart, hourEnd]);

  const minutes = useMemo(() => {
    const step = Math.max(1, Math.min(30, minuteStep));
    const arr: number[] = [];
    for (let m = 0; m < 60; m += step) arr.push(m);
    return arr;
  }, [minuteStep]);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label ? (
        <label className="text-sm font-medium">
          {label} {required && "*"}
        </label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen} modal={isPopoverModal}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            data-empty={!value}
            className={cn(
              "w-full justify-start text-left font-normal",
              "data-[empty=true]:text-muted-foreground",
              buttonClassName
            )}
            aria-required={required}
          >
            {value ? formatBtn : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent className={cn("w-auto p-0", className)}>
          <div className={cn("sm:flex", mode === "time" ? "block" : "")}>
            {/* Calendar (hidden in time-only mode) */}
            {mode !== "time" && (
              <Calendar
                mode="single"
                selected={value ?? undefined}
                onSelect={setDateOnly}
                autoFocus
                disabled={(d) =>
                  (typeof disabledDate === "function" && disabledDate(d)) ||
                  (minDate && d < dayjs(minDate).startOf("day").toDate()) ||
                  (maxDate && d > dayjs(maxDate).endOf("day").toDate()) ||
                  false
                }
              />
            )}

            {/* Time grids (hidden in date-only mode) */}
            {mode !== "date" && (
              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x"
                )}
              >
                {/* Hours */}
                <ScrollArea className="w-64 sm:w-auto overflow-auto">
                  <div className="flex sm:flex-col p-2">
                    {hours.map((hour) => {
                      const active = selectedHour === hour;
                      const disabled =
                        timePickerMaxMinLimit &&
                        isTimeDisabled.isHourDisabled(hour);
                      return (
                        <Button
                          key={hour}
                          size="icon"
                          variant={active ? "default" : "ghost"}
                          className={cn(
                            "sm:w-full shrink-0 aspect-square",
                            disabled && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => !disabled && setHour(hour)}
                          disabled={disabled}
                        >
                          {hour.toString().padStart(2, "0")}
                        </Button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>

                {/* Minutes */}
                <ScrollArea className="w-64 sm:w-auto overflow-auto">
                  <div className="flex sm:flex-col p-2">
                    {minutes.map((minute) => {
                      const active = selectedMinute === minute;
                      const disabled = isTimeDisabled.isMinuteDisabled(minute);
                      return (
                        <Button
                          key={minute}
                          size="icon"
                          variant={active ? "default" : "ghost"}
                          className={cn(
                            "sm:w-full shrink-0 aspect-square",
                            disabled && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => !disabled && setMinute(minute)}
                          disabled={disabled}
                        >
                          {minute.toString().padStart(2, "0")}
                        </Button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Footer actions (optional, similar to many pickers) */}
          <div className="flex items-center justify-end gap-2 p-2 border-t">
            <Button type="button" variant="ghost" onClick={clear}>
              Clear
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
