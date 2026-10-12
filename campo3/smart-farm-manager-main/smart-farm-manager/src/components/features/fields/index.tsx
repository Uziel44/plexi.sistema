"use client";

import { useState } from "react";
import { FieldsHeader } from "./components/FieldsHeader";
import { FieldsBody } from "./components/FieldsBody";
import { FieldsAnalytics } from "./components/FieldsAnalytics";
import ContentWrapper from "@/components/ui/content-wrapper";
import { useGetFields } from "@/utils/hooks/api/fields/useGetFields";
import { LoadingSpinner } from "@/components/ui/Spinner/Spiner";
import { ErrorPage } from "@/components/ui/Error/ErrorPage";

export const FieldsDashboard = () => {
  const { data, isFetching, error, refetch } = useGetFields();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  if (isFetching) return <LoadingSpinner />;

  if (error)
    return (
      <ErrorPage
        message="Failed to load fields data."
        onRetry={() => refetch()}
      />
    );

  return (
    <ContentWrapper>
      <FieldsHeader onViewAnalytics={() => setAnalyticsOpen(true)} />
      <FieldsBody data={data || []} />
      <FieldsAnalytics
        fields={data || []}
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />
    </ContentWrapper>
  );
};
