"use client";

import { useState } from "react";
import { AnimalsHeader } from "./components/AnimalsHeader";
import { AnimalsBody } from "./components/AnimalsBody";
import { AnimalsAnalytics } from "./components/AnimalsAnalytics";
import ContentWrapper from "@/components/ui/content-wrapper";
import { useGetAnimals } from "@/utils/hooks/api/animals/useGetAnimals";
import { LoadingSpinner } from "@/components/ui/Spinner/Spiner";
import { ErrorPage } from "@/components/ui/Error/ErrorPage";

export const AnimalsDashboard = () => {
  const { data, isFetching, error, refetch } = useGetAnimals();
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
      <AnimalsHeader onViewAnalytics={() => setAnalyticsOpen(true)} />
      <AnimalsBody data={data || []} />

      <AnimalsAnalytics
        animals={data || []}
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />
    </ContentWrapper>
  );
};
