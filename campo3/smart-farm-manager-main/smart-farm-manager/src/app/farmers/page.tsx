import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";
import { FarmersDashboard } from "@/components/features/farmers";

export default async function Farmers() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["farmers"],
    queryFn: getAllFarmers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FarmersDashboard />
    </HydrationBoundary>
  );
}
