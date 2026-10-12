"use client";

import { useState } from "react";
import { EquipmentHeader } from "./components/EquipmentHeader";
import { EquipmentBody } from "./components/EquipmentBody";
import { EquipmentAnalytics } from "./components/EquipmentAnalytics";
import ContentWrapper from "@/components/ui/content-wrapper";
import { useGetEquipment } from "@/utils/hooks/api/equipment/useGetEquipment";
import { LoadingSpinner } from "@/components/ui/Spinner/Spiner";
import { ErrorPage } from "@/components/ui/Error/ErrorPage";

export const EquipmentDashboard = () => {
  const { data, isFetching, error, refetch } = useGetEquipment();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  if (isFetching) return <LoadingSpinner />;

  if (error)
    return (
      <ErrorPage
        message="Failed to load equipment data."
        onRetry={() => refetch()}
      />
    );

  return (
    <ContentWrapper>
      <EquipmentHeader onViewAnalytics={() => setAnalyticsOpen(true)} />
      <EquipmentBody data={data || []} />
      <EquipmentAnalytics
        equipment={data || []}
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />
    </ContentWrapper>
  );
};
