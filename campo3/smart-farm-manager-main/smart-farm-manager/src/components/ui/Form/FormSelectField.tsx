import * as React from "react";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form/form";
import { Select, SelectOption } from "@/components/ui/Select";

export interface FormSelectFieldProps {
  label?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const FormSelectField = React.forwardRef<
  HTMLInputElement,
  FormSelectFieldProps
>(
  (
    { options, label, fullWidth = false, id, value, required, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const stringValue = value !== undefined ? String(value) : undefined;

    const handleSelectChange = (value: string) => {
      props.onChange?.(value);
    };

    return (
      <FormItem>
        <FormLabel>
          {label}
          {required && " *"}
        </FormLabel>
        <FormControl>
          <Select
            options={options}
            id={inputId}
            ref={ref}
            fullWidth={fullWidth}
            value={stringValue}
            onChange={handleSelectChange}
            {...props}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);

FormSelectField.displayName = "FormSelectField";
