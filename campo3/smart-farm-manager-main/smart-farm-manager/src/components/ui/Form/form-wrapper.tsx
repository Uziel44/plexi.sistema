import React from "react";

import { cn } from "@/lib/utils";

const FormWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    className={cn(
      "w-full border border-containerBorder p-4 rounded-md dark:bg-gray-900",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </div>
));

FormWrapper.displayName = "FormWrapper";
export { FormWrapper };
