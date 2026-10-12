"use client";

import { FarmerHeader } from "./components/FarmerHeader";
import { FarmerBody } from "./components/FarmerBody";
import ContentWrapper from "@/components/ui/content-wrapper";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";
import { LoadingSpinner } from "@/components/ui/Spinner/Spiner";
import { ErrorPage } from "@/components/ui/Error/ErrorPage";

export const FarmersDashboard = () => {
  const { data, isFetching, error, refetch } = useFarmers();

  if (isFetching) return <LoadingSpinner />;

  if (error)
    return (
      <ErrorPage
        message="Failed to load farmers data."
        onRetry={() => refetch()}
      />
    );

  return (
    <ContentWrapper>
      <FarmerHeader />
      <FarmerBody data={data || []} />
    </ContentWrapper>
  );
};
