import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

async function deleteFarmer(id: string): Promise<void> {
  await apiClient(`/farmers?id=${id}`, { method: "DELETE" });
}

export function useDeleteFarmer(
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: deleteFarmer,
    ...options,
  });
}
