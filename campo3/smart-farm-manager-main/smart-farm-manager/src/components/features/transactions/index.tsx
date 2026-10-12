"use client";

import { useState } from "react";
import { TransactionsHeader } from "./components/TransactionsHeader";
import { TransactionsBody } from "./components/TransactionsBody";
import { TransactionsAnalytics } from "./components/TransactionsAnalytics";

import { useGetTransactions } from "@/utils/hooks/api/transactions/useGetTransaction";
import { LoadingSpinner } from "@/components/ui/Spinner/Spiner";
import { ErrorPage } from "@/components/ui/Error/ErrorPage";

export const TransactionDashboard = () => {
  const { data, isFetching, error, refetch } = useGetTransactions();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  if (isFetching) return <LoadingSpinner />;

  if (error)
    return (
      <ErrorPage
        message="Failed to load transactions data."
        onRetry={() => refetch()}
      />
    );

  return (
    <>
      <TransactionsHeader onViewAnalytics={() => setAnalyticsOpen(true)} />

      <TransactionsBody data={data || []} />
      <TransactionsAnalytics
        transactions={data || []}
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />
    </>
  );
};
