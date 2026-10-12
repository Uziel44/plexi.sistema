import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllEquipment } from "@/utils/hooks/api/equipment/useGetEquipment";
import { EquipmentDashboard } from "@/components/features/equipment";

export default async function Equipment() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["equipment"],
    queryFn: getAllEquipment,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EquipmentDashboard />
    </HydrationBoundary>
  );
}
