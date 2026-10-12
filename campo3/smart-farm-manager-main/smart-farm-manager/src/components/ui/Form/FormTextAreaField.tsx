import * as React from "react";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form/form";
import { cn } from "@/lib/utils";

import { Textarea } from "../textarea";

export interface FormTextareaFieldProps
  extends React.ComponentProps<"textarea"> {
  label?: string;
  required?: boolean;
}

const FormTextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaFieldProps
>(({ label, id, required, disabled, className, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormItem
      className={cn(disabled && "pointer-events-none opacity-50", className)}
    >
      <FormLabel>
        {label} {required && " *"}
      </FormLabel>
      <FormControl>
        <Textarea ref={ref} id={inputId} {...props} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
});

FormTextAreaField.displayName = "TextArea";

export { FormTextAreaField };
