"use client";

import {
  ContentHeader,
  ContentHeaderTitle,
  ContentHeaderContent,
  ContentHeaderDescription,
} from "@/components/ui/content-header";
import { AddTransactionDrawer } from "./components/AddTransactionDrawer";
import { ArrowLeftRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { TransactionHeaderProps } from "./types";

export const TransactionsHeader = ({
  onViewAnalytics,
}: TransactionHeaderProps) => {
  return (
    <ContentHeader className="mb-8 border border-gray-300 dark:border-gray-600 shadow-sm flex-row items-center">
      <div className="flex flex-col gap-2 flex-1">
        <ContentHeaderTitle className="font-semibold text-foreground">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          Transactions Overview
        </ContentHeaderTitle>
        <ContentHeaderDescription>
          Manage your farm transactions efficiently — track sales, purchases,
          and financial records to ensure accurate accounting and financial
          planning for your agricultural operations.
        </ContentHeaderDescription>
      </div>
      <ContentHeaderContent className="flex flex-row gap-2 items-center flex-shrink-0">
        <Button variant="outline" onClick={onViewAnalytics} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
        <AddTransactionDrawer />
      </ContentHeaderContent>
    </ContentHeader>
  );
};
