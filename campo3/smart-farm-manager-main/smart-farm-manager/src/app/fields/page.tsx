import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllFields } from "@/utils/hooks/api/fields/useGetFields";
import { FieldsDashboard } from "@/components/features/fields";
export default async function Fields() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["fields"],
    queryFn: getAllFields,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FieldsDashboard />
    </HydrationBoundary>
  );
}
