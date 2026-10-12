"use client";

import {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderDescription,
} from "@/components/ui/content-header";
import { LayoutDashboard } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <ContentHeader className="mb-8 border border-gray-300 dark:border-gray-600 shadow-sm">
      <div className="flex flex-col gap-2">
        <ContentHeaderTitle className="font-semibold text-foreground">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Farm Dashboard
        </ContentHeaderTitle>
        <ContentHeaderDescription>
          Real-time overview of your farm operations — monitor fields, crops,
          livestock, equipment, and financial performance at a glance.
        </ContentHeaderDescription>
      </div>
    </ContentHeader>
  );
};
