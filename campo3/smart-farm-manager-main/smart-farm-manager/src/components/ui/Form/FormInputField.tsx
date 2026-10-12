import { forwardRef } from "react";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FormInputFieldProps extends React.ComponentProps<"input"> {
  label?: string;
  fullWidth?: boolean;
  required?: boolean;
}

const FormInputField = forwardRef<HTMLInputElement, FormInputFieldProps>(
  (
    { label, fullWidth = false, id, required, disabled, className, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <FormItem
        className={cn(
          disabled && "pointer-events-none opacity-50",
          className,
          !label && "gap-0"
        )}
      >
        <FormLabel>
          {label} {required && " *"}
        </FormLabel>
        <FormControl>
          <Input ref={ref} id={inputId} fullWidth={fullWidth} {...props} />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);

FormInputField.displayName = "Input";

export { FormInputField };
