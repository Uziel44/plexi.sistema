"use client";

import {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderContent,
  ContentHeaderDescription,
} from "@/components/ui/content-header";
import { AddCropDrawer } from "./components/AddCropDrawer";
import { Wheat, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { CropsHeaderProps } from "./types";

export const CropsHeader = ({ onViewAnalytics }: CropsHeaderProps) => {
  return (
    <ContentHeader className="mb-8 border border-gray-300 dark:border-gray-600 shadow-sm flex-row items-center">
      <div className="flex flex-col gap-2 flex-1">
        <ContentHeaderTitle className="font-semibold text-foreground">
          <Wheat className="h-5 w-5 text-primary" />
          Crop Overview
        </ContentHeaderTitle>
        <ContentHeaderDescription>
          Manage your crop inventory and track cultivation cycles. Monitor
          planting schedules, growth stages, and harvest timelines to maximize
          yield efficiency.
        </ContentHeaderDescription>
      </div>
      <ContentHeaderContent className="flex flex-row gap-2 items-center flex-shrink-0">
        <Button variant="outline" onClick={onViewAnalytics} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
        <AddCropDrawer />
      </ContentHeaderContent>
    </ContentHeader>
  );
};
