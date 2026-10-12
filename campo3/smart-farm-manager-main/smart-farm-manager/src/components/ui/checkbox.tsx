"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useState, ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Label } from "./label";

type CheckboxProps = {
  label?: string;
  id: string;
  checked?: boolean | "indeterminate";
};

function Checkbox({
  className,
  label,
  id,
  checked = false,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root> & CheckboxProps) {
  const hasLabel = Boolean(label);
  return (
    <div className={cn("flex items-center", hasLabel ? "gap-x-2" : "")}>
      <CheckboxPrimitive.Root
        id={id}
        data-slot="checkbox"
        className={cn(
          "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        checked={checked !== "indeterminate" ? checked : true}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex text-current transition-none"
        >
          {checked === "indeterminate" ? (
            <MinusIcon className="size-3.5" />
          ) : (
            <CheckIcon className="size-3.5" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {hasLabel && (
        <Label htmlFor={id} className={props.disabled ? "opacity-50" : ""}>
          {label}
        </Label>
      )}
    </div>
  );
}

interface Option {
  id: string;
  label: string;
}

interface CheckboxGroupProps {
  options: Option[];
  onChange?: (selected: string[]) => void;
  bulkLabel?: string;
}

function CheckboxGroup({
  options,
  onChange,
  bulkLabel = "Select All",
}: CheckboxGroupProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (id: string, checked: boolean) => {
    let updated: string[];

    if (id === "__all__") {
      updated = checked
        ? Array.from(new Set([...selected, ...options.map((opt) => opt.id)]))
        : [];
    } else {
      if (selected.includes(id) && !checked) {
        updated = selected.filter((item) => item !== id);
      } else if (!selected.includes(id) && checked) {
        updated = [...selected, id];
      } else {
        updated = selected;
      }
    }

    setSelected(updated);
    onChange?.(updated);
  };

  const allSelected = selected.length === options.length;
  const partiallySelected = selected.length > 0 && !allSelected;

  const bulkCheckedState = allSelected
    ? true
    : partiallySelected
    ? "indeterminate"
    : false;

  return (
    <div className="flex flex-col gap-2 items-start justify-start">
      {/* Bulk select */}
      <Checkbox
        id="__all__"
        label={bulkLabel}
        checked={bulkCheckedState}
        onCheckedChange={(checked) => handleChange("__all__", Boolean(checked))}
        color="primary"
      />
      {/* Individual options */}
      {options.map((option) => (
        <Checkbox
          key={option.id}
          id={option.id}
          label={option.label}
          checked={selected.includes(option.id) ? true : false}
          onCheckedChange={(checked) =>
            handleChange(option.id, Boolean(checked))
          }
          color="primary"
        />
      ))}
    </div>
  );
}

export { Checkbox, CheckboxGroup };
