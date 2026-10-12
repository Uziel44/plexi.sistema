"use client";

import { ComponentProps } from "react";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";

import { DateTimePicker } from "../datetime-picker";
import { FormItem } from "./form";

type FormDateTimePickerProps<T extends FieldValues> = ComponentProps<"div"> & {
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  field: ControllerRenderProps<T>;
  fieldState?: ControllerFieldState;
  label?: string;
  required?: boolean;
  mode?: "date" | "time" | "datetime";
  minDate?: Date | null;
  maxDate?: Date | null;
  fullWidth?: boolean;
  // for use in the drawer
  isPopoverModal?: boolean;
};

export const FormDateTimePicker = <T extends FieldValues>({
  field,
  fieldState,
  disabled,
  disabledDate,
  mode = "date",
  isPopoverModal,
  minDate,
  maxDate,
  fullWidth,
  ...rest
}: FormDateTimePickerProps<T>) => {
  return (
    <FormItem className={cn(fullWidth && "w-full")}>
      <div className="flex flex-col gap-1">
        <DateTimePicker
          {...rest}
          minuteStep={1}
          value={(field.value as Date | null) ?? null}
          onChange={field.onChange}
          disabled={disabled || field.disabled}
          disabledDate={disabledDate}
          minDate={minDate}
          maxDate={maxDate}
          mode={mode}
          isPopoverModal={isPopoverModal}
        />
        {fieldState?.error?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldState.error.message}
          </p>
        ) : null}
      </div>
    </FormItem>
  );
};
