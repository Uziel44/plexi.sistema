import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

async function deleteField(id: string): Promise<void> {
  await apiClient(`/fields?id=${id}`, { method: "DELETE" });
}

export function useDeleteField(
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: deleteField,
    ...options,
  });
}
