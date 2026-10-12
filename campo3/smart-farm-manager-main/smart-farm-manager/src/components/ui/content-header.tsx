import { Slot } from "@radix-ui/react-slot";
import React from "react";

import { cn } from "@/lib/utils";

interface ContentHeaderTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const ContentHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
});

const ContentHeaderTitle = React.forwardRef<
  HTMLParagraphElement,
  ContentHeaderTitleProps
>(({ className, children, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "h5";

  return (
    <Comp
      ref={ref}
      className={cn(
        "mb-0 text-lg max-md:mb-2 flex gap-1 items-center",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});

const ContentHeaderContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex gap-4 flex-wrap", className)} {...props}>
      {children}
    </div>
  );
});

const ContentHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex justify-between items-center max-md:flex-col max-md:items-start w-full bg-background p-4 rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ContentHeader.displayName = "ContentHeader";
ContentHeaderTitle.displayName = "ContentHeaderTitle";
ContentHeaderContent.displayName = "ContentHeaderContent";
ContentHeaderDescription.displayName = "ContentHeaderDescription";
export {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderContent,
  ContentHeaderDescription,
};
