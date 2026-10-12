import { Info } from "lucide-react";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatisticContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  tooltipContent?: string;
  severityColor?: string;
}

const StatisticWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});

const StatisticBlock = React.forwardRef<
  HTMLDivElement,
  StatisticContainerProps
>(
  (
    { children, className, title, tooltipContent, severityColor, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-4 bg-container-bg text-text-base border border-container-border rounded-lg",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {tooltipContent?.length && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} color="#5082f7" />
                </TooltipTrigger>
                <TooltipContent>{tooltipContent}</TooltipContent>
              </Tooltip>
            )}
            <p className="text-sm">{title}</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[80px] px-2 py-4 sm:px-4 sm:py-6">
          <p
            className={cn(
              "text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-center break-words",
              severityColor
            )}
          >
            {children}
          </p>
        </div>
      </div>
    );
  }
);

StatisticWrapper.displayName = "StatisticWrapper";
StatisticBlock.displayName = "StatisticBlock";

export { StatisticWrapper, StatisticBlock };
