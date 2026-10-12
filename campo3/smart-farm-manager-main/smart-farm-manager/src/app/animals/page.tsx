// ADD HERE DYNAMIC ROUTING FOR VIEW ONE ANIMAL, WHERE YOU CAN SEE DETAILED INFO ABOUT THE ANIMAL,  INCLUDING PICTURES, HEALTH RECORDS, ETC.
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { AnimalsDashboard } from "@/components/features/animals";
import { getAllAnimals } from "@/utils/hooks/api/animals/useGetAnimals";
export default async function Fields() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["animals"],
    queryFn: getAllAnimals,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnimalsDashboard />
    </HydrationBoundary>
  );
}
