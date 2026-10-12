import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

async function deleteCrop(id: string): Promise<void> {
  await apiClient(`/crops?id=${id}`, { method: "DELETE" });
}

export function useDeleteCrop(
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: deleteCrop,
    ...options,
  });
}
