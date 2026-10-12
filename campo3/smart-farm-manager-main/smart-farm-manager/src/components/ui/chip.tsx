import { ReactNode } from "react";

import { cn } from "@/lib/utils";

const chipVariants = {
  default: "bg-gray-100 text-gray-800",
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-200 text-gray-900",
  success: "bg-green-600 text-white",
  warning: "bg-yellow-600 text-white",
  danger: "bg-red-600 text-white",
};

export type ChipProps = {
  className?: string;
  children: ReactNode;
  variant?: keyof typeof chipVariants;
};

export const Chip = ({
  children,
  variant = "default",
  className,
}: ChipProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        chipVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
