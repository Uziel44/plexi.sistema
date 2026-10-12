"use client";

import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardCharts } from "./components/DashboardCharts";
import { RecentActivity } from "./components/RecentActivity";
import ContentWrapper from "@/components/ui/content-wrapper";
import { useGetFields } from "@/utils/hooks/api/fields/useGetFields";
import { useGetCrops } from "@/utils/hooks/api/crops/useGetCrops";
import { useGetAnimals } from "@/utils/hooks/api/animals/useGetAnimals";
import { useGetEquipment } from "@/utils/hooks/api/equipment/useGetEquipment";
import { useGetTransactions } from "@/utils/hooks/api/transactions/useGetTransaction";
import { LoadingSpinner } from "@/components/ui/Spinner/Spiner";
import { ErrorPage } from "@/components/ui/Error/ErrorPage";

export const Dashboard = () => {
  const {
    data: fields,
    isFetching: fieldsLoading,
    error: fieldsError,
    refetch: refetchFields,
  } = useGetFields();
  const {
    data: crops,
    isFetching: cropsLoading,
    error: cropsError,
    refetch: refetchCrops,
  } = useGetCrops();
  const {
    data: animals,
    isFetching: animalsLoading,
    error: animalsError,
    refetch: refetchAnimals,
  } = useGetAnimals();
  const {
    data: equipment,
    isFetching: equipmentLoading,
    error: equipmentError,
    refetch: refetchEquipment,
  } = useGetEquipment();
  const {
    data: transactions,
    isFetching: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useGetTransactions();

  const isLoading =
    fieldsLoading ||
    cropsLoading ||
    animalsLoading ||
    equipmentLoading ||
    transactionsLoading;

  const hasError =
    fieldsError ||
    cropsError ||
    animalsError ||
    equipmentError ||
    transactionsError;

  if (isLoading) return <LoadingSpinner />;

  if (hasError)
    return (
      <ErrorPage
        message="Failed to load dashboard data."
        onRetry={() => {
          refetchFields();
          refetchCrops();
          refetchAnimals();
          refetchEquipment();
          refetchTransactions();
        }}
      />
    );

  return (
    <ContentWrapper>
      <DashboardHeader />
      <DashboardStats
        fields={fields || []}
        crops={crops || []}
        animals={animals || []}
        equipment={equipment || []}
        transactions={transactions || []}
      />
      <DashboardCharts
        fields={fields || []}
        crops={crops || []}
        animals={animals || []}
        equipment={equipment || []}
        transactions={transactions || []}
      />
      <RecentActivity crops={crops || []} transactions={transactions || []} />
    </ContentWrapper>
  );
};
