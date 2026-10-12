"use client";

import {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderContent,
  ContentHeaderDescription,
} from "@/components/ui/content-header";
import { AddEquipmentDrawer } from "./components/AddEquipmentDrawer";
import { Axe, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { EquipmentHeaderProps } from "./types";

export const EquipmentHeader = ({ onViewAnalytics }: EquipmentHeaderProps) => {
  return (
    <ContentHeader className="mb-8 border border-gray-300 dark:border-gray-600 shadow-sm flex-row items-center">
      <div className="flex flex-col gap-2 flex-1">
        <ContentHeaderTitle className="font-semibold text-foreground">
          <Axe className="h-5 w-5 text-primary" />
          Equipment Overview
        </ContentHeaderTitle>
        <ContentHeaderDescription>
          Manage your farm equipment efficiently — track equipment types,
          operational status, maintenance schedules, and usage history to ensure
          optimal performance and longevity of your machinery.
        </ContentHeaderDescription>
      </div>
      <ContentHeaderContent className="flex flex-row gap-2 items-center flex-shrink-0">
        <Button variant="outline" onClick={onViewAnalytics} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
        <AddEquipmentDrawer />
      </ContentHeaderContent>
    </ContentHeader>
  );
};
