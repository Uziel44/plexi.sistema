import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllCrops } from "@/utils/hooks/api/crops/useGetCrops";
import { CropsDashboard } from "@/components/features/crops";
export default async function Crops() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["crops"],
    queryFn: getAllCrops,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CropsDashboard />
    </HydrationBoundary>
  );
}
