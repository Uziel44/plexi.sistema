"use client";

import {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderContent,
  ContentHeaderDescription,
} from "@/components/ui/content-header";
import { AddAnimalDrawer } from "./components/AddAnimalDrawer";
import { PawPrint, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { AnimalsHeaderProps } from "./types";

export const AnimalsHeader = ({ onViewAnalytics }: AnimalsHeaderProps) => {
  return (
    <ContentHeader className="mb-8 border border-gray-300 dark:border-gray-600 shadow-sm flex-row items-center">
      <div className="flex flex-col gap-2 flex-1">
        <ContentHeaderTitle className="font-semibold text-foreground">
          <PawPrint className="h-5 w-5 text-primary" />
          Animals Overview
        </ContentHeaderTitle>
        <ContentHeaderDescription>
          Manage your livestock efficiently — track animal species, health
          status, feeding schedules, and production performance to ensure
          optimal farm management.
        </ContentHeaderDescription>
      </div>
      <ContentHeaderContent className="flex flex-row gap-2 items-center flex-shrink-0">
        <Button variant="outline" onClick={onViewAnalytics} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
        <AddAnimalDrawer />
      </ContentHeaderContent>
    </ContentHeader>
  );
};
