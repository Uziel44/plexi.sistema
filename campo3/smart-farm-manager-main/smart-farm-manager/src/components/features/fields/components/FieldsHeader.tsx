"use client";

import {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderContent,
  ContentHeaderDescription,
} from "@/components/ui/content-header";
import { AddFieldDrawer } from "./components/AddFieldDrawer";
import { Grid2X2Check, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { FieldsHeaderProps } from "./types";

export const FieldsHeader = ({ onViewAnalytics }: FieldsHeaderProps) => {
  return (
    <ContentHeader className="mb-8 border border-gray-300 dark:border-gray-600 shadow-sm flex-row items-center">
      <div className="flex flex-col gap-2 flex-1">
        <ContentHeaderTitle className="font-semibold text-foreground">
          <Grid2X2Check className="h-5 w-5 text-primary" />
          Farm Field Overview
        </ContentHeaderTitle>
        <ContentHeaderDescription>
          Monitor and manage your farm fields. Track crop performance, analyze
          growth, and optimize farm operations for better yields.
        </ContentHeaderDescription>
      </div>
      <ContentHeaderContent className="flex flex-row gap-2 items-center flex-shrink-0">
        <Button variant="outline" onClick={onViewAnalytics} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
        <AddFieldDrawer />
      </ContentHeaderContent>
    </ContentHeader>
  );
};
